// Acte 5 — « Les appels manqués redeviennent des rendez-vous. »
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DOUX, SOUPLE, ressort } from "../anim";
import { AppelManque, Calendrier } from "../composants/Icones";
import { M } from "../moments";
import { C } from "../theme";

const LARGEUR = 900;
const HAUTEUR = 210;
/** Écart (frames) entre deux cartes qui se retournent, partagé avec le bruitage. */
export const DECALAGE_CARTES = 8;

const Face: React.FC<{ dos?: boolean; children: React.ReactNode }> = ({ dos, children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: 40,
      background: dos ? C.creme : C.panneau,
      display: "flex",
      alignItems: "center",
      gap: 30,
      padding: "0 40px 0 36px",
      backfaceVisibility: "hidden",
      transform: dos ? "rotateX(180deg)" : undefined,
    }}
  >
    {children}
  </div>
);

const Pastille: React.FC<{ fond: string; children: React.ReactNode }> = ({ fond, children }) => (
  <div
    style={{
      width: 134,
      height: 134,
      flexShrink: 0,
      borderRadius: 36,
      background: fond,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

type Props = { creneau: string; entree: number; sortie: number };

export const Acte5Retournement: React.FC<Props> = ({ creneau, entree, sortie }) => {
  const frame = useCurrentFrame();
  const depart = ressort(frame, sortie, DOUX);
  const cartes = [
    { heure: "08:15", rdv: "Lundi 9h" },
    { heure: "10:42", rdv: creneau },
    { heure: "16:30", rdv: "Jeudi 17h" },
  ];

  return (
    <AbsoluteFill style={{ opacity: 1 - depart, transform: `translateY(${depart * -120}px)` }}>
      {cartes.map((c, i) => {
        const arrivee = ressort(frame, entree + i * 5, DOUX);
        const retour = ressort(frame, M.retournement + i * DECALAGE_CARTES, SOUPLE);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (1080 - LARGEUR) / 2,
              top: 560 + i * (HAUTEUR + 40),
              width: LARGEUR,
              height: HAUTEUR,
              perspective: 1400,
              opacity: arrivee,
              transform: `translateX(${(1 - arrivee) * 300}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transformStyle: "preserve-3d",
                transform: `rotateX(${retour * 180}deg)`,
              }}
            >
              <Face>
                <Pastille fond="#3B2A1F">
                  <AppelManque taille={98} />
                </Pastille>
                <div style={{ flex: 1, fontSize: 60, fontWeight: 800, color: C.creme, whiteSpace: "nowrap" }}>Appel manqué</div>
                <div style={{ fontSize: 42, fontWeight: 700, color: C.gris }}>{c.heure}</div>
              </Face>
              <Face dos>
                <Pastille fond={C.orange}>
                  <Calendrier taille={100} couleur={C.encre} fond={C.creme} />
                </Pastille>
                <div style={{ flex: 1, fontSize: 60, fontWeight: 800, color: C.encre, whiteSpace: "nowrap" }}>Rendez-vous</div>
                <div style={{ fontSize: c.rdv.length > 11 ? 34 : 42, fontWeight: 800, color: C.orangeFonce, whiteSpace: "nowrap" }}>
                  {c.rdv}
                </div>
              </Face>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
