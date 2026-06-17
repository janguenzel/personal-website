"use client";

import { useI18n } from "@/lib/i18n/provider";
import { localePath, primaryNav } from "@/lib/nav";
import { NotFoundTerminal } from "@/components/terminal/NotFoundTerminal";
import { site } from "@/lib/site";

export default function NotFound() {
  const { t, locale } = useI18n();
  const options = primaryNav.map((n) => ({
    label: t(`notFound.targets.${n.key}`),
    href: localePath(locale, n.segment),
  }));
  return (
    <NotFoundTerminal
      promptLabel={`${site.user}@${site.host}`}
      errorLabel={t("notFound.error")}
      chooseLabel={t("notFound.choose")}
      hint={t("notFound.hint")}
      options={options}
      fallbackUrl={site.url}
    />
  );
}
