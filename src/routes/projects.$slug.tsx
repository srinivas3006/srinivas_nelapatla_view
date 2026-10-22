import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  Leaf,
  Loader2,
} from "lucide-react";
import { portfolioContentQuery, useProject, useProjects } from "@/lib/use-portfolio";
import { categoryLabel } from "@/lib/portfolio-content";
import { projectMediaTransition } from "@/lib/motion";

export const Route = createFileRoute("/projects/$slug")({
  head: () => ({
    meta: [{ title: "Project — Srinivas Nelapatla" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioContentQuery),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <p className="font-display text-3xl">Project not found</p>
        <p className="mt-2 text-muted-foreground">It may have moved or been renamed.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <p className="font-display text-3xl">Something went wrong</p>
        <button
          onClick={reset}
          className="mt-4 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data: project, isLoading, error } = useProject(slug);
  const { data: allProjects } = useProjects();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (error) throw error;
  if (!project) throw notFound();

  const others = (allProjects ?? [])
    .filter((p) => p.slug !== project.slug && p.is_published)
    .slice(0, 3);

  const catLabel = categoryLabel(project.category);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link
            to="/"
            viewTransition
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to portfolio
          </Link>
          <Link
            to="/"
            hash="contact"
            className="hidden items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-2 text-xs text-primary hover:bg-primary hover:text-primary-foreground sm:inline-flex"
          >
            Let's talk <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary">✦ {catLabel}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-6xl">
            {project.title}
          </h1>
          {project.overview && (
            <p className="mt-5 max-w-2xl text-lg text-foreground/75">{project.overview}</p>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {project.year && <Meta icon={Calendar} label="Year" value={project.year} />}
            {project.role && <Meta icon={User} label="Role" value={project.role} />}
            {project.timeline && <Meta icon={Clock} label="Timeline" value={project.timeline} />}
          </div>
        </motion.div>

        {project.image && (
          // No entrance animation here: the card image morphs into this one
          // through the shared view-transition name.
          <div
            style={{ viewTransitionName: projectMediaTransition(project.slug) }}
            className="mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-lift"
          >
            <img
              src={project.image}
              alt={project.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-10">
            {project.problem && <Section title="The problem">{project.problem}</Section>}
            {project.solution && <Section title="The approach">{project.solution}</Section>}
            {project.tech_decisions && (
              <Section title="Tech Decisions">{project.tech_decisions}</Section>
            )}

            {project.highlights.length > 0 && (
              <div>
                <h2 className="font-display text-2xl">Highlights</h2>
                <ul className="mt-4 space-y-3">
                  {project.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-foreground/80">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {project.stack.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Stack
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.links.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <p className="text-xs uppercase tracking-wider text-primary">Links</p>
                <div className="mt-3 space-y-2">
                  {project.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      className="group flex items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground/85 hover:border-primary/40"
                    >
                      {l.label}
                      <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-lift">
              <p className="font-display italic text-lg leading-snug">
                "Code with purpose. Build with passion."
              </p>
              <p className="mt-2 text-xs opacity-80">— Srinivas</p>
              <Leaf className="absolute -right-2 -bottom-2 h-20 w-20 rotate-12 text-primary-foreground/10" />
            </div>
          </aside>
        </div>

        {others.length > 0 && (
          <div className="mt-24">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl">More projects</h2>
              <Link to="/" hash="work" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {others.map((o) => (
                <Link
                  key={o.id}
                  to="/projects/$slug"
                  params={{ slug: o.slug }}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    {o.image && (
                      <img
                        src={o.image}
                        alt={o.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-display text-sm">{o.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {o.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </p>
      <p className="mt-1.5 font-display text-base">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-3 leading-relaxed text-foreground/80 whitespace-pre-line">{children}</p>
    </div>
  );
}
