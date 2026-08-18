"use client";

import { useState } from "react";
import styles from "./HelpSection.module.css";

const CartI = (
  <>
    <path d="M6 8h12l-1 11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </>
);
const TruckI = (
  <>
    <rect x="1" y="6" width="13" height="9" rx="1" />
    <path d="M14 9h4l3 3v3h-7z" />
    <circle cx="5.5" cy="17" r="1.5" />
    <circle cx="17" cy="17" r="1.5" />
  </>
);
const ClockI = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </>
);

const FAQ = [
  {
    icon: CartI,
    q: "Comment passer commande ?",
    a: "Choisis un produit, sélectionne la variété et la quantité, ajoute-le au panier, puis valide ta commande. Tu la reçois directement et on te recontacte pour finaliser.",
  },
  {
    icon: TruckI,
    q: "Quels modes de réception ?",
    a: "Livraison (badge LIVRAISON) ou remise en main propre (badge MEET-UP), selon le produit. Tu choisis au moment de la commande.",
  },
  {
    icon: ClockI,
    q: "Quels sont les délais ?",
    a: "Livraison rapide, et de nouveaux produits ajoutés chaque semaine. Écris-nous pour connaître les délais exacts selon ta zone.",
  },
];

export default function HelpSection() {
  const [open, setOpen] = useState(0);

  return (
    <div className={styles.wrap}>
      <div className={styles.faq}>
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}>
              <button
                type="button"
                className={styles.q}
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
              >
                <span className={styles.qIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                </span>
                <span className={styles.qText}>{item.q}</span>
                <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className={styles.answerWrap}>
                <div className={styles.answer}>
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.contact}>
        <div className={styles.contactGlow} />
        <span className={styles.contactTitle}>Une autre question ?</span>
        <span className={styles.contactSub}>
          Contacte-nous directement, on te répond vite 👑
        </span>
        <a
          href="https://t.me/Kingcmdbot"
          target="_blank"
          rel="noreferrer"
          className={styles.contactBtn}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M21.9 4.3 3.4 11.5c-1 .4-1 1.4 0 1.7l4.6 1.4 1.8 5.6c.2.6.5.7 1 .3l2.6-2.1 4.6 3.4c.6.4 1.2.1 1.4-.6l3-14.3c.2-.9-.4-1.4-1.1-1.1Z" />
          </svg>
          Nous contacter
        </a>
      </div>
    </div>
  );
}
