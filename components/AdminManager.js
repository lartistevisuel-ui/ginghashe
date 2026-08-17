"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./AdminManager.module.css";

const TABS = [
  { section: "best", label: "Best-sellers" },
  { section: "new", label: "Nouveautés" },
];

const emptyForm = () => ({
  name: "",
  grade: "",
  description: "",
  variant: "",
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
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>
                      {item.name}
                      {item.soldout && <span className={styles.ruptureTag}>RUPTURE</span>}
                    </span>
                    <span className={styles.itemMeta}>
                      {Array.isArray(item.prices) && item.prices.length
                        ? item.prices.map((p) => `${p.weight} ${p.price}`).join(" · ")
                        : item.price}
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
        </div>
      </div>
    </main>
  );
}
