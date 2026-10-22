import { useEffect, useRef, useState, type FormEvent } from "react";
import { Github, Linkedin, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePluto } from "@/lib/use-pluto";
import { submitContactMessage } from "@/lib/api/contact.server";
import type { PortfolioContent } from "@/lib/portfolio-content";

export function Contact({ contact }: { contact: PortfolioContent["contact"] }) {
  const contactRef = useRef<HTMLElement>(null);
  const [sending, setSending] = useState(false);
  const { contactNudgeShown, setContactNudgeShown, isOpen, setNudge } = usePluto();

  // Once per session, Pluto offers help from a bubble by the chat button
  // (it no longer pops the whole chat open over the form).
  useEffect(() => {
    if (contactNudgeShown || isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setContactNudgeShown(true);
          setNudge("Before you go — want his resume or contact info?");
        }
      },
      { threshold: 0.5 },
    );

    if (contactRef.current) observer.observe(contactRef.current);
    return () => observer.disconnect();
  }, [contactNudgeShown, isOpen, setContactNudgeShown, setNudge]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = new FormData(form);
    setSending(true);
    try {
      await submitContactMessage({
        data: {
          name: String(fields.get("name") ?? ""),
          email: String(fields.get("email") ?? ""),
          message: String(fields.get("message") ?? ""),
          hp_field: String(fields.get("hp_field") ?? ""),
        },
      });
      toast.success("Thanks! I'll get back to you soon 🌿");
      form.reset();
    } catch {
      toast.error(`Couldn't send right now — please email me at ${contact.email}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" ref={contactRef} className="py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{contact.eyebrow}</p>
          <h2 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">
            {contact.heading} <em className="italic text-primary">{contact.italicWord}</em>.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-foreground/70">{contact.sub}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <form
            data-path-end
            onSubmit={onSubmit}
            className="mx-auto mt-10 grid max-w-xl gap-4 rounded-3xl border border-border bg-card p-8 text-left shadow-soft"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="name"
                placeholder="Your name"
                aria-label="Your name"
                required
                maxLength={120}
                className="h-12 rounded-xl bg-background"
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                aria-label="Email"
                required
                className="h-12 rounded-xl bg-background"
              />
            </div>
            <Textarea
              name="message"
              placeholder="Tell me about your project…"
              aria-label="Message"
              rows={5}
              maxLength={5000}
              className="rounded-xl bg-background"
            />
            <input
              name="hp_field"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <Button
              type="submit"
              disabled={sending}
              className="mt-2 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
            </Button>
          </form>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              <span>{contact.email}</span>
            </a>
            <a
              href={contact.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
