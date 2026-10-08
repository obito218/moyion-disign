import { useCurrentFrame } from "remotion";
import { DOUX, entre, ressort } from "../anim";
import { PHRASES } from "../timeline";
import { C } from "../theme";

/** Fenêtre d'affichage : un poil avant la voix, et on garde la phrase 0,4 s après (sans chevaucher la suivante). */
const FENETRES = PHRASES.map((ph, i) => {
  const suivante = PHRASES[i + 1];
  return { ph, de: ph.debut - 3, a: Math.min(ph.fin + 12, suivante ? suivante.debut - 4 : Infinity) };
});

/** « Le client appelle le *garage d'en face*. » → mots entre astérisques en orange. */
export const decouper = (texte: string) => texte.split("*").map((t, i) => ({ t, accent: i % 2 === 1 }));

export const SousTitres: React.FC = () => {
  const frame = useCurrentFrame();
  const f = FENETRES.find((x) => frame >= x.de && frame < x.a);
  if (!f || !f.ph.sousTitre) return null;
  const entree = ressort(frame, f.de, DOUX);
  const sortie = entre(frame, [f.a - 5, f.a], [1, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 1560,
        height: 230,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.13,
          color: C.creme,
          textAlign: "center",
          textWrap: "balance",
          opacity: Math.min(entree * 1.5, sortie),
          transform: `translateY(${(1 - entree) * 18}px)`,
          textShadow: "0 4px 18px rgba(0,0,0,0.55)",
        }}
      >
        {decouper(f.ph.texte).map((m, i) => (
          <span key={i} style={m.accent ? { color: C.orange, fontWeight: 800 } : undefined}>
            {m.t}
          </span>
        ))}
      </div>
    </div>
  );
};
