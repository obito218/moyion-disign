// Pictogrammes dessinés à la main (viewBox 100×100), aucune banque d'icônes.
import { C } from "../theme";

type P = { taille?: number; couleur?: string; style?: React.CSSProperties };

const COMBINE =
  "M33 12c4 0 7 3 8 6l4 12c1 3 0 6-2 8l-6 5c5 10 12 17 22 22l5-6c2-2 5-3 8-2l12 4c3 1 6 4 6 8v9c0 5-4 9-9 9C44 87 13 56 13 21c0-5 4-9 9-9z";

export const Combine: React.FC<P> = ({ taille = 100, couleur = C.creme, style }) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={style}>
    <path d={COMBINE} fill={couleur} />
  </svg>
);

/** Combiné + flèche brisée : appel manqué. */
export const AppelManque: React.FC<P> = ({ taille = 100, couleur = C.orange, style }) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={style}>
    <g transform="translate(-4 8) scale(0.86)">
      <path d={COMBINE} fill={couleur} />
    </g>
    <path
      d="M56 16l13 13 19-19"
      fill="none"
      stroke={couleur}
      strokeWidth={8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M76 8h14v14" fill="none" stroke={couleur} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Coche: React.FC<P & { epaisseur?: number }> = ({ taille = 100, couleur = C.orange, epaisseur = 12, style }) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={style}>
    <path
      d="M20 52l20 20 42-44"
      fill="none"
      stroke={couleur}
      strokeWidth={epaisseur}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Calendrier: React.FC<P & { fond?: string }> = ({ taille = 100, couleur = C.orange, fond = C.creme, style }) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={style}>
    <rect x="10" y="16" width="80" height="74" rx="12" fill={fond} />
    <path d="M10 28a12 12 0 0 1 12-12h56a12 12 0 0 1 12 12v12H10z" fill={couleur} />
    <rect x="27" y="6" width="9" height="20" rx="4.5" fill={C.encre} />
    <rect x="64" y="6" width="9" height="20" rx="4.5" fill={C.encre} />
    <path d="M32 64l12 12 24-26" fill="none" stroke={couleur} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Bulle de discussion générique (pas un logo). */
export const BulleChat: React.FC<P> = ({ taille = 100, couleur = C.orange, style }) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={style}>
    <path d="M18 14h64a12 12 0 0 1 12 12v38a12 12 0 0 1-12 12H44L24 92V76h-6A12 12 0 0 1 6 64V26a12 12 0 0 1 12-12z" fill={couleur} />
    <circle cx="30" cy="45" r="7" fill={C.creme} />
    <circle cx="50" cy="45" r="7" fill={C.creme} />
    <circle cx="70" cy="45" r="7" fill={C.creme} />
  </svg>
);

export const Chevron: React.FC<P> = ({ taille = 100, couleur = C.orange, style }) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={style}>
    <path d="M64 16L30 50l34 34" fill="none" stroke={couleur} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Cle: React.FC<P> = ({ taille = 100, couleur = C.orange, style }) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={style}>
    <path
      d="M70 8a22 22 0 0 0-20 31L12 77a8 8 0 0 0 0 11 8 8 0 0 0 11 0l38-38a22 22 0 0 0 31-20l-13 13-12-3-3-12z"
      fill={couleur}
    />
  </svg>
);
