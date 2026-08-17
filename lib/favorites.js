// Gestion des favoris côté client (stockés sur l'appareil via localStorage)
const KEY = "kinghash_favs";

export function getFavs() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function isFav(id) {
  return getFavs().includes(id);
}

export function toggleFav(id) {
  const favs = getFavs();
  const next = favs.includes(id)
    ? favs.filter((x) => x !== id)
    : [...favs, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("favs-changed"));
  return next;
}
