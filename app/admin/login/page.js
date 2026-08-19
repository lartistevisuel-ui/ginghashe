"use client";

import { useState } from "react";
import styles from "./login.module.css";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) {
        window.location.href = "/admin";
        return;
      }
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Mot de passe incorrect.");
    } catch {
      setErr("Erreur réseau, réessaie.");
    }
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={submit}>
        <div className={styles.lock}>🔒</div>
        <h1 className={styles.title}>Espace admin</h1>
        <p className={styles.sub}>Entre le mot de passe pour continuer.</p>

        <input
          className={styles.input}
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Mot de passe"
          autoFocus
          autoComplete="current-password"
        />

        {err && <div className={styles.err}>{err}</div>}

        <button className={styles.btn} type="submit" disabled={loading || !pw}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
