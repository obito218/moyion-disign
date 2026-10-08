import { useCurrentFrame } from "remotion";
import { DOUX, entre, ressort } from "../anim";
import { C } from "../theme";

export type Plage = { de: number; a: number; texte: string; accent?: boolean };

/** Petit repère en haut de l'écran (« AUJOURD'HUI », « 1 · LE SMS »…), un seul à la fois. */
export const Etiquette: React.FC<{ plages: Plage[] }> = ({ plages }) => {
  const frame = useCurrentFrame();
  const pl = plages.find((x) => frame >= x.de && frame < x.a);
  if (!pl) return null;
  const entree = ressort(frame, pl.de, DOUX);
  const sortie = entre(frame, [pl.a - 6, pl.a], [1, 0]);
  return (
    <div style={{ position: "absolute", top: 92, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: "12px 30px 13px",
          borderRadius: 999,
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: 3,
          color: pl.accent ? C.encre : C.gris,
          background: pl.accent ? C.orange : "transparent",
          border: pl.accent ? `3px solid ${C.orange}` : `3px solid ${C.trait}`,
          opacity: Math.min(entree, sortie),
          transform: `translateY(${(1 - entree) * -24}px)`,
          whiteSpace: "nowrap",
          maxWidth: 960,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {pl.texte}
      </div>
    </div>
  );
};
