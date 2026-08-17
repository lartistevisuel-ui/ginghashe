"use client";

import { useState } from "react";
import styles from "./BottomNav.module.css";

const TABS = [
  { id: "home", label: "Accueil" },
  { id: "favorites", label: "Favoris" },
  { id: "reviews", label: "Avis" },
  { id: "help", label: "Aide" },
  { id: "account", label: "Compte" },
];

function Icon({ id }) {
  switch (id) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "favorites":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3.5l2.6 5.6 6 .8-4.4 4.2 1 6-5.2-2.9-5.2 2.9 1-6-4.4-4.2 6-.8Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "reviews":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 5.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4 3.5V16H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "help":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.3a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.2 1-1.2 1.9" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "account":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const [active, setActive] = useState("home");

  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={styles.item}
          aria-current={active === tab.id ? "page" : undefined}
          aria-label={tab.label}
          onClick={() => setActive(tab.id)}
        >
          <span
            className={`${styles.iconWrap} ${
              active === tab.id ? styles.iconWrapActive : ""
            }`}
          >
            <Icon id={tab.id} />
          </span>
        </button>
      ))}
    </nav>
  );
}
