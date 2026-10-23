import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";
import { checkAdminAuth } from "./auth";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Email a copy of a new message via Resend, when RESEND_API_KEY and
 * CONTACT_NOTIFY_EMAIL are configured. Never fails the submission.
 */
async function notifyByEmail(msg: { name: string; email: string; message: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!apiKey || !to) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: msg.email,
        subject: `New portfolio message from ${msg.name}`,
        html: `<p><strong>${escapeHtml(msg.name)}</strong> &lt;${escapeHtml(msg.email)}&gt; wrote:</p><p style="white-space:pre-wrap">${escapeHtml(msg.message || "(no message)")}</p>`,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("Contact email failed", res.status, await res.text());
  } catch (e) {
    console.error("Contact email failed", e);
  }
}

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().trim().min(1).max(120),
      email: z.string().trim().email().max(254),
      message: z.string().trim().max(5000),
      // Honeypot: hidden from people, but naive bots fill it in.
      hp_field: z.string().max(0).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });

    if (error) {
      console.error("Failed to save contact message", error);
      throw new Error("Could not send message");
    }

    await notifyByEmail(data);
    return { success: true };
  });

async function requireAdmin() {
  const auth = await checkAdminAuth();
  if (!auth.isAuthenticated) throw new Error("Unauthorized");
}

export const listContactMessages = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { data, error } = await getSupabaseAdmin()
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data as ContactMessage[];
});

export const setContactMessageRead = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid(), isRead: z.boolean() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin()
      .from("contact_messages")
      .update({ is_read: data.isRead })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteContactMessage = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin().from("contact_messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
