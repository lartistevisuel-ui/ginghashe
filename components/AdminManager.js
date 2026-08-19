"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./AdminManager.module.css";
import { categories } from "../data/categories";

const TABS = [
  { section: "best", label: "Best-sellers" },
  { section: "new", label: "Nouveautés" },
  { section: "cats", label: "Catégories" },
  { section: "reviews", label: "Avis" },
  { section: "avis", label: "Tchat" },
];

const ICON_KEYS = [
  "extraction",
  "flowers",
  "edibbles",
  "prerolls",
  "goodies",
  "genetics",
  "default",
];

const emptyForm = () => ({
  name: "",
  grade: "",
  description: "",
  variant: "",
  category: "",
  video: "",
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

  // Modération des avis produits
  const [prodReviews, setProdReviews] = useState([]);
  const [loadingProdReviews, setLoadingProdReviews] = useState(false);
  const [deletingProdRev, setDeletingProdRev] = useState(null);

  // Réglages textes (bandeau + messages /start)
  const [texts, setTexts] = useState({
    marquee_text: "",
    start_caption: "",
    start_welcome: "",
  });
  const [savingText, setSavingText] = useState("");
  const [textStatus, setTextStatus] = useState(null);

  const loadProdReviews = useCallback(async () => {
    setLoadingProdReviews(true);
    try {
      const res = await fetch("/api/reviews?all=1", { cache: "no-store" });
      const data = await res.json();
      setProdReviews(Array.isArray(data) ? data : []);
    } catch {
      setProdReviews([]);
    } finally {
      setLoadingProdReviews(false);
    }
  }, []);

  useEffect(() => {
    if (section === "reviews") loadProdReviews();
  }, [section, loadProdReviews]);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((s) =>
        setTexts((t) => ({
          marquee_text: s.marquee_text ?? t.marquee_text,
          start_caption: s.start_caption ?? t.start_caption,
          start_welcome: s.start_welcome ?? t.start_welcome,
        }))
      )
      .catch(() => {});
  }, []);

  async function saveText(key) {
    setSavingText(key);
    setTextStatus(null);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: texts[key] }),
      });
      setTextStatus({ type: "ok", msg: "Enregistré ✓" });
    } catch {
      setTextStatus({ type: "err", msg: "Échec de l'enregistrement." });
    } finally {
      setSavingText("");
    }
  }

  async function removeProdReview(r) {
    if (!confirm(`Supprimer l'avis de « ${r.author} » ?`)) return;
    setDeletingProdRev(r.id);
    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(r.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setProdReviews((list) => list.filter((x) => x.id !== r.id));
    } catch {
      setCatStatus({ type: "err", msg: "Suppression de l'avis échouée." });
    } finally {
      setDeletingProdRev(null);
    }
  }

  const [cats, setCats] = useState(categories);
  const [newCat, setNewCat] = useState({ label: "", color: "#4f8bff", icon: "default" });
  const [catStatus, setCatStatus] = useState(null);

  const loadCats = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data) && data.length) setCats(data);
    } catch {
      /* garde le fallback */
    }
  }, []);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => setChatEnabled(!(s && s.chat_enabled === "false")))
      .catch(() => {});
    loadCats();
  }, [loadCats]);

  async function addCategory(e) {
    e.preventDefault();
    if (!newCat.label.trim()) return;
    setCatStatus(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCat),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erreur");
      setNewCat({ label: "", color: "#4f8bff", icon: "default" });
      loadCats();
    } catch (err) {
      setCatStatus({ type: "err", msg: err.message });
    }
  }

  async function saveCategory(cat) {
    try {
      await fetch(`/api/categories?id=${encodeURIComponent(cat.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: cat.label, color: cat.color, icon: cat.icon }),
      });
      setCatStatus({ type: "ok", msg: `« ${cat.label} » enregistrée ✓` });
    } catch {
      setCatStatus({ type: "err", msg: "Enregistrement échoué." });
    }
  }

  async function removeCategory(cat) {
    if (!confirm(`Supprimer la catégorie « ${cat.label} » ?`)) return;
    try {
      await fetch(`/api/categories?id=${encodeURIComponent(cat.id)}`, { method: "DELETE" });
      setCats((list) => list.filter((c) => c.id !== cat.id));
    } catch {
      setCatStatus({ type: "err", msg: "Suppression échouée." });
    }
  }

  const editCat = (id, key, val) =>
    setCats((list) => list.map((c) => (c.id === id ? { ...c, [key]: val } : c)));

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

  const [uploadingVideo, setUploadingVideo] = useState(false);
  async function onVideoPick(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    setUploadingVideo(true);
    setStatus(null);
    try {
      const sign = await (
        await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: f.name }),
        })
      ).json();
      if (!sign.uploadUrl) throw new Error(sign.error || "Signature échouée");
      const put = await fetch(sign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": f.type || "video/mp4", "x-upsert": "true" },
        body: f,
      });
      if (!put.ok) throw new Error("Upload de la vidéo échoué");
      setForm((fm) => ({ ...fm, video: sign.publicUrl }));
    } catch (err) {
      setStatus({ type: "err", msg: "Vidéo : " + err.message });
    } finally {
      setUploadingVideo(false);
    }
  }

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
          {(section === "best" || section === "new") && (
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

            <div className={styles.field}>
              <span className={styles.lbl}>Vidéo (optionnel)</span>
              {form.video ? (
                <div className={styles.videoDone}>
                  <video src={form.video} className={styles.videoThumb} muted playsInline />
                  <button
                    type="button"
                    className={styles.delBtn}
                    onClick={() => setForm((f) => ({ ...f, video: "" }))}
                  >
                    Retirer la vidéo
                  </button>
                </div>
              ) : (
                <label className={styles.upload}>
                  <span className={styles.uploadHint}>
                    {uploadingVideo ? "⏳ Envoi de la vidéo…" : "🎬 Ajouter une vidéo"}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={onVideoPick}
                    hidden
                    disabled={uploadingVideo}
                  />
                </label>
              )}
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
                {cats.map((c) => (
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
                          cats.find((c) => c.id === item.category)?.label ||
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

          {section === "reviews" && (
            <section className={styles.list}>
              <h2 className={styles.sectionTitle}>
                Avis clients{" "}
                {!loadingProdReviews && (
                  <span className={styles.count}>({prodReviews.length})</span>
                )}
              </h2>
              {loadingProdReviews ? (
                <p className={styles.muted}>Chargement…</p>
              ) : prodReviews.length === 0 ? (
                <p className={styles.muted}>Aucun avis pour l'instant.</p>
              ) : (
                prodReviews.map((r) => (
                  <div key={r.id} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>
                        {r.author}{" "}
                        <span className={styles.reviewStars}>
                          {"★".repeat(Math.max(0, Math.min(5, Number(r.stars) || 0)))}
                        </span>
                        {!r.approved && <span className={styles.ruptureTag}>À VALIDER</span>}
                      </span>
                      <span className={styles.itemMeta}>{r.message}</span>
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.delBtn}
                        type="button"
                        onClick={() => removeProdReview(r)}
                        disabled={deletingProdRev === r.id}
                      >
                        {deletingProdRev === r.id ? "…" : "Supprimer"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}

          {section === "cats" && (
            <section className={styles.list}>
              <h2 className={styles.sectionTitle}>
                Gérer les catégories{" "}
                <span className={styles.count}>({cats.length})</span>
              </h2>
              {catStatus && (
                <div className={catStatus.type === "ok" ? styles.ok : styles.err}>
                  {catStatus.msg}
                </div>
              )}

              {cats.map((c) => (
                <div key={c.id} className={styles.catRow}>
                  <input
                    type="color"
                    className={styles.colorInput}
                    value={c.color || "#4f8bff"}
                    onChange={(e) => editCat(c.id, "color", e.target.value)}
                  />
                  <input
                    className={styles.input}
                    value={c.label}
                    onChange={(e) => editCat(c.id, "label", e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.stockBtn}
                    onClick={() => saveCategory(c)}
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    className={styles.delBtn}
                    onClick={() => removeCategory(c)}
                    aria-label="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <form className={styles.catAdd} onSubmit={addCategory}>
                <span className={styles.sectionTitle}>Ajouter une catégorie</span>
                <div className={styles.catRow}>
                  <input
                    type="color"
                    className={styles.colorInput}
                    value={newCat.color}
                    onChange={(e) => setNewCat((n) => ({ ...n, color: e.target.value }))}
                  />
                  <input
                    className={styles.input}
                    value={newCat.label}
                    onChange={(e) => setNewCat((n) => ({ ...n, label: e.target.value }))}
                    placeholder="Nom de la catégorie"
                  />
                </div>
                <button type="submit" className={styles.submit}>
                  Ajouter la catégorie
                </button>
              </form>
            </section>
          )}

          {section === "avis" && (
            <section className={styles.list}>
              <div className={styles.textPanel}>
                <span className={styles.sectionTitle}>Textes &amp; bandeau</span>
                {textStatus && (
                  <div className={textStatus.type === "ok" ? styles.ok : styles.err}>
                    {textStatus.msg}
                  </div>
                )}
                <div className={styles.field}>
                  <span className={styles.lbl}>Bandeau info (défilant sur l'accueil)</span>
                  <input
                    className={styles.input}
                    value={texts.marquee_text}
                    onChange={(e) => setTexts((t) => ({ ...t, marquee_text: e.target.value }))}
                    placeholder="KINGHASH 94 — Livraison rapide — Nouveautés…"
                  />
                  <button type="button" className={styles.stockBtn} onClick={() => saveText("marquee_text")} disabled={savingText === "marquee_text"}>
                    Enregistrer
                  </button>
                </div>
                <div className={styles.field}>
                  <span className={styles.lbl}>Message /start (avant le code)</span>
                  <textarea
                    className={styles.input}
                    rows={2}
                    value={texts.start_caption}
                    onChange={(e) => setTexts((t) => ({ ...t, start_caption: e.target.value }))}
                    placeholder="Bienvenue chez KINGHASH 94 👑🔮🧙"
                  />
                  <button type="button" className={styles.stockBtn} onClick={() => saveText("start_caption")} disabled={savingText === "start_caption"}>
                    Enregistrer
                  </button>
                </div>
                <div className={styles.field}>
                  <span className={styles.lbl}>Message /start (après vérification)</span>
                  <textarea
                    className={styles.input}
                    rows={2}
                    value={texts.start_welcome}
                    onChange={(e) => setTexts((t) => ({ ...t, start_welcome: e.target.value }))}
                    placeholder="✅ Bienvenue ! Appuie pour ouvrir la boutique 👇"
                  />
                  <button type="button" className={styles.stockBtn} onClick={() => saveText("start_welcome")} disabled={savingText === "start_welcome"}>
                    Enregistrer
                  </button>
                </div>
              </div>

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
