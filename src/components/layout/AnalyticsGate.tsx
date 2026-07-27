"use client";

import { useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/next";
import {
  subscribeToConsent,
  getStatisticsConsentSnapshot,
  getServerStatisticsConsentSnapshot,
} from "@/lib/cookieConsent";

// Só carrega o Vercel Analytics depois de o utilizador autorizar "Cookies estatísticos" no
// banner de cookies — ver CookieConsentBanner.tsx. Reage em tempo real a essa escolha via
// useSyncExternalStore, sem precisar de recarregar a página.
export default function AnalyticsGate() {
  const granted = useSyncExternalStore(subscribeToConsent, getStatisticsConsentSnapshot, getServerStatisticsConsentSnapshot);
  if (granted !== "granted") return null;
  return <Analytics />;
}
