"use client";

import { useCallback, useEffect, useState } from "react";
import ReviewCard from "./ReviewCard";
import styles from "./ReviewsSection.module.css";

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [stars, setStars] = useState(5);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, message, stars }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setStatus({ type: "ok", msg: "Merci pour ton avis ✓" });
      setAuthor("");
      setMessage("");
      setStars(5);
      setOpen(false);
      load();
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.wrap}>
      {!open && (
        <button className={styles.leaveBtn} type="button" onClick={() => setOpen(true)}>
          ✍️ Laisser un avis
        </button>
      )}

      {open && (
        <form className={styles.form} onSubmit={submit}>
          <input
            className={styles.input}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Ton nom"
            required
          />

          <div className={styles.starsPick}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={styles.starBtn}
                onClick={() => setStars(n)}
                aria-label={`${n} étoiles`}
              >
                <span className={n <= stars ? styles.starOn : styles.starOff}>★</span>
              </button>
            ))}
          </div>

          <textarea
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Ton avis…"
            required
          />

          {status && (
            <div className={status.type === "ok" ? styles.ok : styles.err}>{status.msg}</div>
          )}

          <div className={styles.actions}>
            <button className={styles.cancel} type="button" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button className={styles.submit} type="submit" disabled={saving}>
              {saving ? "Envoi…" : "Publier"}
            </button>
          </div>
        </form>
      )}

      {status && !open && status.type === "ok" && (
        <div className={styles.ok}>{status.msg}</div>
      )}

      <div className={styles.list}>
        {loading ? (
          <p className={styles.muted}>Chargement…</p>
        ) : reviews.length === 0 ? (
          <p className={styles.muted}>Aucun avis pour l'instant. Sois le premier ! 🌟</p>
        ) : (
          reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </div>
    </div>
  );
}
