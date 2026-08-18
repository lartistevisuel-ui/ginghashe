"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ProductReviews.module.css";

function stars(n) {
  const s = Math.max(0, Math.min(5, Number(n) || 0));
  return "★".repeat(s) + "☆".repeat(5 - s);
}

const PLACEHOLDER =
  "Votre commentaire… (markdown : **gras**, *italique*, [lien](https://…))";

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [tgName, setTgName] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [anon, setAnon] = useState(false);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const u =
      typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (u) {
      const n = u.first_name
        ? `${u.first_name}${u.last_name ? " " + u.last_name : ""}`
        : u.username || "";
      if (n) setTgName(n);
    }
    load();
  }, [load]);

  function onPickImages(e) {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked].slice(0, 6));
    e.target.value = "";
  }
  function removeFile(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e) {
    e.preventDefault();
    const author = anon ? "Anonyme" : (tgName || name).trim();
    if (!author || !message.trim() || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      // Upload des images
      const urls = [];
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const d = await up.json();
        if (up.ok && d.url) urls.push(d.url);
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author,
          message: message.trim(),
          stars: rating,
          product_id: productId,
          images: urls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setStatus({ type: "ok", msg: "Merci ! Ton avis sera publié après validation ✓" });
      setMessage("");
      setRating(5);
      setFiles([]);
      setAnon(false);
      setOpen(false);
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  const avg =
    reviews.length > 0
      ? (reviews.reduce((t, r) => t + (Number(r.stars) || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <section className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.titleH}>
          Avis {avg && <span className={styles.avg}>★ {avg} ({reviews.length})</span>}
        </h2>
        {!open && (
          <button className={styles.leaveBtn} type="button" onClick={() => setOpen(true)}>
            ✍️ Laisser un avis
          </button>
        )}
      </div>

      {open && (
        <form className={styles.form} onSubmit={submit}>
          <span className={styles.formTitle}>Laisser un avis</span>
          <span className={styles.formSub}>
            Avis envoyé via Telegram, publié après validation d'un administrateur
          </span>

          {!tgName && !anon && (
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton nom"
            />
          )}

          <div className={styles.starsPick}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={styles.starBtn}
                onClick={() => setRating(n)}
                aria-label={`${n} étoiles`}
              >
                <span className={n <= rating ? styles.on : styles.off}>★</span>
              </button>
            ))}
          </div>

          <textarea
            className={styles.textarea}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={PLACEHOLDER}
          />

          {files.length > 0 && (
            <div className={styles.previews}>
              {files.map((f, i) => (
                <div key={i} className={styles.preview}>
                  <img src={URL.createObjectURL(f)} alt="" />
                  <button type="button" onClick={() => removeFile(i)} aria-label="Retirer">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className={styles.imgBtn}
            onClick={() => fileRef.current?.click()}
            disabled={files.length >= 6}
          >
            🖼️ Ajouter des images ({files.length}/6)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={onPickImages}
          />

          {status && (
            <div className={status.type === "ok" ? styles.ok : styles.err}>{status.msg}</div>
          )}

          <div className={styles.bottomRow}>
            <label className={styles.anon}>
              <input
                type="checkbox"
                checked={anon}
                onChange={(e) => setAnon(e.target.checked)}
              />
              <span className={styles.anonTrack}>
                <span className={styles.anonKnob} />
              </span>
              👁 Anonyme
            </label>
            <button className={styles.submit} type="submit" disabled={saving}>
              {saving ? "Envoi…" : "✈ Envoyer"}
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
          <p className={styles.muted}>Aucun avis pour ce produit. Sois le premier ! 🌟</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className={styles.review}>
              <div className={styles.reviewHead}>
                <span className={styles.author}>{r.author}</span>
                <span className={styles.reviewStars}>{stars(r.stars)}</span>
              </div>
              <p className={styles.msg}>{r.message}</p>
              {Array.isArray(r.images) && r.images.length > 0 && (
                <div className={styles.reviewImgs}>
                  {r.images.map((u, i) => (
                    <img key={i} src={u} alt="" />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
