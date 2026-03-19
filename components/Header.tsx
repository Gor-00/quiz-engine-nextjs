"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoriesDropdown } from "./CategoriesDropdown";
import { AdSlot } from "./AdSlot";
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

  // When the mobile menu is open, prevent background scrolling.
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const html = document.documentElement;
    const prevOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // Hide scrollbar / keep layout stable.
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollBarWidth > 0) body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    // If the user rotates/resizes to desktop, ensure the mobile menu closes.
    function onResize() {
      if (window.innerWidth >= 640) setOpen(false);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // Avoid having both dropdowns open at once on small screens.
    if (open) setCatsOpen(false);
  }, [open]);

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

        {/* Mobile search lives in the top bar (not inside the menu panel). */}
        <div className="mx-3 flex-1 sm:hidden">
          {open ? null : <SearchBox />}
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-100 sm:hidden"
          onClick={() => {
            setCatsOpen(false);
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          ☰
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
                Login
              </Link>
            )
          ) : null}
        </nav>
      </div>
      {open ? (
        <>
          <div
            className="fixed inset-0 z-20 bg-slate-950/98 sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
            className="relative h-screen z-30 border-t border-slate-800 bg-slate-950/95 px-4 pb-4 pt-3 text-sm sm:hidden max-h-[calc(100vh-4.5rem)] overflow-y-auto"
          >
            <div className="flex flex-col gap-2">
              <div className="border-b border-slate-800/70 pb-3">
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <LanguageSwitcher />

                  {status !== "loading" ? (
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      {isAdmin ? (
                        <Link
                          href="/admin"
                          className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100 hover:border-indigo-500/70 hover:text-indigo-300"
                          onClick={() => setOpen(false)}
                        >
                          Admin
                        </Link>
                      ) : (
                        <Link
                          href="/admin/login"
                          className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100 hover:border-indigo-500/70 hover:text-indigo-300"
                          onClick={() => setOpen(false)}
                        >
                          Admin login
                        </Link>
                      )}

                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={async () => {
                            setOpen(false);
                            await signOut({ callbackUrl: "/" });
                          }}
                          className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100 hover:border-rose-500/70 hover:text-rose-300"
                        >
                          Logout
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              <Link
                href="/"
                className="block rounded-lg py-2 text-slate-100 hover:bg-slate-900/60"
                onClick={() => setOpen(false)}
              >
                {t("home")}
              </Link>

              <div className="border-t border-slate-800 pt-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("categories")}
                </p>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-1">
                  <CategoriesDropdown onItemClick={() => setOpen(false)} />

                  <Link
                    href="/popular"
                    className="block rounded-lg px-3 py-2 text-slate-100 hover:bg-slate-800"
                    onClick={() => setOpen(false)}
                  >
                    {t("popularQuizzes")}
                  </Link>
                  <Link
                    href="/new"
                    className="block rounded-lg px-3 py-2 text-slate-100 hover:bg-slate-800"
                    onClick={() => setOpen(false)}
                  >
                    {t("newQuizzes")}
                  </Link>

                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}

