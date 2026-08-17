"use client";

import { useEffect, useState } from "react";
import Splash from "../components/Splash";
import Home from "../components/Home";

const SPLASH_VISIBLE_MS = 1800;
const SPLASH_FADE_MS = 500;

export default function Page() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashLeaving, setSplashLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => {
      setSplashLeaving(true);
    }, SPLASH_VISIBLE_MS);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_VISIBLE_MS + SPLASH_FADE_MS);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {showSplash && <Splash isLeaving={splashLeaving} />}
      <Home />
    </>
  );
}
