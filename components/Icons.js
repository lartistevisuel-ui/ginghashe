// Icônes SVG partagées — héritent la couleur via currentColor
function Line({ children, size = 20, className, sw = 1.9 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Solid({ children, size = 20, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// POSTAL — camion de livraison
export const TruckIcon = (p) => (
  <Line {...p}>
    <rect x="1" y="5" width="13" height="9" rx="1" />
    <path d="M14 8h4l3 3v3h-7z" />
    <circle cx="5.5" cy="16.5" r="1.6" />
    <circle cx="17" cy="16.5" r="1.6" />
  </Line>
);

// MEET-UP — épingle de localisation
export const PinIcon = (p) => (
  <Line {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Line>
);

// VITRINE — œil
export const EyeIcon = (p) => (
  <Line {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Line>
);

// INFOS — mégaphone
export const MegaphoneIcon = (p) => (
  <Line {...p}>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </Line>
);

// Favori / Best-sellers — étoile pleine
export const StarIcon = (p) => (
  <Solid {...p}>
    <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.1 20.9l1.1-6.5L2.5 9.8l6.5-.9L12 2.5z" />
  </Solid>
);

// Nouveautés — étincelle
export const SparkleIcon = (p) => (
  <Solid {...p}>
    <path d="M12 2l1.8 5.2 5.2 1.8-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
    <path d="M19 14l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" />
  </Solid>
);

// Chevron bas — sélecteur
export const ChevronDownIcon = (p) => (
  <Line {...p} sw={2.2}>
    <path d="m6 9 6 6 6-6" />
  </Line>
);
