// Single source of truth for portfolio content shape + defaults.
// The admin dashboard stores overrides in the `site_content` table
// keyed by section name; rendered pages merge defaults <- DB overrides.

import srinivas from "@/assets/srinivas.webp";
import { PROJECTS } from "./projects-data";

export type DbProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  year: string;
  role: string;
  timeline: string;
  overview: string;
  problem: string;
  solution: string;
  tech_decisions: string;
  highlights: string[];
  stack: string[];
  links: { label: string; href: string }[];
  sort_order: number;
  is_published: boolean;
  /** Optional short muted clip (mp4/webm URL) previewed on card hover. */
  video?: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  web: "Web Apps",
  apps: "Apps",
  data: "Data Projects",
  tool: "Tools",
  tools: "Tools",
};

// Human label for a project's free-text category (falls back to Title Case).
export function categoryLabel(category: string) {
  const key = category.trim().toLowerCase();
  return CATEGORY_LABELS[key] ?? key.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export type CtaLink = { label: string; href: string };

export type HeroContent = {
  eyebrow: string;
  headlinePrefix: string;
  italicWords: [string, string, string];
  headlineSuffix: string;
  subhead: string;
  primaryCta: CtaLink;
  secondaryCta?: CtaLink;
  exploring: string[];
  plutoIntroTitle: string;
  plutoIntroSub: string;
  imageUrl: string; // empty => default bundled asset
};

export type AboutCard = { icon: string; title: string; sub: string };
export type AboutStat = { n: string; l: string };
export type AboutContent = {
  heading: string;
  italicWord: string;
  paragraphs: string[];
  cards: AboutCard[];
  stats: AboutStat[];
  quote: string;
  quoteAuthor: string;
};

export type SkillGroup = {
  icon: string;
  title: string;
  items: { name: string; level: number }[];
};

export type JourneyItem = { icon: string; year: string; title: string; body: string };
export type StoryItem = { icon: string; title: string; desc: string };

export type ContactContent = {
  eyebrow: string;
  heading: string;
  italicWord: string;
  sub: string;
  email: string;
  github: string;
  githubUsername: string;
  linkedin: string;
  footer: string;
  copyright: string;
};

export type SectionHints = {
  home: string;
  about: string;
  skills: string;
  work: string;
  experience: string;
  stories: string;
  contact: string;
};

export type PortfolioContent = {
  hero: HeroContent;
  about: AboutContent;
  skills: SkillGroup[];
  journey: JourneyItem[];
  stories: StoryItem[];
  contact: ContactContent;
  hints: SectionHints;
  projects: DbProject[];
};

// ─────────── defaults ───────────

export const DEFAULT_HERO: HeroContent = {
  eyebrow: "CSE GRADUATE · BUILDER · LEARNER",
  headlinePrefix: "I build",
  italicWords: ["clean,", "scalable", "meaningful"],
  headlineSuffix: "digital solutions.",
  subhead:
    "A motivated Computer Science graduate with hands-on experience in building scalable backend systems and web applications.",
  primaryCta: { label: "Explore My Work", href: "#work" },
  secondaryCta: { label: "Download Resume", href: "/srinivas-nelapatla-resume.pdf" },
  exploring: ["Django REST", "Vue.js", "AI Tools"],
  plutoIntroTitle: "Hi! I'm Pluto",
  plutoIntroSub: "I'll be your guide today!",
  imageUrl: "",
};

export const DEFAULT_ABOUT: AboutContent = {
  heading: "A little bit",
  italicWord: "about",
  paragraphs: [
    "I'm a Computer Science Engineer (2024) with a strong foundation in Data Structures, Algorithms, and Object-Oriented Programming. I have hands-on experience building web applications and REST APIs, and I love turning ideas into reliable software solutions.",
    "My journey spans from Mechanical Engineering to Computer Science, showing my adaptability and quick learning skills. I enjoy solving problems, building clean systems, and continuously learning modern development and AI-assisted practices.",
  ],
  cards: [
    { icon: "GraduationCap", title: "B.Tech CSE", sub: "SVEC (2021-2024)" },
    { icon: "Briefcase", title: "Backend Intern", sub: "Swalook Global" },
    { icon: "Code2", title: "Web Developer", sub: "Vue & Django" },
  ],
  stats: [
    { n: "7.59", l: "B.Tech CGPA" },
    { n: "6+", l: "Months Experience" },
    { n: "2+", l: "Major Projects" },
  ],
  quote: "Design, develop and deliver reliable software solutions while continuously learning.",
  quoteAuthor: "Srinivas",
};

export const DEFAULT_SKILLS: SkillGroup[] = [
  {
    icon: "Code2",
    title: "Programming & Web",
    items: [
      { name: "Python", level: 90 },
      { name: "JavaScript", level: 85 },
      { name: "Vue.js", level: 80 },
      { name: "HTML5 & CSS", level: 85 },
    ],
  },
  {
    icon: "Layers",
    title: "Backend & API",
    items: [
      { name: "Django REST (DRF)", level: 85 },
      { name: "REST APIs", level: 90 },
      { name: "Data Structures & Algos", level: 80 },
      { name: "OOP", level: 85 },
    ],
  },
  {
    icon: "Database",
    title: "Databases",
    items: [
      { name: "SQL", level: 85 },
      { name: "DBMS Concepts", level: 80 },
    ],
  },
  {
    icon: "Wrench",
    title: "Tools & AI",
    items: [
      { name: "Git & GitHub", level: 90 },
      { name: "Postman", level: 85 },
      { name: "Prompt Engineering", level: 80 },
      { name: "AI Tools", level: 75 },
    ],
  },
];

export const DEFAULT_JOURNEY: JourneyItem[] = [
  {
    icon: "Briefcase",
    year: "Oct 2025 — Apr 2026",
    title: "Backend Developer Intern",
    body: "Swalook Global Private Limited (Remote). Developed backend functionality using Django REST Framework and optimized API responses.",
  },
  {
    icon: "GraduationCap",
    year: "2021 — 2024",
    title: "B.Tech CSE",
    body: "SVEC. Graduated with 7.59 CGPA, focusing on CS fundamentals and software development.",
  },
  {
    icon: "Target",
    year: "2018 — 2021",
    title: "Diploma Mechanical Eng.",
    body: "Government Polytechnic College. Graduated with 8.35 CGPA.",
  },
];

export const DEFAULT_STORIES: StoryItem[] = [
  {
    icon: "Layers",
    title: "Backend at scale",
    desc: "Queues, caching layers, and the calm of a system that just works at 3am.",
  },
  {
    icon: "Sparkles",
    title: "Quiet UI design",
    desc: "Interfaces that respect attention — less ornament, more intention.",
  },
  {
    icon: "LineChart",
    title: "Data-driven apps",
    desc: "Making analytics feel like a conversation, not a spreadsheet.",
  },
];

export const DEFAULT_CONTACT: ContactContent = {
  eyebrow: "✦ Contact",
  heading: "Let's build something",
  italicWord: "meaningful",
  sub: "Open to Fresher Software Engineer roles, thoughtful projects, and collaborations in Hyderabad or remote.",
  email: "srinivasnelapatla22@gmail.com",
  github: "https://github.com/srinivas3006",
  githubUsername: "srinivas3006",
  linkedin: "https://linkedin.com/in/srinivas3006",
  footer: "Let's build something amazing together!",
  copyright: "© 2024 Srinivas Nelapatla. All rights reserved.",
};

export const DEFAULT_HINTS: SectionHints = {
  home: "Hi! I'm Pluto. Let me walk you through Srinivas' world.",
  about: "Here's a glimpse into who he is 🌱",
  skills: "These are the tools he builds with 🛠️",
  work: "And these are the things he's actually shipped 🚀",
  experience: "A short story of how he got here 🌿",
  stories: "Lately, he's been curious about these ✨",
  contact: "Liked what you saw? Say hi — he reads every message 💌",
};

export const DEFAULTS: PortfolioContent = {
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  skills: DEFAULT_SKILLS,
  journey: DEFAULT_JOURNEY,
  stories: DEFAULT_STORIES,
  contact: DEFAULT_CONTACT,
  hints: DEFAULT_HINTS,
  projects: PROJECTS,
};

export const DEFAULT_HERO_IMAGE = srinivas;

// Allowed icon names used across content. Keeps the bundle deterministic.
export const ICON_OPTIONS = [
  "Code2",
  "Database",
  "LineChart",
  "Layers",
  "Wrench",
  "GraduationCap",
  "Sprout",
  "Sparkles",
  "Briefcase",
  "Target",
  "BookOpen",
  "Rocket",
  "Leaf",
  "Mail",
  "Github",
  "Linkedin",
] as const;
export type IconName = (typeof ICON_OPTIONS)[number];
