// Icônes SVG au trait, une par catégorie (héritent la couleur via currentColor)
const icons = {
  // Fiole / extraction
  extraction: (
    <>
      <path d="M10 2v7.3" />
      <path d="M14 2v7.3" />
      <path d="M8.5 2h7" />
      <path d="M14 9.3a6 6 0 1 1-4 0" />
      <path d="M6.5 16h11" />
    </>
  ),
  // Feuille / fleurs
  flowers: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </>
  ),
  // Cookie / edibles
  edibbles: (
    <>
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </>
  ),
  // Cigarette / pre-rolls
  prerolls: (
    <>
      <rect x="2" y="12" width="16" height="4" rx="1" />
      <path d="M18 12v4" />
      <path d="M22 12v4" />
      <path d="M17 4c0 1.6 1 2 1 3.6" />
      <path d="M14 4c0 1.6 1 2 1 3.6" />
    </>
  ),
  // Cadeau / goodies
  goodies: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8" />
      <path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" />
    </>
  ),
  // ADN / génétique
  genetics: (
    <>
      <path d="M5 4c0 6 14 6 14 16" />
      <path d="M19 4c0 6-14 6-14 16" />
      <path d="M7.5 7h9" />
      <path d="M9 11h6" />
      <path d="M7.5 17h9" />
    </>
  ),
  // Étiquette (par défaut)
  default: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h6l9 9-6 6-9-9V7Z" />
      <circle cx="8" cy="10" r="1.4" />
    </>
  ),
};

export default function CategoryIcon({ id, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[id] || icons.default}
    </svg>
  );
}
