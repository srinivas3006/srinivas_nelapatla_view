import { Leaf } from "lucide-react";
import type { PortfolioContent } from "@/lib/portfolio-content";

export function Footer({ contact }: { contact: PortfolioContent["contact"] }) {
  return (
    <footer className="border-t border-border bg-primary/5 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground sm:flex-row">
        <p className="flex items-center gap-2">
          <Leaf className="h-3.5 w-3.5 text-primary" />
          {contact.footer}
        </p>
        <p>{contact.copyright}</p>
      </div>
    </footer>
  );
}
