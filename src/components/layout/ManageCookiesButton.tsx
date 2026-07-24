"use client";

import { OPEN_COOKIE_PREFERENCES_EVENT } from "./CookieConsentBanner";

export default function ManageCookiesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT))}
      className={className}
    >
      Gerir cookies
    </button>
  );
}
