import React from "react";
import { motion } from "motion/react";
import { Bot } from "lucide-react";
import { usePluto, VisitorRole } from "../../lib/use-pluto";

export function PlutoInlineGreeting() {
  const { role, setRole, setIsOpen, hasSeenGreeting, setHasSeenGreeting } = usePluto();

  if (hasSeenGreeting && role) {
    return null; // Hide after interaction
  }

  const handleRoleSelect = (selectedRole: VisitorRole) => {
    setRole(selectedRole);
    setHasSeenGreeting(true);
    setIsOpen(true); // Open the floating widget to continue the conversation
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center p-5 rounded-2xl bg-card border border-muted-foreground/20 shadow-soft max-w-2xl"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm animate-float-soft">
        <Bot size={24} />
      </div>

      <div className="flex-1 space-y-3">
        <p className="text-sm font-medium text-foreground">
          Hi, I'm <span className="font-display font-semibold text-primary">Pluto</span> I'll be
          your guide today! What brings you here?
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleRoleSelect("recruiter")}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-primary/30 text-secondary hover:bg-primary hover:text-background hover:border-primary transition-all"
          >
            👔 I'm hiring / reviewing candidates
          </button>
          <button
            onClick={() => handleRoleSelect("client")}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-primary/30 text-secondary hover:bg-primary hover:text-background hover:border-primary transition-all"
          >
            🤝 I'm looking to hire a freelancer
          </button>
          <button
            onClick={() => handleRoleSelect("developer")}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-primary/30 text-secondary hover:bg-primary hover:text-background hover:border-primary transition-all"
          >
            💻 I'm a fellow developer
          </button>
          <button
            onClick={() => handleRoleSelect("explorer")}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-primary/30 text-secondary hover:bg-primary hover:text-background hover:border-primary transition-all"
          >
            👀 Just exploring
          </button>
        </div>
      </div>
    </motion.div>
  );
}
