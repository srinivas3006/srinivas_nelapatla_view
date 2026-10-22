import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { usePluto, VisitorRole } from "../../lib/use-pluto";
import { motion, AnimatePresence } from "motion/react";
import { Bot, User, X, Send } from "lucide-react";

type Message = {
  id: string;
  sender: "pluto" | "user";
  text: string;
  options?: { label: string; action: () => void }[];
};

export function PlutoChatFlow({ onClose }: { onClose?: () => void }) {
  const { role, setRole } = usePluto();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    const handleNudge = (e: any) => {
      const msg = e.detail?.message || "Before you go — want his resume or contact info?";
      addPlutoMessage(msg, [
        { label: "Yes, email", action: () => handleClientFlow("contact") },
        { label: "View Resume", action: () => handleRecruiterFlow("resume") },
      ]);
    };
    window.addEventListener("pluto:nudge", handleNudge);
    return () => window.removeEventListener("pluto:nudge", handleNudge);
  }, []);

  useEffect(() => {
    // Initial greeting based on role
    if (!role) {
      setMessages([
        {
          id: "1",
          sender: "pluto",
          text: "Hi, I'm Pluto. I'll be your guide today! What brings you here?",
          options: [
            {
              label: "👔 I'm hiring / reviewing candidates",
              action: () => handleRoleSelect("recruiter"),
            },
            {
              label: "🤝 I'm looking to hire a freelancer",
              action: () => handleRoleSelect("client"),
            },
            { label: "💻 I'm a fellow developer", action: () => handleRoleSelect("developer") },
            { label: "👀 Just exploring", action: () => handleRoleSelect("explorer") },
          ],
        },
      ]);
    } else {
      // Re-hydrate starting message based on already selected role
      startRoleFlow(role, true);
    }
  }, [role]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev.map((m) => ({ ...m, options: undefined })),
      { id: Date.now().toString(), sender: "user", text },
    ]);
  };

  const addPlutoMessage = (text: string, options?: { label: string; action: () => void }[]) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: "pluto", text, options },
      ]);
    }, 400); // Small delay for "typing" feel
  };

  const handleRoleSelect = (selectedRole: VisitorRole) => {
    const roleLabels = {
      recruiter: "I'm hiring / reviewing candidates",
      client: "I'm looking to hire a freelancer",
      developer: "I'm a fellow developer",
      explorer: "Just exploring",
    };
    addUserMessage(roleLabels[selectedRole!]);
    setRole(selectedRole);
    startRoleFlow(selectedRole, false);
  };

  const startRoleFlow = (currentRole: VisitorRole, isRehydrating: boolean) => {
    if (isRehydrating) {
      setMessages([
        { id: "intro", sender: "pluto", text: "Welcome back! What else would you like to see?" },
      ]);
    }

    setTimeout(
      () => {
        switch (currentRole) {
          case "recruiter":
            addPlutoMessage(
              "Great — I'll keep this quick. Here's what you probably want: Srinivas's top skills, his strongest project, and his resume, all in one place.",
              [
                { label: "Show me his top 3 skills", action: () => handleRecruiterFlow("skills") },
                { label: "What's his best project?", action: () => handleRecruiterFlow("project") },
                { label: "Download resume", action: () => handleRecruiterFlow("resume") },
              ],
            );
            break;
          case "client":
            addPlutoMessage(
              "Nice to meet a potential collaborator! Srinivas has delivered freelance projects end-to-end — from build to client handoff. Want to see one?",
              [
                { label: "Show me a client project", action: () => handleClientFlow("project") },
                {
                  label: "How does he communicate?",
                  action: () => handleClientFlow("communication"),
                },
                { label: "How do I get in touch?", action: () => handleClientFlow("contact") },
              ],
            );
            break;
          case "developer":
            addPlutoMessage(
              "Ah, a fellow builder! Want the technical rundown — stack, architecture decisions, repos?",
              [
                { label: "What's the tech stack?", action: () => handleDevFlow("stack") },
                { label: "Show me the GitHub repos", action: () => handleDevFlow("repos") },
                {
                  label: "Any interesting technical challenges?",
                  action: () => handleDevFlow("challenges"),
                },
              ],
            );
            break;
          case "explorer":
          default:
            addPlutoMessage(
              "No worries, take your time! Scroll around — and if you want a shortcut, just ask me anything.",
              [
                { label: "Tell me about Srinivas", action: () => handleExplorerFlow("about") },
                { label: "Show me the projects", action: () => handleExplorerFlow("projects") },
                { label: "Surprise me", action: () => handleExplorerFlow("surprise") },
              ],
            );
            break;
        }
      },
      isRehydrating ? 0 : 400,
    );
  };

  const handleRecruiterFlow = (choice: string) => {
    const userTexts = {
      skills: "Show me his top 3 skills",
      project: "What's his best project?",
      resume: "Download resume",
    };
    addUserMessage(userTexts[choice as keyof typeof userTexts]);

    if (choice === "skills") {
      addPlutoMessage(
        "He's strongest in React/TypeScript, Node.js APIs, and backend work with Supabase — want me to show a project that proves it?",
        [
          {
            label: "Yes, show me",
            action: () => {
              addUserMessage("Yes, show me");
              addPlutoMessage("Check out the Pluto Guided Showcase in the Projects section!");
            },
          },
        ],
      );
    } else if (choice === "project") {
      addPlutoMessage(
        "His most complex project is this portfolio itself! It features a custom design system, interactive AI guide, and TanStack start. Scroll down to see it.",
      );
    } else if (choice === "resume") {
      addPlutoMessage("Here is the link to download his resume.", [
        {
          label: "Download PDF",
          action: () => {
            window.open("/resume.pdf", "_blank");
          },
        },
      ]);
    }
  };

  const handleClientFlow = (choice: string) => {
    const userTexts = {
      project: "Show me a client project",
      communication: "How does he communicate?",
      contact: "How do I get in touch?",
    };
    addUserMessage(userTexts[choice as keyof typeof userTexts]);

    if (choice === "project") {
      addPlutoMessage(
        "Here's a business website he built — fully responsive, fast-loading. Want his contact details?",
        [{ label: "Yes, contact details", action: () => handleClientFlow("contact") }],
      );
    } else if (choice === "communication") {
      addPlutoMessage(
        "He prefers Slack and email for asynchronous updates, and Zoom for weekly syncs. Very transparent about blockers.",
      );
    } else if (choice === "contact") {
      addPlutoMessage(
        "You can reach him directly at his email: [insert email] or via the contact form at the bottom of the page.",
      );
    }
  };

  const handleDevFlow = (choice: string) => {
    const userTexts = {
      stack: "What's the tech stack?",
      repos: "Show me the GitHub repos",
      challenges: "Any interesting technical challenges?",
    };
    addUserMessage(userTexts[choice as keyof typeof userTexts]);

    if (choice === "stack") {
      addPlutoMessage(
        "Currently heavily using React 19, Tailwind CSS, TanStack Router/Start, and Supabase. The full stack is listed below.",
      );
    } else if (choice === "repos") {
      addPlutoMessage("Check out his GitHub profile: github.com/srinivas3006");
    } else if (choice === "challenges") {
      addPlutoMessage(
        "One project uses an Agentic AI workflow to generate code dynamically. It required tricky state management to handle tool calls.",
      );
    }
  };

  const handleExplorerFlow = (choice: string) => {
    const userTexts = {
      about: "Tell me about Srinivas",
      projects: "Show me the projects",
      surprise: "Surprise me",
    };
    addUserMessage(userTexts[choice as keyof typeof userTexts]);

    if (choice === "about") {
      addPlutoMessage(
        "Srinivas is a passionate full-stack developer who loves building polished, performant web applications with great DX and UX.",
      );
    } else if (choice === "projects") {
      addPlutoMessage(
        "Scroll down just a bit to see the featured projects section. It highlights some of his best work.",
      );
    } else if (choice === "surprise") {
      addPlutoMessage(
        "Did you know? This chat interface was designed specifically for this portfolio to make exploring more engaging!",
      );
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText.toLowerCase();
    addUserMessage(inputText);
    setInputText("");

    setTimeout(() => {
      if (
        query.includes("react") ||
        query.includes("skill") ||
        query.includes("stack") ||
        query.includes("tech")
      ) {
        addPlutoMessage(
          "Srinivas is highly skilled in React, TypeScript, Node.js, and modern CSS frameworks like Tailwind. You can see his full stack in the Skills section!",
        );
      } else if (
        query.includes("contact") ||
        query.includes("email") ||
        query.includes("reach") ||
        query.includes("hire")
      ) {
        addPlutoMessage(
          "You can reach him directly at hello@srinivas.dev or via the contact form at the bottom of the page.",
        );
      } else if (query.includes("resume") || query.includes("cv")) {
        handleRecruiterFlow("resume");
      } else if (
        query.includes("project") ||
        query.includes("work") ||
        query.includes("portfolio") ||
        query.includes("built")
      ) {
        addPlutoMessage(
          "Scroll down to the 'Featured Projects' section to see what he's been building. His latest project features this exact AI assistant!",
        );
      } else if (query.includes("github") || query.includes("repo") || query.includes("code")) {
        addPlutoMessage(
          "Check out his GitHub profile: github.com/srinivas3006 to see his open source work and live stats.",
        );
      } else {
        addPlutoMessage(
          "That's an interesting question! For specifics like that, it's best to reach out to Srinivas directly via the Contact section. Can I help you with anything else?",
          [
            { label: "Show skills", action: () => handleRecruiterFlow("skills") },
            { label: "Contact info", action: () => handleClientFlow("contact") },
          ],
        );
      }
    }, 400);
  };

  return (
    <div className="flex h-full flex-col bg-card rounded-xl overflow-hidden border border-muted-foreground/20 shadow-lift">
      {/* Header */}
      <div className="flex items-center justify-between bg-secondary p-3 text-secondary-foreground">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold font-display">Pluto</h3>
            <p className="text-xs text-secondary-foreground/70">Your Portfolio Guide</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} data-lenis-prevent className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`flex items-end gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full ${msg.sender === "user" ? "bg-gray-300" : "bg-secondary text-secondary-foreground"}`}
                >
                  {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm ${msg.sender === "user" ? "bg-secondary text-secondary-foreground rounded-br-sm" : "bg-white text-foreground rounded-bl-sm shadow-sm"}`}
                >
                  {msg.text}
                </div>
              </div>

              {/* Options */}
              {msg.options && (
                <div className="mt-3 flex flex-wrap gap-2 pl-8">
                  {msg.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                      onClick={opt.action}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-primary text-primary hover:bg-primary hover:text-background transition-colors"
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Free-form Input */}
      <form
        onSubmit={handleInputSubmit}
        className="border-t border-muted-foreground/20 bg-white p-3 flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white disabled:opacity-50 transition-opacity"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
