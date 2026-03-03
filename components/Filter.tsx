import Link from "next/link";
import { Category, getCategorySlug } from "@/lib/games";

type FilterChipProps = {
  label: string;
  icon?: string;
  href?: string;
};

function FilterChip({ label, icon, href }: FilterChipProps) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium border-slate-200 bg-white text-slate-700 shadow-sm";

  const content = (
    <>
      {icon ? <span className={`iconfont ${icon}`} /> : null}
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={icon ? `${base} gap-1` : base}>
        {content}
      </Link>
    );
  }

  return (
    <span className={icon ? `${base} gap-1` : base}>
      {content}
    </span>
  );
}

type FilterProps = {
  categories: Category[];
  variant?: "desktop" | "mobile";
};

export default function Filter({ categories, variant = "desktop" }: FilterProps) {
  return (
    <section aria-label="Game filters" className={variant === "mobile" ? "space-y-4 md:hidden" : "hidden md:block"}>
      <div className="flex flex-wrap gap-3">
        <FilterChip label="New" icon="icon-new" href="/browse?sort=newest" />
        <FilterChip label="Popular" icon="icon-icon_Popular" href="/browse?sort=popular" />
        {categories.map((category) => {
          const slug = getCategorySlug(category.label);
          return (
            <FilterChip
              key={category.value}
              label={category.label}
              href={`/category/${slug}`}
            />
          );
        })}
      </div>
    </section>
  );
}
