import React, { useEffect, useRef, useState } from "react";
import { Check, ArrowUpRight } from "lucide-react";
import { publicApi } from "@/lib/axios";
import { useGsapReveal } from "@/hooks/useGsapReveal";

// Direct WhatsApp order number (Growvest School Kit)
const WHATSAPP_NUMBER = "919445238959";

// Map backend theme -> ink-book accent (CSS var)
const ACCENT = {
  green: "var(--grass)",
  blue: "var(--ink)",
  purple: "var(--plum)",
  orange: "var(--star)",
  red: "var(--red)",
};

// Shown only when the store has no products yet (mirrors the poster)
const FALLBACK_PRODUCTS = [
  {
    id: "f-basic",
    name: "Basic Kit",
    price: 199,
    best_for: "LKG – 2nd Std",
    theme: "green",
    features: ["2 Notebooks", "2 Pencils", "1 Pen", "Eraser", "Sharpener", "Scale", "Name Stickers"],
    image_url: null,
    in_stock: true,
  },
  {
    id: "f-standard",
    name: "Standard Kit",
    price: 399,
    best_for: "3rd – 5th Std",
    theme: "blue",
    features: [
      "4 Notebooks", "Pencil Box", "2 Pens", "2 Pencils", "Eraser & Sharpener",
      "Scale", "Crayons / Colour Pencils", "Water Bottle", "Name Stickers",
    ],
    image_url: null,
    in_stock: true,
  },
  {
    id: "f-premium",
    name: "Premium Kit",
    price: 699,
    best_for: "6th – 10th Std",
    theme: "purple",
    features: [
      "6 Notebooks", "Geometry Box", "Pencil Box", "Pens & Pencils Set", "Crayons / Colour Kit",
      "Water Bottle", "Lunch Box", "School Labels", "Study Materials", "Small School Bag",
    ],
    image_url: null,
    in_stock: true,
  },
];

const formatPrice = (p) =>
  `₹${Number(p).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const buildWhatsAppLink = (product) => {
  const message =
    `Hello Growvest Academy! 👋\n\n` +
    `I'd like to order the *${product.name}* (${formatPrice(product.price)}).` +
    (product.best_for ? `\nFor: ${product.best_for}` : "") +
    `\n\nPlease share the next steps. Thank you!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const KitCard = ({ product }) => {
  const accent = ACCENT[product.theme] || ACCENT.blue;

  return (
    <div className="gv-box gv-pop relative flex flex-col">
      {/* class tab */}
      <div
        className="flex items-baseline justify-between px-5 py-3 border-b-[1.5px] border-[color:var(--ink)]"
        style={{ background: accent, color: "#fff" }}
      >
        <span className="gv-display text-xl font-bold">{product.name}</span>
        <span className="text-xs font-semibold uppercase tracking-widest opacity-85">
          {product.best_for}
        </span>
      </div>

      {/* price tag sticker */}
      <div className="px-5 pt-5">
        <span className="inline-block -rotate-2 border-[1.5px] border-[color:var(--ink)] bg-[color:var(--paper)] gv-pop-red px-3 py-1">
          <span className="gv-display text-2xl font-extrabold">
            {formatPrice(product.price)}
          </span>
          {product.original_price &&
            Number(product.original_price) > Number(product.price) && (
              <span className="ml-2 text-sm gv-t50 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
        </span>
      </div>

      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="mx-5 mt-4 border-[1.5px] border-[color:var(--ink)] object-cover"
          style={{ height: "10rem", width: "calc(100% - 2.5rem)" }}
          loading="lazy"
        />
      )}

      {/* supply checklist */}
      <div className="px-5 py-4">
        <p className="gv-eyebrow gv-t50 mb-1">Inside the box</p>
        <ul>
          {(product.features || []).map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 border-b border-dashed border-[color:var(--rule)] py-2 last:border-b-0"
            >
              <span
                className="grid h-4 w-4 shrink-0 place-items-center border border-[color:var(--ink)]"
                aria-hidden
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* order */}
      <div className="mt-auto p-5 pt-0">
        {product.in_stock === false ? (
          <span className="gv-btn gv-btn-ghost w-full cursor-not-allowed opacity-50">
            Out of stock
          </span>
        ) : (
          <a
            href={buildWhatsAppLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="gv-btn gv-btn-go gv-pop gv-press w-full"
          >
            Order on WhatsApp <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
};

const Store = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef(null);
  useGsapReveal(rootRef);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await publicApi.getProducts();
        const list = res?.data || [];
        if (active) setProducts(list.length ? list : FALLBACK_PRODUCTS);
      } catch {
        if (active) setProducts(FALLBACK_PRODUCTS);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="gv min-h-screen" ref={rootRef}>
      {/* ========================================================= MASTHEAD */}
      <section className="border-b-2 border-[color:var(--ink)]">
        <div className="mx-auto gv-reveal max-w-8xl px-5 pt-28 pb-12 sm:pt-32 gv-margin">
          <div className="pl-6 sm:pl-20">
            <p className="gv-eyebrow">Best quality · Low price · Complete solution</p>
            <h1 className="gv-display mt-4 text-4xl sm:text-6xl font-extrabold leading-[0.95] tracking-tight">
              The Growvest{" "}
              <span className="text-[color:var(--red)]">School Kit</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg gv-t80">
              One box with every book and supply your child needs for the year.
              Pick the kit for their class and order it straight over WhatsApp —
              no forms, no accounts.
            </p>
            <p className="mt-5 gv-hand text-2xl text-[color:var(--red)]">
              tick the list, tap order, done ✓
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= PRODUCTS */}
      <section className="border-b-2 border-[color:var(--ink)] bg-[#f0fdf4]">
        <div className="mx-auto gv-reveal max-w-8xl px-5 py-14">
          {loading ? (
            <p className="gv-hand py-16 text-center text-2xl gv-t50">
              opening the store…
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <KitCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================= HELP */}
      <section>
        <div className="gv-reveal mx-auto max-w-3xl px-5 py-16 text-center">
          <p className="gv-eyebrow">Not sure which kit?</p>
          <h2 className="gv-display mt-3 text-3xl font-bold">
            Tell us your child's class and we'll help you pick.
          </h2>
          <div className="mt-7 flex justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                "Hello Growvest Academy! I'd like help choosing a school kit."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gv-btn gv-btn-go gv-pop gv-press"
            >
              Chat on WhatsApp <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-4 gv-hand text-xl gv-t50">
            +91 94452 38959
          </p>
        </div>
      </section>
    </div>
  );
};

export default Store;
