"use client";

import { useEffect, useState } from "react";
import ui from "./UI.module.css";
import styles from "./AccountProfile.module.css";

export default function AccountProfile() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u =
      typeof window !== "undefined" &&
      window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (u) setUser(u);
    setReady(true);
  }, []);

  if (!ready) return null;

  const name = user
    ? `${user.first_name || ""}${user.last_name ? " " + user.last_name : ""}`.trim()
    : "Invité";

  return (
    <div className={ui.profile}>
      <span className={ui.avatar}>
        {user?.photo_url ? (
          <img src={user.photo_url} alt="" className={styles.avatarImg} />
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="8.5" r="3.5" />
            <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <div>
        <div className={ui.profileName}>{name}</div>
        {user ? (
          <div className={ui.muted}>
            {user.username ? `@${user.username}` : "Connecté via Telegram"}
          </div>
        ) : (
          <div className={ui.muted}>Ouvre l'app depuis Telegram pour te connecter</div>
        )}
      </div>
    </div>
  );
}
