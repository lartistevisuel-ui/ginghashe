"use client";

import { useState } from "react";
import styles from "./admin.module.css";

const EMPTY = {
  name: "",
  grade: "",
  description: "",
  variant: "",
  weight: "",
  price: "",
  image: "",
  section: "best",
  postal: true,
  meetup: true,
  vitrine: false,
};

export default function AdminPage() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(null); // {type:'ok'|'err', msg}
  const [saving, setSaving] = useState(false);

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
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setStatus({ type: "ok", msg: `Produit « ${data.name} » ajouté ✓` });
      setForm(EMPTY);
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin — Ajouter un produit</h1>
        <p className={styles.subtitle}>Réservé au propriétaire de la boutique</p>
      </header>

      <form className={styles.form} onSubmit={submit}>
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
          <input className={styles.input} value={form.image} onChange={set("image")} placeholder="https://… (laisser vide = placeholder)" />
        </label>

        <label className={styles.field}>
          <span className={styles.lbl}>Section</span>
          <select className={styles.input} value={form.section} onChange={set("section")}>
            <option value="best">Best-sellers</option>
            <option value="new">Nouveautés</option>
          </select>
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
          {saving ? "Enregistrement…" : "Ajouter le produit"}
        </button>
      </form>
    </main>
  );
}
