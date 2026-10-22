import {
  Code2,
  Database,
  LineChart,
  Layers,
  Wrench,
  GraduationCap,
  Sprout,
  Sparkles,
  Briefcase,
  Target,
  BookOpen,
  Rocket,
  Leaf,
  Mail,
  Github,
  Linkedin,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Code2,
  Database,
  LineChart,
  Layers,
  Wrench,
  GraduationCap,
  Sprout,
  Sparkles,
  Briefcase,
  Target,
  BookOpen,
  Rocket,
  Leaf,
  Mail,
  Github,
  Linkedin,
};

export function getIcon(name: string | undefined | null): LucideIcon {
  if (name && MAP[name]) return MAP[name];
  return Sparkles;
}
