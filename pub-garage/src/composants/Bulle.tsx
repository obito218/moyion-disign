import { useCurrentFrame } from "remotion";
import { C } from "../theme";

export type Morceau = { t: string; gras?: boolean; couleur?: string };

/** Texte qui s'écrit : la place finale est réservée dès le début, donc rien ne saute pendant la frappe. */
export const TexteProgressif: React.FC<{ morceaux: Morceau[]; visibles?: number }> = ({ morceaux, visibles = Infinity }) => {
  let reste = visibles;
  return (
    <>
      {morceaux.map((m, i) => {
        const n = Math.max(0, Math.min(m.t.length, reste));
        reste -= m.t.length;
        return (
          <span key={i} style={{ fontWeight: m.gras ? 800 : undefined, color: m.couleur }}>
            {m.t.slice(0, n)}
            <span style={{ color: "transparent" }}>{m.t.slice(n)}</span>
          </span>
        );
      })}
    </>
  );
};

type Props = {
  cote: "gauche" | "droite";
  fond: string;
  couleur?: string;
  /** 0 → 1 : apparition (échelle + fondu) */
  apparition: number;
  largeurMax?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export const Bulle: React.FC<Props> = ({ cote, fond, couleur = C.encre, apparition, largeurMax = 470, style, children }) => {
  const gauche = cote === "gauche";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: gauche ? "flex-start" : "flex-end",
        opacity: Math.min(1, apparition * 1.6),
        transform: `translateY(${(1 - apparition) * 24}px) scale(${0.85 + 0.15 * apparition})`,
        transformOrigin: gauche ? "0% 100%" : "100% 100%",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: largeurMax,
          background: fond,
          color: couleur,
          borderRadius: 30,
          borderBottomLeftRadius: gauche ? 8 : 30,
          borderBottomRightRadius: gauche ? 30 : 8,
          padding: "20px 26px 22px",
          fontSize: 42,
          fontWeight: 600,
          lineHeight: 1.22,
          boxShadow: "0 3px 0 rgba(0,0,0,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Bulle « … en train d'écrire ». */
export const PointsFrappe: React.FC<{ apparition: number; fond: string }> = ({ apparition, fond }) => {
  const frame = useCurrentFrame();
  return (
    <Bulle cote="gauche" fond={fond} apparition={apparition}>
      <div style={{ display: "flex", gap: 12, padding: "8px 4px" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              background: C.acier,
              transform: `translateY(${Math.sin((frame - i * 4) / 3.2) * 5}px)`,
              opacity: 0.55 + 0.45 * Math.max(0, Math.sin((frame - i * 4) / 3.2)),
            }}
          />
        ))}
      </div>
    </Bulle>
  );
};
