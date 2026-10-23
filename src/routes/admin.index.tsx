import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { checkAdminAuth, logoutAdmin } from "../lib/api/auth";
import { useState, useEffect } from "react";
import { usePortfolioContent } from "../lib/use-portfolio";
import { LogOut, Save, Plus, Trash2, X } from "lucide-react";
import { saveSiteContent } from "../lib/api/content.server";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from "../components/ImageUploader";
import { MessagesTab } from "../components/admin/MessagesTab";
import { PortfolioContent, DEFAULTS, ICON_OPTIONS } from "../lib/portfolio-content";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const auth = await checkAdminAuth();
    if (!auth.isAuthenticated) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const router = useRouter();
  const { data: serverContent, isLoading } = usePortfolioContent();

  // We maintain the entire portfolio state here
  const [content, setContent] = useState<PortfolioContent>(DEFAULTS);

  useEffect(() => {
    if (serverContent) {
      // Merge server overrides into defaults
      setContent(serverContent);
    }
  }, [serverContent]);

  const handleLogout = async () => {
    await logoutAdmin();
    router.navigate({ to: "/" });
  };

  const handleSave = async () => {
    try {
      // Save each top-level key to the site_content table
      for (const [key, value] of Object.entries(content)) {
        await saveSiteContent({
          data: { key, value },
        });
      }
      toast.success("Done! Your changes have been saved.");
      router.invalidate();
    } catch (e: unknown) {
      toast.error("Failed to save: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="font-display text-xl font-semibold text-foreground">Portfolio Admin</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4" /> Save Changes
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 mt-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <Tabs defaultValue="hero" className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger value="hero">Hero Section</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="stories">Stories</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="hints">Pluto Hints</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>

            {/* HERO TAB */}
            <TabsContent value="hero" className="space-y-6 focus:outline-none">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Eyebrow Text</label>
                    <input
                      type="text"
                      value={content.hero.eyebrow}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, eyebrow: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Headline Prefix</label>
                    <input
                      type="text"
                      value={content.hero.headlinePrefix}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, headlinePrefix: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Subheadline</label>
                    <textarea
                      value={content.hero.subhead}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, subhead: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-24"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Italic Words (comma separated)</label>
                    <input
                      type="text"
                      value={content.hero.italicWords.join(", ")}
                      onChange={(e) => {
                        const words = e.target.value.split(",").map((s) => s.trim());
                        setContent({
                          ...content,
                          hero: { ...content.hero, italicWords: [words[0] || "", words[1] || "", words[2] || ""] },
                        })
                      }}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Headline Suffix</label>
                    <input
                      type="text"
                      value={content.hero.headlineSuffix}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, headlineSuffix: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Exploring Topics (comma separated)</label>
                    <input
                      type="text"
                      value={content.hero.exploring.join(", ")}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, exploring: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) },
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-foreground">Pluto Intro Title</label>
                      <input
                        type="text"
                        value={content.hero.plutoIntroTitle}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, plutoIntroTitle: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-foreground">Pluto Intro Subtitle</label>
                      <input
                        type="text"
                        value={content.hero.plutoIntroSub}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, plutoIntroSub: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <ImageUploader
                    label="Profile/Hero Image"
                    value={content.hero.imageUrl}
                    onChange={(url) =>
                      setContent({ ...content, hero: { ...content.hero, imageUrl: url } })
                    }
                  />

                  <div className="pt-4">
                    <label className="text-sm font-medium text-foreground">Primary CTA Label</label>
                    <input
                      type="text"
                      value={content.hero.primaryCta.label}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: {
                            ...content.hero,
                            primaryCta: { ...content.hero.primaryCta, label: e.target.value },
                          },
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Resume button label
                      </label>
                      <input
                        type="text"
                        value={content.hero.secondaryCta?.label ?? ""}
                        placeholder="Leave empty to hide the button"
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: {
                              ...content.hero,
                              secondaryCta: {
                                href: content.hero.secondaryCta?.href ?? "",
                                label: e.target.value,
                              },
                            },
                          })
                        }
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Resume link</label>
                      <input
                        type="text"
                        value={content.hero.secondaryCta?.href ?? ""}
                        placeholder="/srinivas-nelapatla-resume.pdf"
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: {
                              ...content.hero,
                              secondaryCta: {
                                label: content.hero.secondaryCta?.label ?? "",
                                href: e.target.value,
                              },
                            },
                          })
                        }
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ABOUT TAB */}
            <TabsContent value="about" className="space-y-6 focus:outline-none">
              <div>
                <label className="text-sm font-medium text-foreground">Heading</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={content.about.heading}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        about: { ...content.about, heading: e.target.value },
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="text"
                    placeholder="Italic word"
                    value={content.about.italicWord}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        about: { ...content.about, italicWord: e.target.value },
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm italic focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Paragraphs</label>
                <textarea
                  value={content.about.paragraphs.join("\n\n")}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      about: { ...content.about, paragraphs: e.target.value.split("\n\n") },
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-48"
                  placeholder="Separate paragraphs with double newlines"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Quote & Author</label>
                <textarea
                  value={content.about.quote}
                  onChange={(e) =>
                    setContent({ ...content, about: { ...content.about, quote: e.target.value } })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-24"
                />
                <input
                  type="text"
                  value={content.about.quoteAuthor}
                  placeholder="Author"
                  onChange={(e) =>
                    setContent({ ...content, about: { ...content.about, quoteAuthor: e.target.value } })
                  }
                  className="mt-2 w-full md:w-1/3 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">About Cards</label>
                <div className="grid gap-4 mt-2 md:grid-cols-3">
                  {content.about.cards.map((card, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Icon</label>
                        <select
                          value={card.icon}
                          onChange={(e) => {
                            const newCards = [...content.about.cards];
                            newCards[idx].icon = e.target.value;
                            setContent({ ...content, about: { ...content.about, cards: newCards } });
                          }}
                          className="w-full bg-background border border-input rounded-md px-2 py-1 text-sm mt-1"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Title</label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const newCards = [...content.about.cards];
                            newCards[idx].title = e.target.value;
                            setContent({ ...content, about: { ...content.about, cards: newCards } });
                          }}
                          className="w-full bg-background border border-input rounded-md px-2 py-1 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Subtitle</label>
                        <input
                          type="text"
                          value={card.sub}
                          onChange={(e) => {
                            const newCards = [...content.about.cards];
                            newCards[idx].sub = e.target.value;
                            setContent({ ...content, about: { ...content.about, cards: newCards } });
                          }}
                          className="w-full bg-background border border-input rounded-md px-2 py-1 text-sm mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Stats</label>
                  <button
                    onClick={() => {
                      setContent({
                        ...content,
                        about: { ...content.about, stats: [...content.about.stats, { n: "0", l: "New Stat" }] }
                      });
                    }}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add Stat
                  </button>
                </div>
                <div className="grid gap-4 mt-2 md:grid-cols-4">
                  {content.about.stats.map((stat, idx) => (
                    <div key={idx} className="flex gap-2 p-3 rounded-lg border border-border bg-muted/20 relative group">
                      <button
                        onClick={() => {
                          const newStats = [...content.about.stats];
                          newStats.splice(idx, 1);
                          setContent({ ...content, about: { ...content.about, stats: newStats } });
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <input
                        type="text"
                        value={stat.n}
                        onChange={(e) => {
                          const newStats = [...content.about.stats];
                          newStats[idx].n = e.target.value;
                          setContent({ ...content, about: { ...content.about, stats: newStats } });
                        }}
                        className="w-1/3 bg-background border border-input rounded-md px-2 py-1 text-sm font-bold text-center"
                      />
                      <input
                        type="text"
                        value={stat.l}
                        onChange={(e) => {
                          const newStats = [...content.about.stats];
                          newStats[idx].l = e.target.value;
                          setContent({ ...content, about: { ...content.about, stats: newStats } });
                        }}
                        className="w-2/3 bg-background border border-input rounded-md px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* SKILLS TAB */}
            <TabsContent value="skills" className="space-y-6 focus:outline-none">
              <p className="text-sm text-muted-foreground">
                Manage your skill categories and levels here.
              </p>

              <div className="space-y-6">
                {content.skills.map((group, groupIndex) => (
                  <div key={groupIndex} className="p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex justify-between items-center mb-4">
                      <input
                        type="text"
                        value={group.title}
                        onChange={(e) => {
                          const newSkills = [...content.skills];
                          newSkills[groupIndex].title = e.target.value;
                          setContent({ ...content, skills: newSkills });
                        }}
                        className="font-medium bg-transparent border-b border-dashed border-muted-foreground/50 focus:border-primary focus:outline-none px-1"
                      />
                      <button
                        onClick={() => {
                          const newSkills = content.skills.filter((_, i) => i !== groupIndex);
                          setContent({ ...content, skills: newSkills });
                        }}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex gap-2 items-center bg-background p-2 rounded border border-border/50"
                        >
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const newSkills = [...content.skills];
                              newSkills[groupIndex].items[itemIndex].name = e.target.value;
                              setContent({ ...content, skills: newSkills });
                            }}
                            className="w-full text-sm bg-transparent focus:outline-none"
                            placeholder="Skill name"
                          />
                          <input
                            type="number"
                            value={item.level}
                            min="0"
                            max="100"
                            onChange={(e) => {
                              const newSkills = [...content.skills];
                              newSkills[groupIndex].items[itemIndex].level =
                                parseInt(e.target.value) || 0;
                              setContent({ ...content, skills: newSkills });
                            }}
                            className="w-16 text-sm bg-muted px-2 py-1 rounded focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const newSkills = [...content.skills];
                              newSkills[groupIndex].items = group.items.filter(
                                (_, i) => i !== itemIndex,
                              );
                              setContent({ ...content, skills: newSkills });
                            }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newSkills = [...content.skills];
                          newSkills[groupIndex].items.push({ name: "New Skill", level: 50 });
                          setContent({ ...content, skills: newSkills });
                        }}
                        className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-dashed border-border rounded p-2"
                      >
                        <Plus className="h-3 w-3" /> Add Skill
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setContent({
                      ...content,
                      skills: [
                        ...content.skills,
                        { icon: "Code2", title: "New Category", items: [] },
                      ],
                    });
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Category
                </button>
              </div>
            </TabsContent>

            {/* EXPERIENCE TAB */}
            <TabsContent value="experience" className="space-y-6 focus:outline-none">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Manage your experience timeline.</p>
                <button
                  onClick={() => {
                    setContent({
                      ...content,
                      journey: [
                        {
                          icon: "Briefcase",
                          year: "New Year",
                          title: "New Role",
                          body: "Description",
                        },
                        ...content.journey,
                      ],
                    });
                  }}
                  className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Experience
                </button>
              </div>
              <div className="space-y-4">
                {content.journey.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 relative group"
                  >
                    <button
                      onClick={() => {
                        const newJourney = [...content.journey];
                        newJourney.splice(idx, 1);
                        setContent({ ...content, journey: newJourney });
                      }}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-foreground">Icon</label>
                        <select
                          value={item.icon}
                          onChange={(e) => {
                            const newJourney = [...content.journey];
                            newJourney[idx].icon = e.target.value;
                            setContent({ ...content, journey: newJourney });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">
                          Year / Timeline
                        </label>
                        <input
                          type="text"
                          value={item.year}
                          onChange={(e) => {
                            const newJourney = [...content.journey];
                            newJourney[idx].year = e.target.value;
                            setContent({ ...content, journey: newJourney });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Title / Role</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newJourney = [...content.journey];
                            newJourney[idx].title = e.target.value;
                            setContent({ ...content, journey: newJourney });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">Description</label>
                      <textarea
                        value={item.body}
                        onChange={(e) => {
                          const newJourney = [...content.journey];
                          newJourney[idx].body = e.target.value;
                          setContent({ ...content, journey: newJourney });
                        }}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* STORIES TAB */}
            <TabsContent value="stories" className="space-y-6 focus:outline-none">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Manage your short stories / highlights.
                </p>
                <button
                  onClick={() => {
                    setContent({
                      ...content,
                      stories: [
                        { icon: "Sparkles", title: "New Story", desc: "Description" },
                        ...content.stories,
                      ],
                    });
                  }}
                  className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Story
                </button>
              </div>
              <div className="space-y-4">
                {content.stories.map((story, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 relative group"
                  >
                    <button
                      onClick={() => {
                        const newStories = [...content.stories];
                        newStories.splice(idx, 1);
                        setContent({ ...content, stories: newStories });
                      }}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-foreground">Icon</label>
                        <select
                          value={story.icon}
                          onChange={(e) => {
                            const newStories = [...content.stories];
                            newStories[idx].icon = e.target.value;
                            setContent({ ...content, stories: newStories });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Title</label>
                        <input
                          type="text"
                          value={story.title}
                          onChange={(e) => {
                            const newStories = [...content.stories];
                            newStories[idx].title = e.target.value;
                            setContent({ ...content, stories: newStories });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">Description</label>
                      <textarea
                        value={story.desc}
                        onChange={(e) => {
                          const newStories = [...content.stories];
                          newStories[idx].desc = e.target.value;
                          setContent({ ...content, stories: newStories });
                        }}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* PROJECTS TAB */}
            <TabsContent value="projects" className="space-y-6 focus:outline-none">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Manage your portfolio projects.</p>
                <button
                  onClick={() => {
                    const newProj = {
                      id: "proj-" + Date.now(),
                      slug: "new-project",
                      title: "New Project",
                      description: "",
                      image: "",
                      tags: [],
                      category: "web",
                      year: "2024",
                      role: "Developer",
                      timeline: "1 week",
                      overview: "",
                      problem: "",
                      solution: "",
                      tech_decisions: "",
                      highlights: [],
                      stack: [],
                      links: [],
                      sort_order: content.projects.length + 1,
                      is_published: true,
                    };
                    setContent({
                      ...content,
                      projects: [newProj, ...content.projects],
                    });
                  }}
                  className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Project
                </button>
              </div>
              <div className="space-y-6">
                {content.projects?.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 relative group"
                  >
                    <button
                      onClick={() => {
                        const newProjects = [...content.projects];
                        newProjects.splice(idx, 1);
                        setContent({ ...content, projects: newProjects });
                      }}
                      className="absolute top-6 right-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-foreground">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].title = e.target.value;
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Slug (URL)</label>
                        <input
                          type="text"
                          value={proj.slug}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].slug = e.target.value;
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-foreground">
                          Short Description
                        </label>
                        <input
                          type="text"
                          value={proj.description}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].description = e.target.value;
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <ImageUploader
                          label="Project Image"
                          value={proj.image}
                          onChange={(url) => {
                            const newP = [...content.projects];
                            newP[idx].image = url;
                            setContent({ ...content, projects: newP });
                          }}
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-foreground">
                            Category & Year
                          </label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={proj.category}
                              placeholder="Category"
                              onChange={(e) => {
                                const newP = [...content.projects];
                                newP[idx].category = e.target.value;
                                setContent({ ...content, projects: newP });
                              }}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <input
                              type="text"
                              value={proj.year}
                              placeholder="Year"
                              onChange={(e) => {
                                const newP = [...content.projects];
                                newP[idx].year = e.target.value;
                                setContent({ ...content, projects: newP });
                              }}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground">
                            Tags (comma separated)
                          </label>
                          <input
                            type="text"
                            value={proj.tags.join(", ")}
                            onChange={(e) => {
                              const newP = [...content.projects];
                              newP[idx].tags = e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              setContent({ ...content, projects: newP });
                            }}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-foreground">Overview</label>
                        <textarea
                          value={proj.overview}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].overview = e.target.value;
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-24"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Role</label>
                        <input
                          type="text"
                          value={proj.role}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].role = e.target.value;
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Timeline</label>
                        <input
                          type="text"
                          value={proj.timeline}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].timeline = e.target.value;
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-foreground">Problem Statement</label>
                        <textarea
                          value={proj.problem}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].problem = e.target.value;
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-24"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-foreground">Solution</label>
                        <textarea
                          value={proj.solution}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].solution = e.target.value;
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-24"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-foreground">Tech Decisions</label>
                        <textarea
                          value={proj.tech_decisions}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].tech_decisions = e.target.value;
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-24"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Stack (comma separated)</label>
                        <input
                          type="text"
                          value={proj.stack.join(", ")}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].stack = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Highlights (comma separated)</label>
                        <input
                          type="text"
                          value={proj.highlights.join(", ")}
                          onChange={(e) => {
                            const newP = [...content.projects];
                            newP[idx].highlights = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                            setContent({ ...content, projects: newP });
                          }}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="md:col-span-2 border border-border/50 rounded-lg p-4 bg-muted/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-foreground">Links</label>
                          <button
                            onClick={() => {
                              const newP = [...content.projects];
                              newP[idx].links.push({ label: "New Link", href: "#" });
                              setContent({ ...content, projects: newP });
                            }}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Plus className="h-3 w-3" /> Add Link
                          </button>
                        </div>
                        {proj.links.map((link, lIdx) => (
                          <div key={lIdx} className="flex gap-2 relative group">
                            <input
                              type="text"
                              value={link.label}
                              placeholder="Label (e.g. GitHub)"
                              onChange={(e) => {
                                const newP = [...content.projects];
                                newP[idx].links[lIdx].label = e.target.value;
                                setContent({ ...content, projects: newP });
                              }}
                              className="w-1/3 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                            />
                            <input
                              type="text"
                              value={link.href}
                              placeholder="URL"
                              onChange={(e) => {
                                const newP = [...content.projects];
                                newP[idx].links[lIdx].href = e.target.value;
                                setContent({ ...content, projects: newP });
                              }}
                              className="w-2/3 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                            />
                            <button
                              onClick={() => {
                                const newP = [...content.projects];
                                newP[idx].links.splice(lIdx, 1);
                                setContent({ ...content, projects: newP });
                              }}
                              className="text-muted-foreground hover:text-destructive p-2"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* CONTACT TAB */}
            <TabsContent value="contact" className="space-y-6 focus:outline-none">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Eyebrow</label>
                  <input
                    type="text"
                    value={content.contact.eyebrow}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, eyebrow: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Heading</label>
                  <input
                    type="text"
                    value={content.contact.heading}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, heading: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Italic Word</label>
                  <input
                    type="text"
                    value={content.contact.italicWord}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, italicWord: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 italic"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Subheadline</label>
                  <input
                    type="text"
                    value={content.contact.sub}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, sub: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    value={content.contact.email}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, email: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">GitHub URL</label>
                  <input
                    type="url"
                    value={content.contact.github}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, github: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">LinkedIn URL</label>
                  <input
                    type="url"
                    value={content.contact.linkedin}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, linkedin: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Footer Text</label>
                  <input
                    type="text"
                    value={content.contact.footer}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, footer: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">GitHub Username</label>
                  <input
                    type="text"
                    value={content.contact.githubUsername}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, githubUsername: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Copyright Text</label>
                  <input
                    type="text"
                    value={content.contact.copyright}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, copyright: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </TabsContent>

            {/* HINTS TAB */}
            <TabsContent value="hints" className="space-y-6 focus:outline-none">
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(content.hints).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-foreground capitalize">{key} Hint</label>
                    <textarea
                      value={val}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hints: { ...content.hints, [key]: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-20"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* MESSAGES TAB — contact form inbox (not part of Save Changes) */}
            <TabsContent value="messages" className="focus:outline-none">
              <MessagesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
