import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { seoGenerator } from "@/lib/seoGenerator";
import { StickyAd } from "@/components/StickyAd";
import { Header } from "@/components/Header";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = seoGenerator.base({
  title: "QuizLoop",
  description:
    "QuizLoop – viral quizzes optimized for Facebook traffic, mobile users, and AdSense revenue.",
  url: "/"
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        {adsenseClient ? (
          <Script
            id="adsense-script"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <AuthProvider>
          <LanguageProvider>
            <div className="bg-hero-glow">
              <Header />
              <main className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-6">
                {children}
              </main>
            </div>
            <StickyAd />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

