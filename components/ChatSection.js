"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ChatSection.module.css";

const COLORS = [
  "#4f8bff",
  "#4fe0a0",
  "#e879f9",
  "#f2c14e",
  "#ff8088",
  "#c9a2ff",
  "#5be0d0",
  "#ff9d5c",
];

function colorFor(str) {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = (h + str.charCodeAt(i)) % COLORS.length;
  return COLORS[h];
}

function time(ts) {
  try {
    return new Date(ts).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function ChatSection() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", { cache: "no-store" });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const u =
      typeof window !== "undefined" &&
      window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (u) {
      const n = u.first_name
        ? `${u.first_name}${u.last_name ? " " + u.last_name : ""}`
        : u.username || "";
      if (n) setName(n);
      if (u.id) setUid(String(u.id));
    }
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || !name.trim() || sending) return;
    setSending(true);
    const msg = text.trim();
    setText("");
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: name.trim(), message: msg, uid }),
      });
      await load();
    } catch {
      setText(msg);
    } finally {
      setSending(false);
    }
  }

  const members = new Set(
    messages.map((m) => m.uid || m.author).filter(Boolean)
  ).size;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.members}>
          👥 {members} membre{members > 1 ? "s" : ""} · communauté KINGHASH 94
        </span>
      </div>

      <div className={styles.list} ref={listRef}>
        {messages.length === 0 ? (
          <p className={styles.empty}>Aucun message. Sois le premier à écrire ! 💬</p>
        ) : (
          messages.map((m) => {
            const mine = uid && m.uid && m.uid === uid;
            const color = colorFor(m.author);
            return (
              <div
                key={m.id}
                className={`${styles.row} ${mine ? styles.mineRow : ""}`}
              >
                {!mine && (
                  <span
                    className={styles.avatar}
                    style={{ background: color }}
                    aria-hidden="true"
                  >
                    {(m.author || "?").charAt(0).toUpperCase()}
                  </span>
                )}
                <div className={`${styles.bubble} ${mine ? styles.mine : ""}`}>
                  {!mine && (
                    <span className={styles.author} style={{ color }}>
                      {m.author}
                    </span>
                  )}
                  <span className={styles.msg}>{m.message}</span>
                  <span className={styles.time}>{time(m.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!name && (
        <input
          className={styles.nameInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ton nom (pour écrire)"
        />
      )}

      <form className={styles.composer} onSubmit={send}>
        <input
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écris un message…"
          maxLength={500}
        />
        <button
          className={styles.sendBtn}
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Envoyer"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
