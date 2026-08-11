import { useState } from "react";
import { Plus } from "lucide-react";
import { useCart } from "../lib/cart";
import type { MenuItem } from "../lib/types";
import { CATEGORIES, categoryLabel, formatKes } from "../lib/types";

type MenuProps = {
  items: MenuItem[];
};

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  chapati: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
  mandazi: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
  samosas: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  yoghurts: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
  cakes: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
  catering: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&auto=format&fit=crop&q=80",
};

function ItemCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  const [optionId, setOptionId] = useState(item.options[0]?.id ?? "");
  const selected = item.options.find((o) => o.id === optionId) ?? item.options[0];
  const imageUrl = item.image_url || DEFAULT_CATEGORY_IMAGES[item.category] || DEFAULT_CATEGORY_IMAGES.chapati;

  return (
    <article className="flex flex-col justify-between overflow-hidden rounded-2xl border border-plum/10 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-plum/5">
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-plum-deep backdrop-blur-sm shadow-sm">
          {categoryLabel(item.category)}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="font-display text-lg font-bold text-plum-deep">{item.name}</h3>
          {item.tagline && <p className="mt-1 text-sm text-plum/60 leading-relaxed">{item.tagline}</p>}

          {item.options.length > 1 ? (
            <select
              value={optionId}
              onChange={(e) => setOptionId(e.target.value)}
              className="mt-3 w-full rounded-lg border border-plum/15 bg-cream px-3 py-2 text-sm text-plum-deep focus:outline-none focus:ring-2 focus:ring-plum/20"
            >
              {item.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} — {formatKes(Number(o.price))}
                </option>
              ))}
            </select>
          ) : (
            selected && (
              <p className="mt-3 font-medium text-plum text-sm sm:text-base">
                {selected.label} — {formatKes(Number(selected.price))}
              </p>
            )
          )}
        </div>

        <button
          type="button"
          disabled={!selected}
          onClick={() =>
            selected &&
            add({
              itemId: item.id,
              name: item.name,
              category: item.category,
              optionId: selected.id,
              option: selected.label,
              unit: selected.unit,
              price: Number(selected.price),
              image_url: imageUrl,
            })
          }
          className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-plum px-4 py-2.5 text-sm font-medium text-cream transition hover:bg-plum-deep active:scale-95 disabled:opacity-40"
        >
          <Plus size={16} />
          Add to cart
        </button>
      </div>
    </article>
  );
}

export function Menu({ items }: MenuProps) {
  const [filter, setFilter] = useState("all");
  const activeCategories = [...new Set(items.map((i) => i.category))];
  const filtered =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <section id="menu" className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 font-display text-2xl sm:text-3xl font-bold text-plum-deep">Our Menu</h2>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-plum/60">Fresh, made to order. Prices in Kenyan Shillings.</p>

        <div className="mb-8 flex overflow-x-auto no-scrollbar gap-2 pb-2 sm:flex-wrap sm:pb-0">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label="All" />
          {activeCategories.map((cat) => (
            <FilterPill
              key={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
              label={categoryLabel(cat)}
            />
          ))}
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition active:scale-95 ${
        active
          ? "bg-plum text-cream"
          : "border border-plum/20 text-plum/70 hover:border-plum/40 bg-white/50"
      }`}
    >
      {label}
    </button>
  );
}

export { CATEGORIES };
