"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          Admin panel
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Manage quizzes, categories, and analytics. Changes are stored in
          MongoDB and reflected on the live site.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <AdminCard
          title="Create quiz"
          description="Add a new multi-language quiz with ads configuration."
          href="/admin/create-quiz"
        />
        <AdminCard
          title="View analytics"
          description="See views, completions, and CTR per quiz."
          href="/admin/analytics"
        />
      </section>
    </div>
  );
}

type CardProps = {
  title: string;
  description: string;
  href: string;
};

function AdminCard({ title, description, href }: CardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft transition hover:border-indigo-500/70 hover:bg-slate-900"
    >
      <h2 className="text-base font-semibold text-slate-50">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      <span className="mt-3 text-xs font-semibold text-indigo-400">
        Open →
      </span>
    </Link>
  );
}

