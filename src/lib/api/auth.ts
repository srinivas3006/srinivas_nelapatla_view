import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";
import { getServerConfig } from "../config.server";

const AUTH_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 1 week, in seconds

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

// The session token is `<expiry>.<hmac(expiry)>`, signed with the admin
// password. It can't be forged without the password, and changing the
// password invalidates every existing session.
function sign(expiry: string, secret: string) {
  return createHmac("sha256", secret).update(`admin:${expiry}`).digest("base64url");
}

function createSessionToken(secret: string) {
  const expiry = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expiry}.${sign(expiry, secret)}`;
}

function isValidSessionToken(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return false;
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature || Number(expiry) < Date.now()) return false;
  return safeEqual(signature, sign(expiry, secret));
}

export const loginAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    const config = getServerConfig();

    if (!config.adminPassword || !safeEqual(data.password, config.adminPassword)) {
      throw new Error("Invalid password");
    }

    setCookie(AUTH_COOKIE_NAME, createSessionToken(config.adminPassword), {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return { success: true };
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(AUTH_COOKIE_NAME);
  return { success: true };
});

export const checkAdminAuth = createServerFn({ method: "GET" }).handler(async () => {
  const config = getServerConfig();
  return {
    isAuthenticated: isValidSessionToken(getCookie(AUTH_COOKIE_NAME), config.adminPassword),
  };
});
