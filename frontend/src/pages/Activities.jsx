import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Image as ImageIcon,
  Film,
  Calendar,
  Clock,
  X,
} from "lucide-react";
import { publicApi } from "@/lib/axios";
import { Sun, Sparkle, StarDoodle, Balloon } from "@/components/KidDoodles";
import { useGsapReveal } from "@/hooks/useGsapReveal";

const stats = [
  { value: "500+", label: "Photos captured" },
  { value: "50+", label: "Videos produced" },
  { value: "30+", label: "Events held" },
];

const Activities = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [media, setMedia] = useState([]);
  const [categories, setCategories] = useState([{ slug: "all", name: "All media" }]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const isFetchingRef = useRef(false);
  const rootRef = useRef(null);
  useGsapReveal(rootRef);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await publicApi.getPublicCategories();
        const cats = res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
        const formatted = cats
          .map((cat) => ({ slug: cat.slug, name: cat.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCategories([{ slug: "all", name: "All media" }, ...formatted]);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMedia = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory !== "all") params.category_slug = selectedCategory;
        const res = await publicApi.getPublicMedia(params);
        const items = res.data?.data?.data || res.data?.data || [];
        setMedia(items);
      } catch (error) {
        console.error("Failed to load media:", error);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };
    fetchMedia();
  }, [selectedCategory]);

  const galleryItems = media.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.name || "Untitled",
    description: item.description || "",
    category: item.categories?.[0]?.name ?? "General",
    thumbnail: item.thumbnail_url || item.url || "",
    url: item.url || "",
    date: item.created_at
      ? new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    duration: item.duration || null,
  }));

  return (
    <div className="gv" ref={rootRef}>
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden border-b-2 border-[color:var(--ink)]">
        <Sun className="gv-float pointer-events-none absolute right-10 top-28 hidden h-12 w-12 text-[color:var(--grass)] lg:block" />
        <Balloon className="gv-float pointer-events-none absolute left-4 top-1/2 hidden h-9 w-9 text-[color:var(--grass)] lg:block" />
        <StarDoodle className="gv-float pointer-events-none absolute bottom-16 right-1/4 hidden h-6 w-6 text-[color:var(--grass)] lg:block" />

        <div className="mx-auto gv-reveal max-w-8xl px-5 pt-28 pb-14 sm:pt-32 gv-margin">
          <div className="pl-6 sm:pl-20">
            <p className="gv-eyebrow flex items-center gap-2">
              Life at Growvest
              <Sparkle className="h-3.5 w-3.5 text-[color:var(--grass)]" />
            </p>
            <h1 className="gv-display mt-4 text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
              Activities &amp; happy{" "}
              <span className="gv-circle">moments</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg gv-t80">
              From spell bees and drawing contests to reading circles and fun
              learning games — a peek into everyday life at the academy.
            </p>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2.5 sm:gap-4">
              {stats.map((s) => (
                <div key={s.label} className="gv-box gv-pop p-3 text-center sm:p-4">
                  <div className="gv-display text-lg font-extrabold text-[color:var(--grass)] sm:text-2xl md:text-3xl">
                    {s.value}
                  </div>
                  <div className="text-[0.7rem] leading-tight gv-t70 sm:text-xs">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= FILTERS */}
      {categories.length > 1 && (
        <section className="border-b-2 border-[color:var(--ink)]">
          <div className="mx-auto gv-reveal max-w-8xl px-5 py-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = selectedCategory === category.slug;
                return (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`border-[1.5px] border-[color:var(--ink)] px-4 py-1.5 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-[color:var(--grass)] text-white"
                        : "bg-white hover:bg-[#f0fdf4]"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= GALLERY */}
      <section>
        <div className="mx-auto gv-reveal max-w-8xl px-5 py-14">
          {loading ? (
            <p className="gv-hand py-20 text-center text-2xl gv-t50">
              loading the gallery…
            </p>
          ) : galleryItems.length === 0 ? (
            <div className="gv-box mx-auto max-w-md p-10 text-center">
              <StarDoodle className="mx-auto mb-3 h-8 w-8 text-[color:var(--grass)]" />
              <p className="gv-display text-xl font-bold">Nothing here yet</p>
              <p className="mt-1 text-sm gv-t70">
                {selectedCategory !== "all"
                  ? "No media in this category yet — check back soon."
                  : "Photos and videos of our activities are coming soon."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMedia(item.id)}
                  className="gv-box gv-pop gv-press flex flex-col overflow-hidden text-left"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b-[1.5px] border-[color:var(--ink)] bg-[#f0fdf4]">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />

                    {item.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="grid h-14 w-14 place-items-center rounded-full border-[1.5px] border-[color:var(--ink)] bg-[color:var(--grass)] text-white">
                          <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                        </span>
                      </span>
                    )}

                    <span className="absolute left-3 top-3 inline-flex max-w-[85%] items-center gap-1.5 truncate border-[1.5px] border-[color:var(--ink)] bg-white px-2 py-0.5 text-xs font-semibold">
                      {item.type === "video" ? (
                        <Film className="h-3.5 w-3.5" />
                      ) : (
                        <ImageIcon className="h-3.5 w-3.5" />
                      )}
                      {item.category}
                    </span>

                    {item.duration && (
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 border border-[color:var(--ink)] bg-white px-2 py-0.5 text-xs font-medium">
                        <Clock className="h-3 w-3" /> {item.duration}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="gv-display font-bold leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-1.5 flex-1 text-sm gv-t70 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1.5 border-t border-dashed border-[color:var(--rule)] pt-3 text-xs gv-t50">
                      <Calendar className="h-3.5 w-3.5" /> {item.date}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== LIGHTBOX */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={media.find((m) => m.id === selectedMedia)?.url}
              alt="Full media"
              className="max-h-[90vh] w-full border-[1.5px] border-white object-contain"
              onError={(e) => {
                e.target.src = "/placeholder-large.jpg";
              }}
            />
            <button
              onClick={() => setSelectedMedia(null)}
              className="gv-btn gv-btn-ghost absolute right-3 top-3 !p-2"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
