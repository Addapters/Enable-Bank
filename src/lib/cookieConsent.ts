const STORAGE_KEY = "enable-bank-cookie-consent";
const CONSENT_CHANGED_EVENT = "enable-bank:consent-changed";

// Disparado por qualquer sítio do site (ex: link "Gerir cookies" no footer) para reabrir
// o painel de preferências depois do utilizador já ter aceitado/rejeitado.
export const OPEN_COOKIE_PREFERENCES_EVENT = "enable-bank:open-cookie-preferences";

export interface Consent {
  essenciais: true;
  estatisticas: boolean;
  atualizado_em: string;
}

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export function writeConsent(estatisticas: boolean) {
  const consent: Consent = { essenciais: true, estatisticas, atualizado_em: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}

// Sincroniza com o localStorage via useSyncExternalStore (em vez de useEffect+setState) — evita
// re-renders em cascata no mount e funciona corretamente com SSR (o snapshot do servidor nunca
// toca localStorage). Uma escrita nesta aba não dispara o evento nativo "storage" (só dispara
// nas OUTRAS abas), por isso writeConsent dispara também um evento próprio.
export function subscribeToConsent(callback: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getStatisticsConsentSnapshot() {
  return readConsent()?.estatisticas ? "granted" : "not-granted";
}

export function getServerStatisticsConsentSnapshot() {
  return "not-granted";
}

export function getConsentSnapshot() {
  return readConsent() ? "recorded" : "missing";
}

export function getServerConsentSnapshot() {
  return "missing";
}
