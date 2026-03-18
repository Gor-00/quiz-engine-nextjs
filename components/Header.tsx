"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoriesDropdown } from "./CategoriesDropdown";
import { SearchBox } from "./SearchBox";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "./LanguageProvider";
import { signOut, useSession } from "next-auth/react";

export function Header() {
  const [open, setOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const { t } = useI18n();
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!catsOpen) return;
      const target = event.target as Node | null;
      if (target && categoriesRef.current?.contains(target)) return;
      setCatsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [catsOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-indigo-500/60 bg-slate-950">
            <Image
              src="/logo-quizloop.png"
              alt="QuizLoop logo"
              fill
              sizes="32px"
              className="object-cover"
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">QuizLoop</span>
        </Link>
        <button
          type="button"
          className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100 sm:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          Menu ☰
        </button>
        <nav className="hidden items-center gap-4 sm:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-100 hover:text-indigo-300"
          >
            {t("home")}
          </Link>
          <div ref={categoriesRef} className="relative hidden sm:block">
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-semibold text-slate-100 hover:text-indigo-300 whitespace-nowrap"
              onClick={() => setCatsOpen((v) => !v)}
            >
              {t("categories")} ▼
            </button>
            {catsOpen ? (
              <div className="absolute left-0 top-full z-40 mt-2 w-52 rounded-xl border border-slate-800 bg-slate-900/95 p-1 text-sm shadow-soft backdrop-blur">
                <CategoriesDropdown onItemClick={() => setCatsOpen(false)} />
              </div>
            ) : null}
          </div>
          <Link
            href="/popular"
            className="text-sm font-semibold text-slate-100 hover:text-indigo-300"
          >
            {t("popular")}
          </Link>
          <Link
            href="/new"
            className="text-sm font-semibold text-slate-100 hover:text-indigo-300"
          >
            {t("new")}
          </Link>
          <SearchBox />
          <LanguageSwitcher />
          {status !== "loading" ? (
            isAdmin ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100 hover:border-indigo-500/70 hover:text-indigo-300"
                >
                  Admin
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100 hover:border-rose-500/70 hover:text-rose-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100 hover:border-indigo-500/70 hover:text-indigo-300"
              >
                Admin login
              </Link>
            )
          ) : null}
        </nav>
      </div>
      {open ? (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 pb-3 pt-2 text-sm sm:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="py-1 text-slate-100"
              onClick={() => setOpen(false)}
            >
              {t("home")}
            </Link>
            <div className="border-t border-slate-800 pt-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("categories")}
              </p>
              <div className="mt-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
                <CategoriesDropdown onItemClick={() => setOpen(false)} />
              </div>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <Link
                href="/popular"
                className="block py-1 text-slate-100"
                onClick={() => setOpen(false)}
              >
                {t("popularQuizzes")}
              </Link>
              <Link
                href="/new"
                className="block py-1 text-slate-100"
                onClick={() => setOpen(false)}
              >
                {t("newQuizzes")}
              </Link>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <SearchBox />
              <div className="mt-2">
                <LanguageSwitcher />
              </div>
            </div>
            {status !== "loading" ? (
              <div className="border-t border-slate-800 pt-2">
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/admin"
                      className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      Admin
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setOpen(false);
                        await signOut({ callbackUrl: "/" });
                      }}
                      className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/admin/login"
                    className="inline-flex rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100"
                    onClick={() => setOpen(false)}
                  >
                    Admin login
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

