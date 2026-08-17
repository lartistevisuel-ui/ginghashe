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
  weight: "",
  price: "",
  image: "",
  postal: true,
  meetup: true,
  vitrine: false,
});

export default function AdminManager() {
  const [section, setSection] = useState("best");
  const current = TABS.find((t) => t.section === section) || TABS[0];

  const [form, setForm] = useState(emptyForm());
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

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, section }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setStatus({ type: "ok", msg: `Produit « ${data.name} » ajouté ✓` });
      setForm(emptyForm());
      load();
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setSaving(false);
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

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.lbl}>Quantité / poids</span>
            <input className={styles.input} value={form.weight} onChange={set("weight")} placeholder="2G" />
          </label>
          <label className={styles.field}>
            <span className={styles.lbl}>Prix *</span>
            <input className={styles.input} value={form.price} onChange={set("price")} required placeholder="30.00 €" />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.lbl}>Image (URL) — optionnel</span>
          <input className={styles.input} value={form.image} onChange={set("image")} placeholder="https://… (vide = placeholder)" />
        </label>

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
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemMeta}>{item.price}</span>
              </div>
              <button
                className={styles.delBtn}
                type="button"
                onClick={() => remove(item)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? "…" : "Supprimer"}
              </button>
            </div>
          ))
        )}
      </section>
        </div>
      </div>
    </main>
  );
}
