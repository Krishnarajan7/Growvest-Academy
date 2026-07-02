import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Star } from "lucide-react";
import { useGsapReveal } from "@/hooks/useGsapReveal";

/* ---------- content ---------------------------------------------------- */

const reportCard = [
  ["Spoken English", "Fluent"],
  ["Reading & Writing", "Strong"],
  ["Public Speaking", "Stage-ready"],
  ["General Knowledge", "Curious"],
  ["General Maths", "Confident"],
];

const timetable = [
  {
    days: "Mon – Fri",
    kind: "Online, live",
    what: "Interactive Classes",
    detail: "Live English, phonics and maths sessions from home.",
  },
  {
    days: "Sat & Sun",
    kind: "Offline, in person",
    what: "Fun Learning Activities",
    detail: "Games, reading circles and competitions that build real skills.",
  },
];

const syllabus = [
  {
    n: "1",
    title: "Foundation",
    accent: "var(--grass)",
    items: [
      "Basic Spoken English",
      "Phonics",
      "Self Introduction",
      "Reading Basics",
      "Good Habits",
      "Basic Maths",
    ],
  },
  {
    n: "2",
    title: "Intermediate",
    accent: "var(--ink)",
    items: [
      "Daily English Conversation",
      "Public Speaking",
      "Reading & Writing Skills",
      "General Knowledge",
      "Confidence Building",
      "Mental Maths",
    ],
  },
  {
    n: "3",
    title: "Advanced",
    accent: "var(--plum)",
    items: [
      "Fluent Communication",
      "Stage & Public Speaking",
      "Creative Writing",
      "Logical Thinking",
      "Goal Setting",
      "Future-Ready Skills",
    ],
  },
];

const afterThreeMonths = [
  "Speak English more easily",
  "Improve confidence & communication",
  "Become active, curious learners",
  "Do better at school",
  "Build strong skills for the future",
];

const competitions = [
  "Spell Bee",
  "Drawing",
  "General Knowledge Quiz",
  "Public Speaking",
  "Reading Activities",
  "Fun Learning Games",
];

/* ---------- page ------------------------------------------------------- */

const Home = () => {
  const rootRef = useRef(null);
  useGsapReveal(rootRef);

  return (
    <div className="gv" ref={rootRef}>
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden border-b-2 border-[color:var(--ink)]">
        {/* kid doodles in the margins */}
        <Sun className="gv-float pointer-events-none absolute right-10 top-28 hidden h-14 w-14 text-[color:var(--grass)] lg:block" />
        <StarDoodle className="gv-float pointer-events-none absolute right-1/3 top-24 hidden h-6 w-6 rotate-12 text-[color:var(--grass)] lg:block" />
        <Smiley className="gv-float pointer-events-none absolute left-3 top-1/2 hidden h-7 w-7 text-[color:var(--grass)] lg:block" />
        <StarDoodle className="gv-float pointer-events-none absolute bottom-16 left-2 hidden h-5 w-5 -rotate-12 text-[color:var(--grass)] lg:block" />

        <div className="mx-auto gv-reveal max-w-8xl px-5 pt-28 pb-16 sm:pt-32 gv-margin">
          <div className="pl-6 sm:pl-20">
            <p className="gv-eyebrow flex items-center gap-2">
              Growvest Academy · Spoken English for kids
              <Sparkle className="h-3.5 w-3.5 text-[color:var(--grass)]" />
            </p>

            <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
              {/* headline */}
              <div>
                <h1 className="gv-display text-4xl sm:text-6xl font-extrabold leading-[0.98] tracking-tight">
                  Where children learn to
                  speak, read, and{" "}
                  <span className="gv-circle">shine</span>.
                </h1>
                <p className="mt-6 max-w-md text-lg gv-t80">
                  A friendly 3-month foundation program for ages 4–15 — English,
                  phonics, public speaking and the confidence to use them.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link to="/contact" className="gv-btn gv-pop gv-press">
                    Enroll your child
                  </Link>
                  <Link to="/store" className="gv-btn gv-btn-ghost gv-pop gv-press">
                    See the school kits
                  </Link>
                </div>

                <p className="mt-8 flex items-center gap-2 gv-hand text-2xl text-[color:var(--red)]">
                  200+ children already learning with us
                  <PaperPlane className="h-6 w-6 text-[color:var(--grass)]" />
                </p>
              </div>

              {/* report card */}
              <div className="gv-box gv-pop">
                <div className="flex items-baseline justify-between border-b-2 border-dashed border-[color:var(--ink)] px-5 py-3">
                  <span className="gv-display text-lg font-semibold">
                    Progress Report
                  </span>
                  <span className="gv-eyebrow gv-t50">
                    after 3 months
                  </span>
                </div>
                <ul>
                  {reportCard.map(([subject, grade], i) => (
                    <li
                      key={subject}
                      className={`flex items-center justify-between px-5 py-3 ${
                        i < reportCard.length - 1
                          ? "border-b border-[color:var(--rule)]"
                          : ""
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Check
                          className="h-4 w-4 shrink-0 text-[color:var(--grass)]"
                          strokeWidth={3}
                        />
                        <span className="truncate font-medium">{subject}</span>
                      </span>
                      <span className="gv-hand shrink-0 pl-3 text-xl text-[color:var(--red)]">
                        {grade}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="gv-hand px-5 py-3 text-right text-lg gv-t70">
                  — signed, class teacher
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================= TIMETABLE */}
      <section className="border-b-2 border-[color:var(--ink)]">
        <div className="mx-auto gv-reveal max-w-8xl px-5 py-14">
          <SectionTitle index="§1" title="The weekly timetable" doodle={Sun} />
          <div className="mt-8 grid gap-0 overflow-hidden border-[1.5px] border-[color:var(--ink)] sm:grid-cols-2">
            {timetable.map((row, i) => (
              <div
                key={row.days}
                className={`p-6 sm:p-8 ${
                  i === 0 ? "sm:border-r-[1.5px] sm:border-[color:var(--ink)]" : ""
                } ${i === 0 ? "border-b-[1.5px] border-[color:var(--ink)] sm:border-b-0" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="gv-display text-2xl font-bold">{row.days}</span>
                  <span className="border border-[color:var(--ink)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
                    {row.kind}
                  </span>
                </div>
                <p className="mt-3 gv-display text-xl text-[color:var(--red)]">
                  {row.what}
                </p>
                <p className="mt-1 gv-t70">{row.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== SYLLABUS */}
      <section className="border-b-2 border-[color:var(--ink)] bg-[#f0fdf4]">
        <div className="mx-auto gv-reveal max-w-8xl px-5 py-14">
          <SectionTitle
            index="§2"
            title="Super Kids Foundation Program"
            note="a 3-month course, in 3 levels"
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {syllabus.map((level) => (
              <div key={level.n} className="gv-box">
                <div
                  className="flex items-center gap-3 border-b-[1.5px] border-[color:var(--ink)] px-5 py-3"
                  style={{ background: level.accent, color: "#fff" }}
                >
                  <span className="gv-display text-3xl font-extrabold leading-none">
                    {level.n}
                  </span>
                  <div className="leading-tight">
                    <span className="block text-[0.7rem] font-semibold uppercase tracking-widest opacity-80">
                      Level {level.n}
                    </span>
                    <span className="gv-display text-xl font-bold">
                      {level.title}
                    </span>
                  </div>
                </div>
                <ul className="px-5 py-2">
                  {level.items.map((item, i) => (
                    <li
                      key={item}
                      className={`flex items-center gap-2.5 py-2.5 ${
                        i < level.items.length - 1
                          ? "border-b border-dashed border-[color:var(--rule)]"
                          : ""
                      }`}
                    >
                      <Check
                        className="h-4 w-4 shrink-0 text-[color:var(--ink)]"
                        strokeWidth={3}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================== BLACKBOARD */}
      <section style={{ background: "var(--board)", color: "var(--chalk)" }}>
        <div className="mx-auto gv-reveal max-w-8xl px-5 py-16">
          <p className="gv-hand text-2xl gv-board-muted">
            Today's lesson aim —
          </p>
          <h2 className="gv-display mt-1 text-3xl sm:text-4xl font-bold">
            After 3 months, your child will…
          </h2>

          <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {afterThreeMonths.map((item) => (
              <li key={item} className="flex items-start gap-3 text-lg">
                <span className="gv-hand text-2xl leading-none text-[color:var(--star)]">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-dashed gv-board-rule pt-6">
            <span className="gv-hand text-2xl gv-board-muted">
              our goal:
            </span>{" "}
            <span className="gv-display text-xl sm:text-2xl">
              smart, confident, creative and future-ready children.
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================== COMPETITIONS */}
      <section className="border-b-2 border-[color:var(--ink)]">
        <div className="mx-auto gv-reveal max-w-8xl px-5 py-14">
          <SectionTitle
            index="§3"
            title="Learning beyond the classroom"
            note="competitions we run for our students"
            doodle={Smiley}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {competitions.map((c, i) => (
                <li
                  key={c}
                  className="flex items-baseline gap-3 border-b border-dashed border-[color:var(--rule)] py-3"
                >
                  <span className="gv-display text-sm font-bold text-[color:var(--red)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg">{c}</span>
                </li>
              ))}
            </ul>

            {/* gold-star achievement sticker */}
            <div className="flex justify-center">
              <div className="relative">
                <div
                  className="grid h-52 w-52 place-items-center rounded-full border-[1.5px] border-[color:var(--ink)] p-6 text-center"
                  style={{ background: "var(--star)" }}
                >
                  <div>
                    <Star
                      className="mx-auto mb-2 h-8 w-8 text-[color:var(--ink)]"
                      strokeWidth={2}
                      fill="currentColor"
                    />
                    <p className="gv-display text-sm font-bold uppercase tracking-wide text-[color:var(--ink)]">
                      Special Achievement
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">
                      First Spell Bee ever held in our town
                    </p>
                  </div>
                </div>
                <span className="gv-hand absolute -right-4 -top-3 -rotate-6 text-3xl text-[color:var(--red)]">
                  a first!
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== SCHOOL KITS */}
      <section className="border-b-2 border-[color:var(--ink)] bg-[#f0fdf4]">
        <div className="mx-auto gv-reveal max-w-8xl px-5 py-14">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="gv-eyebrow">Also from Growvest</p>
              <h2 className="gv-display mt-2 text-3xl font-bold">
                The Growvest School Kit
              </h2>
              <p className="mt-2 max-w-lg gv-t70">
                Every book, pencil and supply your child needs for the year — in
                one box. Kits for LKG to 10th standard, from ₹199.
              </p>
            </div>
            <Link
              to="/store"
              className="gv-btn gv-pop gv-press shrink-0"
            >
              Open the store <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== MISSION */}
      <section>
        <div className="gv-reveal mx-auto max-w-3xl px-5 py-20 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-[color:var(--grass)]">
            <Sparkle className="h-4 w-4" />
            <StarDoodle className="h-6 w-6" />
            <Sparkle className="h-4 w-4" />
          </div>
          <p className="gv-eyebrow">Our mission</p>
          <p className="gv-display mt-4 text-3xl sm:text-4xl font-semibold leading-tight">
            To build confident, creative and future-ready children — one
            reading, one conversation, one small win at a time.
          </p>
          <p className="mt-6 gv-hand text-2xl text-[color:var(--red)]">
            200+ students · 6+ competitions · endless growth
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="gv-btn gv-btn-go gv-pop gv-press">
              Enroll your child today
            </Link>
            <Link to="/about" className="gv-btn gv-btn-ghost gv-pop gv-press">
              About Growvest
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ---------- small pieces ---------------------------------------------- */

function SectionTitle({ index, title, note, doodle: DoodleIcon }) {
  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
      <span className="gv-display text-lg font-bold text-[color:var(--red)]">
        {index}
      </span>
      <h2 className="gv-display text-3xl sm:text-4xl font-bold leading-none">
        {title}
      </h2>
      {DoodleIcon && (
        <DoodleIcon className="h-6 w-6 text-[color:var(--grass)]" aria-hidden />
      )}
      {note && <span className="gv-hand text-2xl gv-t50">{note}</span>}
    </div>
  );
}

/* ---------- hand-drawn kid doodles (decorative, aria-hidden) ----------- */

function Sun({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="24" cy="24" r="8.5" stroke="currentColor" strokeWidth="2.4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={24 + Math.cos(a) * 13}
            y1={24 + Math.sin(a) * 13}
            x2={24 + Math.cos(a) * 19}
            y2={24 + Math.sin(a) * 19}
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function Sparkle({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0c.7 5.8 2.4 9.5 12 12-9.6 2.5-11.3 6.2-12 12-.7-5.8-2.4-9.5-12-12C9.6 9.5 11.3 5.8 12 0Z" />
    </svg>
  );
}

function StarDoodle({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3l2.5 6 6.5.4-5 4.2 1.7 6.3L12 16.8 6.3 19.9 8 13.6l-5-4.2 6.5-.4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Smiley({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" />
      <circle cx="11.5" cy="13" r="1.6" fill="currentColor" />
      <circle cx="20.5" cy="13" r="1.6" fill="currentColor" />
      <path d="M10 19c1.8 2.6 10.2 2.6 12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PaperPlane({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M29 3 3 14l10 3 3 10 4-8 6-16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 17 29 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default Home;
