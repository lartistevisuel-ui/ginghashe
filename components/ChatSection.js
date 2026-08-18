"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ChatSection.module.css";

const COLORS = [
  "#5eead4",
  "#4ade80",
  "#60a5fa",
  "#f472b6",
  "#fbbf24",
  "#c084fc",
  "#fb923c",
  "#38bdf8",
];

function colorFor(str) {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = (h + str.charCodeAt(i)) % COLORS.length;
  return COLORS[h];
}

function time(ts) {
  try {
    return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(ts) {
  const d = new Date(ts);
  const now = new Date();
  const y = new Date();
  y.setDate(now.getDate() - 1);
  if (dayKey(ts) === dayKey(now)) return "Aujourd'hui";
  if (dayKey(ts) === dayKey(y)) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
}

export default function ChatSection() {
  const router = useRouter();
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
      typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user;
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

  const members = new Set(messages.map((m) => m.uid || m.author).filter(Boolean)).size;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} type="button" onClick={() => router.push("/")} aria-label="Retour">
          ←
        </button>
        <div className={styles.headInfo}>
          <span className={styles.headTitle}>Tchat Groupe</span>
          <span className={styles.headSub}>
            <svg
              className={styles.peopleIcon}
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="8.5" r="3" />
              <path d="M2.8 19a6.2 6.2 0 0 1 12.4 0" />
              <path d="M16 6a3 3 0 0 1 0 5.5" />
              <path d="M21 19a5 5 0 0 0-3.5-4.8" />
            </svg>
            {members} membre{members > 1 ? "s" : ""}
            <span className={styles.sep}>·</span>
            <span className={styles.onlineDot} />
            <span className={styles.online}>1 en ligne</span>
          </span>
        </div>
        <img src="/logo.png" alt="" className={styles.headAvatar} />
      </header>

      <div className={styles.list} ref={listRef}>
        {messages.length === 0 ? (
          <p className={styles.empty}>Aucun message. Lance la discussion ! 💬</p>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const mine = uid && m.uid && m.uid === uid;
            const newDay = !prev || dayKey(prev.created_at) !== dayKey(m.created_at);
            const firstOfGroup =
              newDay || !prev || prev.author !== m.author || (uid && prev.uid !== m.uid);
            const lastOfGroup =
              !next ||
              next.author !== m.author ||
              dayKey(next.created_at) !== dayKey(m.created_at);
            const color = colorFor(m.author);

            return (
              <div key={m.id}>
                {newDay && (
                  <div className={styles.daySep}>
                    <span>{dayLabel(m.created_at)}</span>
                  </div>
                )}
                <div className={`${styles.row} ${mine ? styles.mineRow : ""}`}>
                  {!mine && (
                    <span className={styles.avatarSlot}>
                      {lastOfGroup && (
                        <span className={styles.avatar} style={{ background: color }}>
                          {(m.author || "?").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                  )}
                  <div className={`${styles.bubble} ${mine ? styles.mine : ""}`}>
                    {!mine && firstOfGroup && (
                      <span className={styles.author} style={{ color }}>
                        {m.author}
                      </span>
                    )}
                    <span className={styles.msg}>{m.message}</span>
                    <span className={styles.time}>{time(m.created_at)}</span>
                  </div>
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
          placeholder="Message…"
          maxLength={500}
        />
        <button className={styles.sendBtn} type="submit" disabled={sending || !text.trim()} aria-label="Envoyer">
          ➤
        </button>
      </form>
    </main>
  );
}
