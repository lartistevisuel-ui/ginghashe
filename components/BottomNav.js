"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";
import { cartCount } from "../lib/cart";
import { hasUnseenOrders } from "../lib/orders";

const TABS = [
  { id: "home", label: "Accueil", href: "/" },
  { id: "favorites", label: "Favoris", href: "/favoris" },
  { id: "cart", label: "Panier", href: "/panier" },
  { id: "reviews", label: "Avis", href: "/avis" },
  { id: "help", label: "Aide", href: "/aide" },
  { id: "account", label: "Compte", href: "/compte" },
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
    case "cart":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8h12l-1 11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8Z" strokeLinejoin="round" />
          <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [ordersDot, setOrdersDot] = useState(false);

  useEffect(() => {
    const sync = () => setCount(cartCount());
    sync();
    window.addEventListener("cart-changed", sync);

    const syncOrders = () => setOrdersDot(hasUnseenOrders());
    syncOrders();
    window.addEventListener("orders-changed", syncOrders);

    return () => {
      window.removeEventListener("cart-changed", sync);
      window.removeEventListener("orders-changed", syncOrders);
    };
  }, []);

  // Pas de barre de navigation sur les pages admin
  if (pathname && pathname.startsWith("/admin")) return null;

  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={styles.item}
            aria-current={active ? "page" : undefined}
            aria-label={tab.label}
          >
            <span
              className={`${styles.iconWrap} ${
                active ? styles.iconWrapActive : ""
              }`}
            >
              <Icon id={tab.id} />
              {tab.id === "cart" && count > 0 && (
                <span className={styles.badge}>{count}</span>
              )}
              {tab.id === "account" && ordersDot && (
                <span className={styles.dot} />
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
