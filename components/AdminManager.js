"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./AdminManager.module.css";
import { categories } from "../data/categories";

const TABS = [
  { section: "best", label: "Best-sellers" },
  { section: "new", label: "Nouveautés" },
  { section: "avis", label: "Tchat" },
];

const emptyForm = () => ({
  name: "",
  grade: "",
  description: "",
  variant: "",
  category: "",
  postal: true,
  meetup: true,
  vitrine: false,
  soldout: false,
});

export default function AdminManager() {
  const [section, setSection] = useState("best");
  const current = TABS.find((t) => t.section === section) || TABS[0];

  const [form, setForm] = useState(emptyForm());
  const [tiers, setTiers] = useState([{ weight: "", price: "" }]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [chatEnabled, setChatEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => setChatEnabled(!(s && s.chat_enabled === "false")))
      .catch(() => {});
  }, []);

  async function toggleChat() {
    const next = !chatEnabled;
    setChatEnabled(next);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "chat_enabled", value: next ? "true" : "false" }),
      });
    } catch {
      setChatEnabled(!next);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch("/api/chat", { cache: "no-store" });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data.slice().reverse() : []);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    if (section === "avis") loadReviews();
  }, [section, loadReviews]);

  async function removeReview(review) {
    if (!confirm(`Supprimer le message de « ${review.author} » ?`)) return;
    setDeletingReviewId(review.id);
    try {
      const res = await fetch(`/api/chat?id=${encodeURIComponent(review.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setReviews((list) => list.filter((r) => r.id !== review.id));
    } catch {
      setStatus({ type: "err", msg: "Suppression de l'avis échouée." });
    } finally {
      setDeletingReviewId(null);
    }
  }

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setTier = (i, key) => (e) => {
    const v = e.target.value;
    setTiers((list) => list.map((t, idx) => (idx === i ? { ...t, [key]: v } : t)));
  };
  const addTier = () => setTiers((list) => [...list, { weight: "", price: "" }]);
  const removeTier = (i) =>
    setTiers((list) => (list.length > 1 ? list.filter((_, idx) => idx !== i) : list));

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const resetForm = () => {
    setForm(emptyForm());
    setTiers([{ weight: "", price: "" }]);
    setFile(null);
    setPreview(null);
  };

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const cleanTiers = tiers.filter((t) => t.weight.trim() || t.price.trim());
      if (cleanTiers.length === 0) throw new Error("Ajoute au moins un poids + prix.");

      let imageUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.error || "Upload de l'image échoué");
        imageUrl = upData.url;
      }

      const body = {
        ...form,
        section,
        image: imageUrl,
        prices: cleanTiers,
        weight: cleanTiers[0].weight,
        price: cleanTiers[0].price,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setStatus({ type: "ok", msg: `Produit « ${data.name} » ajouté ✓` });
      resetForm();
      load();
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function toggleStock(item) {
    const next = !item.soldout;
    setItems((list) => list.map((p) => (p.id === item.id ? { ...p, soldout: next } : p)));
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soldout: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems((list) => list.map((p) => (p.id === item.id ? { ...p, soldout: !next } : p)));
      setStatus({ type: "err", msg: "Mise à jour du stock échouée." });
    }
  }

  async function remove(item) {
    if (!confirm(`Supprimer « ${item.name} » ? Cette action est définitive.`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setItems((list) => list.filter((p) => p.id !== item.id));
    } catch (err) {
      setStatus({ type: "err", msg: `Suppression échouée : ${err.message}` });
    } finally {
      setDeletingId(null);
    }
  }

  const list = items.filter((p) =>
    section === "new" ? p.section === "new" : p.section !== "new"
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin — Produits</h1>
        <p className={styles.subtitle}>Ajouter et gérer tous les produits</p>
      </header>

      <div className={styles.layout}>
        <nav className={styles.sidebar}>
          {TABS.map((t) => (
            <button
              key={t.section}
              type="button"
              onClick={() => {
                setSection(t.section);
                setStatus(null);
              }}
              className={`${styles.tab} ${t.section === section ? styles.tabActive : ""}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className={styles.content}>
          {section !== "avis" && (
          <>
          <form className={styles.form} onSubmit={submit}>
            <h2 className={styles.sectionTitle}>Ajouter dans « {current.label} »</h2>

            {/* Photo */}
            <div className={styles.field}>
              <span className={styles.lbl}>Photo du produit</span>
              <label className={styles.upload}>
                {preview ? (
                  <img src={preview} alt="aperçu" className={styles.previewImg} />
                ) : (
                  <span className={styles.uploadHint}>📷 Choisir une image</span>
                )}
                <input type="file" accept="image/*" onChange={onFile} hidden />
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.lbl}>Nom *</span>
              <input className={styles.input} value={form.name} onChange={set("name")} required placeholder="ICE HASH ENVOÛTER" />
            </label>

            <label className={styles.field}>
              <span className={styles.lbl}>Grade / sous-titre</span>
              <input className={styles.input} value={form.grade} onChange={set("grade")} placeholder="GRADE A+" />
            </label>

            <label className={styles.field}>
              <span className={styles.lbl}>Description</span>
              <textarea className={styles.textarea} value={form.description} onChange={set("description")} rows={2} placeholder="Temple ball ice…" />
            </label>

            <label className={styles.field}>
              <span className={styles.lbl}>Variété</span>
              <input className={styles.input} value={form.variant} onChange={set("variant")} placeholder="WHITE MAGIC ZKITTLEZ" />
            </label>

            <label className={styles.field}>
              <span className={styles.lbl}>Catégorie</span>
              <select className={styles.input} value={form.category} onChange={set("category")}>
                <option value="">— Aucune —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Tarifs multiples */}
            <div className={styles.field}>
              <span className={styles.lbl}>Tarifs (poids + prix)</span>
              {tiers.map((t, i) => (
                <div key={i} className={styles.tierRow}>
                  <input className={styles.input} value={t.weight} onChange={setTier(i, "weight")} placeholder="2G" />
                  <input className={styles.input} value={t.price} onChange={setTier(i, "price")} placeholder="30.00 €" />
                  <button type="button" className={styles.tierDel} onClick={() => removeTier(i)} aria-label="Retirer">
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className={styles.addTier} onClick={addTier}>
                + Ajouter un tarif
              </button>
            </div>

            <div className={styles.checks}>
              <label className={styles.check}>
                <input type="checkbox" checked={form.postal} onChange={set("postal")} /> Livraison
              </label>
              <label className={styles.check}>
                <input type="checkbox" checked={form.meetup} onChange={set("meetup")} /> Meet-up
              </label>
              <label className={styles.check}>
                <input type="checkbox" checked={form.vitrine} onChange={set("vitrine")} /> Vitrine
              </label>
              <label className={styles.check}>
                <input type="checkbox" checked={form.soldout} onChange={set("soldout")} /> En rupture
              </label>
            </div>

            {status && (
              <div className={status.type === "ok" ? styles.ok : styles.err}>{status.msg}</div>
            )}

            <button className={styles.submit} type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : `Ajouter dans ${current.label}`}
            </button>
          </form>

          <section className={styles.list}>
            <h2 className={styles.sectionTitle}>
              {current.label} existants {!loading && <span className={styles.count}>({list.length})</span>}
            </h2>

            {loading ? (
              <p className={styles.muted}>Chargement…</p>
            ) : list.length === 0 ? (
              <p className={styles.muted}>Aucun produit dans « {current.label} ». Ajoute-en un ci-dessus.</p>
            ) : (
              list.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <img
                    src={item.image || "/product-placeholder.svg"}
                    alt=""
                    className={styles.itemThumb}
                  />
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>
                      {item.name}
                      {item.soldout && <span className={styles.ruptureTag}>RUPTURE</span>}
                    </span>
                    <span className={styles.itemMeta}>
                      {Array.isArray(item.prices) && item.prices.length
                        ? item.prices.map((p) => `${p.weight} ${p.price}`).join(" · ")
                        : item.price}
                      {item.category &&
                        ` — ${
                          categories.find((c) => c.id === item.category)?.label ||
                          item.category
                        }`}
                    </span>
                  </div>
                  <div className={styles.itemActions}>
                    <button
                      className={styles.stockBtn}
                      type="button"
                      onClick={() => toggleStock(item)}
                    >
                      {item.soldout ? "Remettre en stock" : "Mettre en rupture"}
                    </button>
                    <button
                      className={styles.delBtn}
                      type="button"
                      onClick={() => remove(item)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? "…" : "Supprimer"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
          </>
          )}

          {section === "avis" && (
            <section className={styles.list}>
              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>Tchat visible pour les clients</div>
                  <div className={styles.toggleSub}>
                    {chatEnabled
                      ? "Activé — l'onglet Tchat s'affiche"
                      : "Désactivé — l'onglet est masqué"}
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.switch} ${chatEnabled ? styles.switchOn : ""}`}
                  onClick={toggleChat}
                  aria-pressed={chatEnabled}
                  aria-label="Activer/désactiver le tchat"
                >
                  <span className={styles.knob} />
                </button>
              </div>

              <h2 className={styles.sectionTitle}>
                Messages du tchat{" "}
                {!loadingReviews && <span className={styles.count}>({reviews.length})</span>}
              </h2>
              {loadingReviews ? (
                <p className={styles.muted}>Chargement…</p>
              ) : reviews.length === 0 ? (
                <p className={styles.muted}>Aucun message pour l'instant.</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{r.author}</span>
                      <span className={styles.itemMeta}>{r.message}</span>
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.delBtn}
                        type="button"
                        onClick={() => removeReview(r)}
                        disabled={deletingReviewId === r.id}
                      >
                        {deletingReviewId === r.id ? "…" : "Supprimer"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
