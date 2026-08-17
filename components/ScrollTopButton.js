"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./ScrollTopButton.module.css";

export default function ScrollTopButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (pathname && pathname.startsWith("/admin")) return null;

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Remonter en haut"
      className={`${styles.fab} ${visible ? styles.show : ""}`}
    >
      ↑
    </button>
  );
}
