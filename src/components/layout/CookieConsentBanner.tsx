"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import { Cookie, X } from "lucide-react";
import {
  OPEN_COOKIE_PREFERENCES_EVENT,
  readConsent,
  writeConsent,
  subscribeToConsent,
  getConsentSnapshot,
  getServerConsentSnapshot,
} from "@/lib/cookieConsent";

export default function CookieConsentBanner() {
  const consentStatus = useSyncExternalStore(subscribeToConsent, getConsentSnapshot, getServerConsentSnapshot);
  const [forceOpen, setForceOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [estatisticas, setEstatisticas] = useState(false);

  useEffect(() => {
    const reopen = () => {
      const consent = readConsent();
      setEstatisticas(consent?.estatisticas ?? false);
      setShowPreferences(true);
      setForceOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, reopen);
  }, []);

  const visible = consentStatus === "missing" || forceOpen;
  if (!visible) return null;

  const close = () => {
    setForceOpen(false);
    setShowPreferences(false);
  };

  const acceptAll = () => {
    writeConsent(true);
    close();
  };

  const rejectAll = () => {
    writeConsent(false);
    close();
  };

  const savePreferences = () => {
    writeConsent(estatisticas);
    close();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6" role="dialog" aria-modal="true" aria-label="Preferências de cookies">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-xl">
        {!showPreferences ? (
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <Cookie className="w-5 h-5 text-purple-700" aria-hidden="true" />
              </span>
              <p className="text-sm text-gray-600">
                Usamos cookies essenciais para o funcionamento do site (como manter a tua sessão) e, com a tua autorização, estatísticas anónimas de visitas para melhorar a plataforma. Não utilizamos cookies de publicidade nem de análise de terceiros para outros fins. Podes escolher as tuas preferências ou consultar a nossa{" "}
                <Link href="/privacidade" className="text-purple-700 hover:underline">Política de Privacidade</Link>.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-stretch">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreferences(true)}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Preferências
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Rejeitar
                </button>
              </div>
              <button
                type="button"
                onClick={acceptAll}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-700 text-white hover:bg-purple-800 transition-colors"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Preferências de cookies</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar preferências"
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Cookies essenciais</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Necessários para autenticação e funcionamento básico do site. Não podem ser desativados.
                  </p>
                </div>
                <div className="shrink-0 mt-0.5 h-6 w-11 rounded-full bg-purple-700 relative" aria-hidden="true">
                  <span className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-white shadow" />
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Cookies estatísticos</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Usamos o Vercel Analytics para contar visitas e páginas vistas de forma agregada e anónima (sem cookies de rastreio nem identificação pessoal). Só é ativado se autorizares aqui.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={estatisticas}
                  onClick={() => setEstatisticas((v) => !v)}
                  className={`shrink-0 mt-0.5 h-6 w-11 rounded-full relative transition-colors ${estatisticas ? "bg-purple-700" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${estatisticas ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={rejectAll}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Rejeitar todos
              </button>
              <button
                type="button"
                onClick={savePreferences}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-700 text-white hover:bg-purple-800 transition-colors"
              >
                Guardar preferências
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
