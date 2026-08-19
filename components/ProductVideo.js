"use client";

import { useRef, useState } from "react";
import styles from "./ProductVideo.module.css";

function fmt(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function ProductVideo({ src, name }) {
  const vref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    const v = vref.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };
  const seek = (e) => {
    const v = vref.current;
    if (v && dur) v.currentTime = (Number(e.target.value) / 100) * dur;
  };
  const toggleMute = () => {
    const v = vref.current;
    if (v) {
      v.muted = !v.muted;
      setMuted(v.muted);
    }
  };
  const fullscreen = () => {
    const v = vref.current;
    if (v?.requestFullscreen) v.requestFullscreen();
    else if (v?.webkitEnterFullscreen) v.webkitEnterFullscreen();
  };

  const progress = dur ? (cur / dur) * 100 : 0;

  return (
    <div className={styles.wrap}>
      <video
        ref={vref}
        src={src}
        className={styles.video}
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCur(e.target.currentTime)}
        onLoadedMetadata={(e) => setDur(e.target.duration)}
        onClick={toggle}
      />

      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={progress}
        onChange={seek}
        className={styles.scrub}
        style={{ "--p": `${progress}%` }}
        aria-label="Progression"
      />

      <div className={styles.times}>
        <span>{fmt(cur)}</span>
        <span>{fmt(dur)}</span>
      </div>

      <div className={styles.controls}>
        <button className={styles.play} type="button" onClick={toggle} aria-label={playing ? "Pause" : "Lecture"}>
          {playing ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />
            </svg>
          )}
        </button>

        <button className={styles.ctrl} type="button" onClick={toggleMute} aria-label="Son">
          {muted ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="m17 9 4 6M21 9l-4 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="M16 8.5a5 5 0 0 1 0 7" />
            </svg>
          )}
        </button>

        <button className={styles.ctrl} type="button" onClick={fullscreen} aria-label="Plein écran">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4" />
          </svg>
        </button>
      </div>

      <p className={styles.caption}>Lecteur vidéo de {name}</p>
    </div>
  );
}
