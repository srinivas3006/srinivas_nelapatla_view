import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type VisitorRole = "recruiter" | "client" | "developer" | "explorer" | null;

interface PlutoState {
  role: VisitorRole;
  setRole: (role: VisitorRole) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  hasSeenGreeting: boolean;
  setHasSeenGreeting: (hasSeen: boolean) => void;
  contactNudgeShown: boolean;
  setContactNudgeShown: (shown: boolean) => void;
  /** Speech bubble shown beside the closed chat button; null when hidden. */
  nudge: string | null;
  setNudge: (nudge: string | null) => void;
}

export const usePluto = create<PlutoState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      hasSeenGreeting: false,
      setHasSeenGreeting: (hasSeenGreeting) => set({ hasSeenGreeting }),
      contactNudgeShown: false,
      setContactNudgeShown: (contactNudgeShown) => set({ contactNudgeShown }),
      nudge: null,
      setNudge: (nudge) => set({ nudge }),
    }),
    {
      name: "pluto-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        role: state.role,
        hasSeenGreeting: state.hasSeenGreeting,
        contactNudgeShown: state.contactNudgeShown,
      }), // Only persist these
    },
  ),
);
