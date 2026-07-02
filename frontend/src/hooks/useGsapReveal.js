import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Subtle, safe GSAP page animations scoped to `rootRef`:
 *   - `.gv-reveal`          slides its content up when that section scrolls into view
 *   - `.gv-reveal-stagger`  slides its direct children up with a stagger
 *   - `.gv-float`           gentle infinite bob for decorative doodles
 *
 * Each reveal has its own ScrollTrigger so sections animate one-by-one as you
 * scroll (not all at once). Positions are recalculated after fonts / images /
 * async content settle — otherwise every trigger fires on first paint (while
 * the page is still short) and the whole page appears to animate together.
 *
 * Reveals animate transform only (never opacity) so content is always visible,
 * and the whole thing is skipped under prefers-reduced-motion.
 */
export function useGsapReveal(rootRef) {
  useLayoutEffect(() => {
    if (prefersReduced()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray(".gv-float").forEach((el, i) => {
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

      gsap.utils.toArray(".gv-reveal").forEach((el) => {
        gsap.from(el, {
          y: 40,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
          },
        });
      });

      gsap.utils.toArray(".gv-reveal-stagger").forEach((el) => {
        gsap.from(el.children, {
          y: 32,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.08,
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
          },
        });
      });
    }, rootRef);

    // Recompute trigger positions once the layout has actually settled.
    // Without this, triggers are measured on a still-short page and all fire
    // at once on load (the "whole page animates together" bug).
    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(refresh);
    const t = setTimeout(refresh, 600); // catch async data / late images
    window.addEventListener("load", refresh);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
