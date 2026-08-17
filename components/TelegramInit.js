"use client";

import { useEffect } from "react";

// Initialise l'intégration Telegram Mini App (plein écran + couleurs de barre).
// Sans effet hors de Telegram (ex : navigateur classique), donc 100% sûr.
export default function TelegramInit() {
  useEffect(() => {
    const tg = typeof window !== "undefined" && window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();

    try {
      tg.setHeaderColor("#0b0e1a");
      tg.setBackgroundColor("#0b0e1a");
    } catch {
      /* méthodes indisponibles sur d'anciennes versions — on ignore */
    }

    // Évite la fermeture accidentelle par swipe vers le bas (versions récentes).
    try {
      tg.disableVerticalSwipes?.();
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
