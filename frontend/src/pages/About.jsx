import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import {
  Mic,
  BookOpen,
  Megaphone,
  Brain,
  Calculator,
  Pencil,
  Trophy,
  Heart,
  Users,
  Rocket,
  ArrowRight,
} from "lucide-react";
import {
  Sun,
  Sparkle,
  StarDoodle,
  Smiley,
  PaperPlane,
  Balloon,
} from "@/components/KidDoodles";

const stats = [
  { value: "200+", label: "Students taught" },
  { value: "6+", label: "Competitions held" },
  { value: "3", label: "Month program" },
  { value: "100%", label: "Fun + learning" },
];

const subjects = [
  { icon: Mic, text: "Spoken English" },
  { icon: Pencil, text: "Phonics & Reading" },
  { icon: Megaphone, text: "Public Speaking" },
  { icon: BookOpen, text: "Reading & Writing" },
  { icon: Brain, text: "General Knowledge" },
  { icon: Calculator, text: "General Maths" },
];

const values = [
  { icon: Heart, title: "Warmth first", desc: "Kind, patient teachers who make every child feel safe to try." },
  { icon: Rocket, title: "Confidence over marks", desc: "We build children who speak up, not just score." },
  { icon: Users, title: "Every child matters", desc: "Small groups so no one is left behind." },
  { icon: Trophy, title: "Learning is fun", desc: "Games, songs and competitions — never boring." },
];

const About = () => {
  const rootRef = useRef(null);
  useGsapReveal(rootRef);

  return (
    <div className="gv" ref={rootRef}>
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden border-b-2 border-[color:var(--ink)]">
        <Sun className="gv-float pointer-events-none absolute right-10 top-28 hidden h-12 w-12 text-[color:var(--grass)] lg:block" />
        <Balloon className="gv-float pointer-events-none absolute right-1/4 top-24 hidden h-9 w-9 text-[color:var(--grass)] lg:block" />
        <StarDoodle className="gv-float pointer-events-none absolute bottom-16 left-3 hidden h-6 w-6 text-[color:var(--grass)] lg:block" />

        <div className="mx-auto gv-reveal max-w-8xl px-5 pt-28 pb-16 sm:pt-32 gv-margin">
          <div className="pl-6 sm:pl-20">
            <p className="gv-eyebrow flex items-center gap-2">
              About Growvest Academy
              <Sparkle className="h-3.5 w-3.5 text-[color:var(--grass)]" />
            </p>
            <h1 className="gv-display mt-4 max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
              Small-town roots, big dreams for every{" "}
              <span className="gv-circle">child</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg gv-t80">
              Growvest Academy started with one simple belief — that every child,
              wherever they live, deserves to speak English with confidence and
              enjoy learning along the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/contact" className="gv-btn gv-pop gv-press">
                Enroll your child
              </Link>
              <Link to="/super-kids" className="gv-btn gv-btn-ghost gv-pop gv-press">
                See our programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================== STATS */}
      <section className="border-b-2 border-[color:var(--ink)]">
        <div className="mx-auto grid gv-reveal max-w-8xl grid-cols-2 gap-[1.5px] bg-[color:var(--ink)] md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-5 py-8 text-center">
              <div className="gv-display text-3xl font-extrabold text-[color:var(--grass)] sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm gv-t70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================== STORY */}
      <section className="border-b-2 border-[color:var(--ink)]">
        <div className="mx-auto grid gv-reveal max-w-8xl gap-10 px-5 py-14 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="gv-eyebrow">Our story</p>
            <h2 className="gv-display mt-3 text-3xl font-bold sm:text-4xl">
              Built for the children of our town
            </h2>
            <div className="mt-5 space-y-4 gv-t80">
              <p>
                We saw bright, curious children who were shy to speak, unsure of
                their reading, and nervous on stage — not because they lacked
                ability, but because no one had made learning feel friendly.
              </p>
              <p>
                So we built a place where English, phonics, public speaking and
                maths are taught through games, songs and real practice. Live
                classes through the week, hands-on activities on weekends, and
                competitions that let every child shine.
              </p>
            </div>
          </div>

          {/* mission card */}
          <div className="gv-box gv-pop">
            <div className="border-b-2 border-dashed border-[color:var(--ink)] px-6 py-3">
              <span className="gv-display text-lg font-semibold">Our mission</span>
            </div>
            <div className="p-6">
              <p className="gv-display text-2xl font-bold leading-snug">
                To build confident, creative and future-ready children.
              </p>
              <p className="mt-4 gv-hand text-2xl text-[color:var(--red)]">
                one reading, one conversation at a time ✎
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== SUBJECTS */}
      <section className="border-b-2 border-[color:var(--ink)] bg-[#f0fdf4]">
        <div className="mx-auto gv-reveal max-w-8xl px-5 py-14">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
            <span className="gv-display text-lg font-bold text-[color:var(--red)]">§</span>
            <h2 className="gv-display text-3xl font-bold leading-none sm:text-4xl">
              What we teach
            </h2>
            <span className="gv-hand text-2xl gv-t50">for ages 4 to 15</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {subjects.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.text} className="gv-box flex items-center gap-3 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[color:var(--ink)] text-[color:var(--grass)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-semibold">{s.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================== ACHIEVEMENTS */}
      <section className="border-b-2 border-[color:var(--ink)]">
        <div className="mx-auto grid gv-reveal max-w-8xl gap-8 px-5 py-14 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="gv-eyebrow">A proud milestone</p>
            <h2 className="gv-display mt-3 text-3xl font-bold sm:text-4xl">
              First Spell Bee ever held in our town
            </h2>
            <p className="mt-5 max-w-lg gv-t80">
              From spell bees and drawing contests to public-speaking and general
              knowledge quizzes, we've run 6+ competitions that give children a
              real stage — many for the very first time.
            </p>
            <Link to="/activities" className="gv-btn gv-pop gv-press mt-6">
              See our activities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div
                className="grid h-52 w-52 place-items-center rounded-full border-[1.5px] border-[color:var(--ink)] p-6 text-center text-white"
                style={{ background: "var(--grass)" }}
              >
                <div>
                  <Trophy className="mx-auto mb-2 h-8 w-8" strokeWidth={2} />
                  <p className="gv-display text-sm font-bold uppercase tracking-wide">
                    Special Achievement
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    Town's first Spell Bee — a big first!
                  </p>
                </div>
              </div>
              <span className="gv-hand absolute -right-3 -top-3 -rotate-6 text-3xl text-[color:var(--red)]">
                a first!
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= VALUES */}
      <section style={{ background: "var(--board)", color: "var(--chalk)" }}>
        <div className="mx-auto gv-reveal max-w-8xl px-5 py-16">
          <p className="gv-hand text-2xl gv-board-muted">what we stand for —</p>
          <h2 className="gv-display mt-1 text-3xl font-bold sm:text-4xl">
            The Growvest way
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="gv-board-rule border p-5">
                  <Icon className="mb-3 h-8 w-8 text-[color:var(--chalk)]" />
                  <h3 className="gv-display text-lg font-bold">{v.title}</h3>
                  <p className="mt-1 text-sm gv-board-muted">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================= CTA */}
      <section className="relative overflow-hidden">
        <Smiley className="gv-float pointer-events-none absolute left-10 top-10 hidden h-8 w-8 text-[color:var(--grass)] md:block" />
        <StarDoodle className="gv-float pointer-events-none absolute bottom-12 right-14 hidden h-7 w-7 text-[color:var(--grass)] md:block" />
        <div className="gv-reveal mx-auto max-w-3xl px-5 py-20 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-[color:var(--grass)]">
            <Sparkle className="h-4 w-4" />
            <StarDoodle className="h-6 w-6" />
            <Sparkle className="h-4 w-4" />
          </div>
          <h2 className="gv-display text-3xl font-bold sm:text-4xl">
            Come grow with us
          </h2>
          <p className="mx-auto mt-3 max-w-xl gv-t70">
            Give your child the confidence to speak, read and shine. Enrollment is
            open all year.
          </p>
          <p className="mt-4 gv-hand text-2xl text-[color:var(--red)]">
            200+ families already have ↗
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="gv-btn gv-btn-go gv-pop gv-press">
              <PaperPlane className="h-4 w-4" /> Enroll your child
            </Link>
            <Link to="/store" className="gv-btn gv-btn-ghost gv-pop gv-press">
              Shop school kits
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
