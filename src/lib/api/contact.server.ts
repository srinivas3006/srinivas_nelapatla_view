import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

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

    return { success: true };
  });
