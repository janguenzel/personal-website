import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale, locales, ogLocales } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/provider";
import { site } from "@/lib/site";
import { TerminalShell } from "@/components/terminal/TerminalShell";
import { InlineScript } from "@/components/ui/InlineScript";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Runs before paint: apply persisted theme/scheme so there's no flash.
const NO_FOUC = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';d.setAttribute('data-theme',t);var s=localStorage.getItem('scheme')||'green';d.setAttribute('data-scheme',s);}catch(e){}})();`;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(hasLocale(locale) ? locale : "en");
  return {
    metadataBase: new URL(site.url),
    title: { default: site.name, template: `%s — ${site.name}` },
    description: dict.meta.home.description,
    applicationName: site.name,
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: ogLocales[hasLocale(locale) ? locale : "en"],
    },
    twitter: {
      card: "summary_large_image",
      creator: site.twitterHandle || undefined,
    },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  // Note: data-theme / data-scheme are intentionally NOT set as JSX props here.
  // The no-FOUC script below sets them before paint on hard loads; the store owns
  // them at runtime and re-asserts them onto <html> after every (soft) navigation
  // (see TerminalShell), which keeps the user's theme through a language switch.
  // Hardcoding them in JSX would make React reset them to the defaults on every
  // client re-render, reverting the user's chosen theme.
  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh">
        {/* Runs during HTML parsing on hard navigations so the persisted theme
            is applied before first paint (no flash). InlineScript emits an inert
            text/plain tag on the client, so the React 19 "script tag while
            rendering" warning never fires when this layout re-renders on a soft
            navigation (e.g. switching language). */}
        <InlineScript id="no-fouc" html={NO_FOUC} />
        <I18nProvider locale={locale} dict={dict}>
          <TerminalShell locale={locale}>{children}</TerminalShell>
        </I18nProvider>
      </body>
    </html>
  );
}
