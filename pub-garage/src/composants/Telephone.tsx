import { C, POLICE } from "../theme";

export const LARGEUR_TEL = 620;
export const HAUTEUR_TEL = Math.round(LARGEUR_TEL * 2.05);
const BORD = 16;
const RAYON = 92;
export const RAYON_ECRAN = RAYON - BORD;
/** Hauteur réservée à la barre d'état en haut de l'écran. */
export const HAUT_ECRAN = 74;

const BarreStatut: React.FC<{ sombre: boolean; heure: string }> = ({ sombre, heure }) => {
  const c = sombre ? C.creme : C.encre;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: HAUT_ECRAN,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 52px 0",
        fontFamily: POLICE,
        fontWeight: 700,
        fontSize: 30,
        color: c,
        zIndex: 5,
      }}
    >
      <span>{heure}</span>
      <svg width={86} height={26} viewBox="0 0 86 26">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 9} y={18 - i * 5} width={6} height={8 + i * 5} rx={1.5} fill={c} />
        ))}
        <rect x={44} y={3} width={36} height={20} rx={5} fill="none" stroke={c} strokeWidth={2.5} opacity={0.55} />
        <rect x={47.5} y={6.5} width={24} height={13} rx={2.5} fill={c} />
        <rect x={81.5} y={9} width={3} height={8} rx={1.5} fill={c} opacity={0.55} />
      </svg>
    </div>
  );
};

type Props = {
  sombre?: boolean;
  heure?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** Smartphone générique dessiné en CSS (aucune marque). Taille fixe 620×1271, à placer/échelonner via `style`. */
export const Telephone: React.FC<Props> = ({ sombre = false, heure = "10:42", style, children }) => (
  <div
    style={{
      position: "absolute",
      width: LARGEUR_TEL,
      height: HAUTEUR_TEL,
      borderRadius: RAYON,
      background: C.encre,
      boxShadow: "0 50px 90px rgba(0,0,0,0.5), inset 0 0 0 3px #34363C",
      ...style,
    }}
  >
    <div style={{ position: "absolute", left: -7, top: 250, width: 7, height: 90, borderRadius: 4, background: "#34363C" }} />
    <div style={{ position: "absolute", left: -7, top: 360, width: 7, height: 90, borderRadius: 4, background: "#34363C" }} />
    <div style={{ position: "absolute", right: -7, top: 300, width: 7, height: 130, borderRadius: 4, background: "#34363C" }} />
    <div
      style={{
        position: "absolute",
        inset: BORD,
        borderRadius: RAYON_ECRAN,
        overflow: "hidden",
        background: sombre ? C.fond : C.creme,
        fontFamily: POLICE,
      }}
    >
      {children}
      <BarreStatut sombre={sombre} heure={heure} />
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          width: 170,
          height: 46,
          marginLeft: -85,
          borderRadius: 23,
          background: C.encre,
          zIndex: 6,
        }}
      />
    </div>
  </div>
);
