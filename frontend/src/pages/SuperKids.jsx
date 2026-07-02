import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import confetti from "canvas-confetti";
import {
  Mic,
  Calculator,
  Monitor,
  Globe,
  Megaphone,
  Star,
  Trophy,
  Target,
  Rocket,
  Zap,
  BookOpen,
  Play,
  Loader2,
  ArrowRight,
} from "lucide-react";
import StudentLoginModal from "@/components/StudentLoginModal";
import KidsCanvas from "@/components/KidsCanvas";
import {
  Sun,
  Sparkle,
  StarDoodle,
  Smiley,
  Balloon,
  Pencil,
} from "@/components/KidDoodles";
import { api } from "@/lib/axios";

gsap.registerPlugin(ScrollTrigger);

/* Per-subject copy + icon (colours come from the on-theme rotation below). */
const CATEGORY_UI_MAP = {
  "spoken-english": {
    subtitle: "Master the language",
    description: "Fun, interactive lessons to sharpen speaking, listening and pronunciation.",
    icon: Mic,
    duration: "15 mins",
    difficulty: "Beginner",
  },
  "phonics-song": {
    subtitle: "Sing & learn sounds",
    description: "Catchy songs and games for letter sounds, blending and early reading.",
    icon: Sparkle,
    duration: "18 mins",
    difficulty: "Beginner",
  },
  "general-maths": {
    subtitle: "Numbers are fun",
    description: "Build strong number sense with friendly puzzles and problems.",
    icon: Calculator,
    duration: "25 mins",
    difficulty: "Beginner",
  },
  "basic-computer": {
    subtitle: "Little tech wizards",
    description: "Essential computer skills, typing and first programming ideas.",
    icon: Monitor,
    duration: "15 mins",
    difficulty: "Beginner",
  },
  "general-knowledge": {
    subtitle: "Know everything",
    description: "Fascinating facts about the world, history, science and more.",
    icon: Globe,
    duration: "20 mins",
    difficulty: "Mixed",
  },
  "public-speaking": {
    subtitle: "Speak with confidence",
    description: "Presentation skills, less stage fear, and a confident voice.",
    icon: Megaphone,
    duration: "15 mins",
    difficulty: "Beginner",
  },
};

// On-theme accent rotation (green + ink), matching the rest of the site.
const CARD_ACCENTS = ["#16a34a", "#111827", "#15803d", "#14532d", "#166534"];
const CONFETTI_COLORS = ["#16a34a", "#22c55e", "#15803d", "#4ade80", "#166534", "#111827"];

const titleCase = (slug) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// Shown when the API returns no categories, so the section is never empty.
const FALLBACK_CATEGORIES = Object.keys(CATEGORY_UI_MAP).map((slug) => ({
  id: slug,
  title: titleCase(slug),
  questions: 0,
  ...CATEGORY_UI_MAP[slug],
}));

const badges = [
  { icon: BookOpen, text: "Fun learning" },
  { icon: Star, text: "Earn gold stars" },
  { icon: Target, text: "Track progress" },
];

const stats = [
  { icon: Star, label: "Gold stars earned", value: "5,000+" },
  { icon: Trophy, label: "Tests completed", value: "10,000+" },
  { icon: Rocket, label: "Super kids", value: "2,500+" },
];

const features = [
  { icon: Rocket, text: "Learn at your pace", desc: "No pressure — just fun." },
  { icon: Target, text: "Track your progress", desc: "Watch yourself improve." },
  { icon: Trophy, text: "Win cool badges", desc: "Collect achievements." },
  { icon: Zap, text: "Instant results", desc: "See your score right away." },
];

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SuperKids = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Green confetti welcome
  useEffect(() => {
    if (prefersReduced()) return;
    const timer = setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.35, x: 0.5 },
        colors: CONFETTI_COLORS,
        gravity: 0.85,
        scalar: 1.1,
      });
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/super-kids/categories");
        const data = Array.isArray(response.categories)
          ? response.categories
          : Array.isArray(response.data)
          ? response.data
          : [];
        const mapped = data.map((cat) => ({
          id: cat.slug,
          title: cat.name,
          questions: cat.question_count || 0,
          ...(CATEGORY_UI_MAP[cat.slug] || {}),
        }));
        setCategories(mapped.length ? mapped : FALLBACK_CATEGORIES);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // GSAP: hero entrance, floating doodles, scroll-revealed cards (runs once loaded)
  useLayoutEffect(() => {
    if (loading || prefersReduced()) return;
    const ctx = gsap.context(() => {
      // Reveals animate transform only (never opacity) so content is always
      // visible even if a tween is interrupted.
      gsap.from(".sk-hero > *", {
        y: 22,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
      });
      gsap.utils.toArray(".sk-float").forEach((el, i) => {
        gsap.to(el, {
          y: `+=${12 + (i % 3) * 7}`,
          rotation: i % 2 ? 8 : -8,
          duration: 2.4 + (i % 3) * 0.7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.12,
        });
      });
      gsap.from(".sk-card", {
        y: 30,
        duration: 0.5,
        stagger: 0.07,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: ".sk-cards", start: "top 90%" },
      });
      gsap.from(".sk-feature", {
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: ".sk-features", start: "top 92%" },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [loading]);

  const burst = useCallback((e) => {
    if (prefersReduced()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 28,
      spread: 55,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: CONFETTI_COLORS,
      gravity: 1.2,
      scalar: 0.85,
      ticks: 90,
    });
  }, []);

  const wobble = (e) => {
    if (prefersReduced()) return;
    gsap.fromTo(
      e.currentTarget,
      { rotation: -1.5 },
      {
        rotation: 1.5,
        duration: 0.12,
        yoyo: true,
        repeat: 3,
        ease: "sine.inOut",
        onComplete: () => gsap.set(e.currentTarget, { rotation: 0 }),
      }
    );
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (studentData) => {
    try {
      const res = await api.post("/student/guest/enter", {
        name: studentData.name,
        age: studentData.age,
      });
      const { token, student } = res;
      localStorage.setItem("student_token", token);
      localStorage.setItem("student_data", JSON.stringify(student));
      setIsModalOpen(false);
      if (selectedCategory) navigate(`/super-kids/${selectedCategory.id}`);
    } catch (error) {
      console.error("Guest registration failed", error);
    }
  };

  if (loading) {
    return (
      <div className="gv flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[color:var(--grass)]" />
          <p className="gv-hand text-2xl text-[color:var(--red)]">
            getting the fun ready…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gv" ref={rootRef}>
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden border-b-2 border-[color:var(--ink)]">
        {/* three.js floating shapes */}
        <KidsCanvas className="pointer-events-none absolute inset-0" />

        {/* doodles */}
        <Sun className="sk-float pointer-events-none absolute left-6 top-28 hidden h-12 w-12 text-[color:var(--grass)] lg:block" />
        <StarDoodle className="sk-float pointer-events-none absolute right-10 top-24 hidden h-7 w-7 text-[color:var(--grass)] lg:block" />
        <Balloon className="sk-float pointer-events-none absolute bottom-16 left-1/4 hidden h-10 w-10 text-[color:var(--grass)] lg:block" />
        <Pencil className="sk-float pointer-events-none absolute bottom-24 right-1/4 hidden h-9 w-9 text-[color:var(--grass)] lg:block" />

        <div className="relative mx-auto max-w-4xl px-5 pt-28 pb-16 text-center sm:pt-32">
          <div className="sk-hero">
            <p className="gv-eyebrow flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <Sparkle className="h-3.5 w-3.5 text-[color:var(--grass)]" />
              For ages 6–16 · fun learning tests
              <Sparkle className="h-3.5 w-3.5 text-[color:var(--grass)]" />
            </p>

            <h1 className="gv-display mt-5 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
              Super <span className="gv-circle">Kids</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg gv-t80">
              Short, playful quizzes in spoken English, phonics, maths and more —
              take a test, learn something new, and earn your gold star.
            </p>

            <p className="mt-4 gv-hand text-2xl text-[color:var(--red)]">
              play · learn · win a star ⭐
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <span
                    key={b.text}
                    className="gv-box gv-pop inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                  >
                    <Icon className="h-4 w-4 text-[color:var(--grass)]" />
                    {b.text}
                  </span>
                );
              })}
            </div>

            {/* stat stickers */}
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-2.5 sm:gap-4">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={burst}
                    onMouseEnter={wobble}
                    className="gv-box gv-pop gv-press p-3 text-center sm:p-4"
                  >
                    <Icon className="mx-auto mb-2 h-6 w-6 text-[color:var(--grass)] sm:h-7 sm:w-7" />
                    <div className="gv-display text-lg font-extrabold sm:text-2xl md:text-3xl">
                      {s.value}
                    </div>
                    <div className="text-[0.7rem] leading-tight gv-t70 sm:text-xs">
                      {s.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================== CATEGORIES */}
      <section className="border-b-2 border-[color:var(--ink)] bg-[#f0fdf4]">
        <div className="mx-auto max-w-8xl px-5 py-14">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
            <span className="gv-display text-lg font-bold text-[color:var(--red)]">§</span>
            <h2 className="gv-display text-3xl font-bold leading-none sm:text-4xl">
              Pick your adventure
            </h2>
            <span className="gv-hand text-2xl gv-t50">choose a subject to begin</span>
          </div>

          <div className="sk-cards mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => {
              const Icon = category.icon || BookOpen;
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  onMouseEnter={wobble}
                  className="sk-card gv-box gv-pop gv-press flex flex-col text-left"
                >
                  {/* subject tab */}
                  <div
                    className="flex items-center gap-3 border-b-[1.5px] border-[color:var(--ink)] px-5 py-4"
                    style={{ background: accent, color: "#fff" }}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-white/25 bg-white/15">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <div className="gv-display truncate text-lg font-bold leading-tight">
                        {category.title}
                      </div>
                      <div className="truncate text-xs uppercase tracking-wide opacity-85">
                        {category.subtitle || "Explore now"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="flex-1 text-sm gv-t70">
                      {category.description || "An exciting learning journey awaits!"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {category.questions > 0 && (
                        <span className="inline-flex items-center gap-1 border border-[color:var(--ink)] px-2 py-1 font-medium">
                          <BookOpen className="h-3 w-3" /> {category.questions} questions
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 border border-[color:var(--rule)] px-2 py-1 gv-t70">
                        <Zap className="h-3 w-3" /> {category.duration || "20 mins"}
                      </span>
                      <span className="inline-flex items-center gap-1 border border-[color:var(--rule)] px-2 py-1 gv-t70">
                        <Target className="h-3 w-3" /> {category.difficulty || "Mixed"}
                      </span>
                    </div>

                    <span className="gv-btn gv-btn-go mt-5 w-full justify-center">
                      <Play className="h-4 w-4" /> Start test
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================== WHY KIDS LOVE */}
      <section style={{ background: "var(--board)", color: "var(--chalk)" }}>
        <div className="mx-auto max-w-8xl px-5 py-16">
          <p className="gv-hand text-2xl gv-board-muted">report card says —</p>
          <h2 className="gv-display mt-1 text-3xl font-bold sm:text-4xl">
            Why kids love Super Kids
          </h2>

          <div className="sk-features mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.text}
                  onClick={burst}
                  className="sk-feature gv-board-rule border p-5 text-left transition-colors hover:bg-white/5"
                >
                  <Icon className="mb-3 h-8 w-8 text-[color:var(--chalk)]" />
                  <h3 className="gv-display text-lg font-bold">{f.text}</h3>
                  <p className="mt-1 text-sm gv-board-muted">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================= CTA */}
      <section className="relative overflow-hidden">
        <StarDoodle className="sk-float pointer-events-none absolute left-10 top-10 hidden h-8 w-8 text-[color:var(--grass)] md:block" />
        <Smiley className="sk-float pointer-events-none absolute bottom-10 right-12 hidden h-9 w-9 text-[color:var(--grass)] md:block" />
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-[color:var(--grass)]">
            <Sparkle className="h-4 w-4" />
            <StarDoodle className="h-6 w-6" />
            <Sparkle className="h-4 w-4" />
          </div>
          <h2 className="gv-display text-3xl font-bold sm:text-4xl">
            Ready to become a Super Kid?
          </h2>
          <p className="mx-auto mt-3 max-w-xl gv-t70">
            Thousands of children are learning and having fun at the same time.
            Your first test is free.
          </p>
          <p className="mt-4 gv-hand text-2xl text-[color:var(--red)]">
            no login needed — just your name!
          </p>
          <button
            onClick={(e) => {
              burst(e);
              if (prefersReduced()) return;
              setTimeout(
                () =>
                  confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: CONFETTI_COLORS,
                  }),
                100
              );
              setTimeout(
                () =>
                  confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: CONFETTI_COLORS,
                  }),
                200
              );
            }}
            onMouseEnter={wobble}
            className="gv-btn gv-btn-go gv-pop gv-press mx-auto mt-7"
          >
            <Sparkle className="h-4 w-4" /> Start your first test free
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <StudentLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        categoryTitle={selectedCategory?.title || ""}
        categoryColor="from-green-500 to-emerald-600"
      />
    </div>
  );
};

export default SuperKids;
