import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";
import { checkAdminAuth } from "./auth";

export const saveSiteContent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      key: z.string(),
      value: z.any(),
    }),
  )
  .handler(async ({ data }) => {
    // Verify authentication
    const auth = await checkAdminAuth();
    if (!auth.isAuthenticated) {
      throw new Error("Unauthorized");
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("site_content").upsert(
      {
        key: data.key,
        value: data.value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  });

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseAdmin();
  // Bounded wait: page rendering awaits this, so a slow or unreachable
  // database falls back to default content instead of stalling the page.
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .abortSignal(AbortSignal.timeout(1500));

  if (error) {
    console.error("Failed to fetch site content from DB", error);
    return [];
  }

  return data;
});

export const uploadMedia = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fileName: z.string(),
      fileType: z.string(),
      base64Data: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const auth = await checkAdminAuth();
    if (!auth.isAuthenticated) {
      throw new Error("Unauthorized");
    }

    const supabase = getSupabaseAdmin();

    // Extract base64 content
    const base64Content = data.base64Data.split(";base64,").pop();
    if (!base64Content) throw new Error("Invalid base64 data");

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, "base64");

    const { data: uploadData, error } = await supabase.storage
      .from("portfolio-media")
      .upload(`admin-uploads/${data.fileName}`, buffer, {
        contentType: data.fileType,
        upsert: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("portfolio-media").getPublicUrl(uploadData.path);

    return { url: publicUrl };
  });
