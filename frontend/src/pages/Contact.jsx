import React, { useRef, useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle, Check } from "lucide-react";
import { Sun, Sparkle, StarDoodle, PaperPlane } from "@/components/KidDoodles";
import { useGsapReveal } from "@/hooks/useGsapReveal";

const WHATSAPP_NUMBER = "917418991909";
const PHONE = "+91 74189 91909";
const EMAIL = "Growvestacademy@gmail.com";

const CLASSES = [
  "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th",
  "6th", "7th", "8th", "9th", "10th",
];

const faqs = [
  {
    q: "What ages do you teach?",
    a: "Children from ages 4 to 15 — from LKG all the way up to 10th standard.",
  },
  {
    q: "How do the classes work?",
    a: "Monday to Friday are live, interactive online classes. Saturday and Sunday are offline fun-learning activities and competitions.",
  },
  {
    q: "How long is the Super Kids program?",
    a: "It's a 3-month foundation course in three levels — Foundation, Intermediate and Advanced.",
  },
  {
    q: "How do I enroll my child?",
    a: "Message us on WhatsApp or fill in the form and we'll call you back with the next steps.",
  },
  {
    q: "Do you sell school supplies too?",
    a: "Yes — our School Kit store has complete kits from ₹199. Just open the Store page to order.",
  },
];

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    childClass: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const rootRef = useRef(null);
  useGsapReveal(rootRef);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Growvest Academy! I'd like to know more about enrolling my child."
  )}`;

  return (
    <div className="gv" ref={rootRef}>
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden border-b-2 border-[color:var(--ink)]">
        <Sun className="gv-float pointer-events-none absolute right-10 top-28 hidden h-12 w-12 text-[color:var(--grass)] lg:block" />
        <StarDoodle className="gv-float pointer-events-none absolute left-3 top-1/2 hidden h-6 w-6 text-[color:var(--grass)] lg:block" />

        <div className="mx-auto gv-reveal max-w-8xl px-5 pt-28 pb-14 sm:pt-32 gv-margin">
          <div className="pl-6 sm:pl-20">
            <p className="gv-eyebrow flex items-center gap-2">
              Get in touch
              <Sparkle className="h-3.5 w-3.5 text-[color:var(--grass)]" />
            </p>
            <h1 className="gv-display mt-4 text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
              Let's talk about your{" "}
              <span className="gv-circle">child</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg gv-t80">
              Questions about classes, timings or enrollment? Send us a note and
              we'll get back to you — or message us straight on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ BODY */}
      <section className="border-b-2 border-[color:var(--ink)]">
        <div className="mx-auto gv-reveal max-w-8xl px-5 py-14">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* form */}
            <div className="gv-box gv-pop">
              <div className="border-b-2 border-dashed border-[color:var(--ink)] px-6 py-4">
                <h2 className="gv-display text-xl font-bold">Send us a message</h2>
                <p className="text-sm gv-t70">
                  Fill this in and we'll call you back.
                </p>
              </div>

              {sent ? (
                <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full border-[1.5px] border-[color:var(--ink)] bg-[color:var(--grass)] text-white">
                    <Check className="h-7 w-7" strokeWidth={3} />
                  </span>
                  <h3 className="gv-display text-2xl font-bold">Thank you!</h3>
                  <p className="max-w-sm gv-t70">
                    We've got your message and will reach out shortly. For
                    anything urgent, message us on WhatsApp.
                  </p>
                  <p className="gv-hand text-2xl text-[color:var(--red)]">
                    talk soon! 👋
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Parent's name" required>
                      <input
                        required
                        value={form.name}
                        onChange={set("name")}
                        placeholder="Your name"
                        className="gv-input"
                      />
                    </Field>
                    <Field label="Phone" required>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="Your phone number"
                        className="gv-input"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email">
                      <input
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="Optional"
                        className="gv-input"
                      />
                    </Field>
                    <Field label="Child's class">
                      <select
                        value={form.childClass}
                        onChange={set("childClass")}
                        className="gv-input"
                      >
                        <option value="">Select class</option>
                        {CLASSES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Message" required>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={set("message")}
                      placeholder="Tell us what you'd like to know…"
                      className="gv-input resize-none"
                    />
                  </Field>

                  <button type="submit" className="gv-btn gv-btn-go gv-pop gv-press w-full">
                    <PaperPlane className="h-5 w-5" /> Send message
                  </button>
                </form>
              )}
            </div>

            {/* contact info */}
            <div className="flex flex-col gap-5">
              <div
                className="gv-box gv-pop p-6"
                style={{ background: "var(--board)", color: "var(--chalk)", borderColor: "var(--board)" }}
              >
                <h3 className="gv-display text-lg font-bold">Reach us directly</h3>
                <ul className="mt-4 space-y-4 text-sm">
                  <InfoRow icon={Phone} label="Call">
                    <a href={`tel:${WHATSAPP_NUMBER}`} className="hover:underline">
                      {PHONE}
                    </a>
                  </InfoRow>
                  <InfoRow icon={Mail} label="Email">
                    <a href={`mailto:${EMAIL}`} className="break-all hover:underline">
                      {EMAIL}
                    </a>
                  </InfoRow>
                  <InfoRow icon={MapPin} label="Visit">
                    177/1 Rahamaniya Street, Lalpet
                  </InfoRow>
                  <InfoRow icon={Clock} label="Hours">
                    Mon – Fri, 9:00 AM – 6:00 PM
                  </InfoRow>
                </ul>
              </div>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="gv-btn gv-btn-go gv-pop gv-press"
              >
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </a>
              <p className="gv-hand text-center text-xl text-[color:var(--red)]">
                fastest way to reach us ↗
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================= FAQ */}
      <section>
        <div className="gv-reveal mx-auto max-w-4xl px-5 py-14">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
            <span className="gv-display text-lg font-bold text-[color:var(--red)]">?</span>
            <h2 className="gv-display text-3xl font-bold leading-none sm:text-4xl">
              Common questions
            </h2>
            <span className="gv-hand text-2xl gv-t50">quick answers for parents</span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className="gv-box p-5">
                <h3 className="gv-display font-bold">{f.q}</h3>
                <p className="mt-2 text-sm gv-t70">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

function Field({ label, required, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">
        {label} {required && <span className="text-[color:var(--red)]">*</span>}
      </span>
      {children}
    </label>
  );
}

function InfoRow({ icon, label, children }) {
  const Icon = icon;
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[color:rgba(240,253,244,0.35)]">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-xs uppercase tracking-wide opacity-70">
          {label}
        </span>
        {children}
      </span>
    </li>
  );
}

export default Contact;
