"use client";

import Link from "next/link";
import categoriesData from "@/data/categories.json";

type CategoryMeta = {
  slug: string;
  name: string;
};

const categories = categoriesData as CategoryMeta[];

type Props = {
  onItemClick?: () => void;
};

export function CategoriesDropdown({ onItemClick }: Props) {
  return (
    <>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className="block rounded-lg px-3 py-2 text-slate-100 hover:bg-slate-800"
          onClick={onItemClick}
        >
          {cat.name}
        </Link>
      ))}
    </>
  );
}

