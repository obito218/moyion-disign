// Acte 4 — « Et vous, vous recevez une fiche. Le nom du client, la panne, le créneau. »
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DOUX, SOUPLE, ressort } from "../anim";
import { Coche } from "../composants/Icones";
import { HAUT_ECRAN, Telephone } from "../composants/Telephone";
import { M } from "../moments";
import { C } from "../theme";
import { NUMERO_CLIENT } from "./Acte1Atelier";

const Ligne: React.FC<{
  etiquette: string;
  apparition: number;
  premiere?: boolean;
  aDroite?: React.ReactNode;
  children: React.ReactNode;
}> = ({ etiquette, apparition, premiere, aDroite, children }) => (
  <div
    style={{
      padding: "26px 30px 28px",
      borderTop: premiere ? undefined : `2px solid ${C.trait}`,
      opacity: apparition,
      transform: `translateX(${(1 - apparition) * -40}px)`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 40 }}>
      <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: 3, color: C.orange }}>{etiquette}</span>
      {aDroite}
    </div>
    {children}
  </div>
);

type Props = { nomGarage: string; creneau: string; entree: number; sortie: number };

export const Acte4Fiche: React.FC<Props> = ({ nomGarage, creneau, entree, sortie }) => {
  const frame = useCurrentFrame();
  const arrivee = ressort(frame, entree, SOUPLE);
  const depart = ressort(frame, sortie, DOUX);
  const fiche = ressort(frame, M.fiche, SOUPLE);
  // une ligne par groupe de mots prononcé : « le nom du client » / « la panne » / « le créneau »
  const lignes = M.lignesFiche.map((debut) => ressort(frame, debut, DOUX));
  const confirme = ressort(frame, M.confirme, SOUPLE);

  return (
    <AbsoluteFill style={{ opacity: 1 - Math.min(1, depart * 1.6), transform: `translateY(${depart * 420}px)` }}>
      <Telephone sombre heure="10:44" style={{ left: interpolate(arrivee, [0, 1], [1250, 230]), top: 230 }}>
        <AbsoluteFill style={{ background: C.fond }}>
          <div style={{ position: "absolute", top: HAUT_ECRAN + 40, left: 34, right: 34 }}>
            <div style={{ fontSize: 50, fontWeight: 800, color: C.creme }}>Nouvelle demande</div>
            <div style={{ fontSize: 30, fontWeight: 600, color: C.gris, marginTop: 4 }}>{nomGarage} · à l'instant</div>
          </div>
          <div
            style={{
              position: "absolute",
              top: HAUT_ECRAN + 200,
              left: 22,
              right: 22,
              borderRadius: 40,
              overflow: "hidden",
              background: C.panneau,
              opacity: Math.min(1, fiche * 1.4),
              transform: `translateY(${(1 - fiche) * 90}px)`,
            }}
          >
            <div
              style={{
                height: 96,
                background: C.orange,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 30px",
                color: C.encre,
              }}
            >
              <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: 3 }}>FICHE CLIENT</span>
              <span style={{ fontSize: 32, fontWeight: 700 }}>10:44</span>
            </div>
            <Ligne etiquette="CLIENT" apparition={lignes[0]} premiere>
              <div style={{ fontSize: 52, fontWeight: 700, color: C.creme, marginTop: 4 }}>M. Martin</div>
              <div style={{ fontSize: 38, fontWeight: 600, color: C.gris }}>{NUMERO_CLIENT}</div>
            </Ligne>
            <Ligne etiquette="PANNE" apparition={lignes[1]}>
              <div style={{ fontSize: 52, fontWeight: 700, color: C.creme, marginTop: 4 }}>Bruit au freinage</div>
            </Ligne>
            <Ligne
              etiquette="CRÉNEAU"
              apparition={lignes[2]}
              aDroite={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 18px 6px 10px",
                    borderRadius: 999,
                    background: "#3B2A1F",
                    color: C.creme,
                    fontSize: 30,
                    fontWeight: 700,
                    opacity: confirme,
                    transform: `scale(${0.7 + 0.3 * confirme})`,
                  }}
                >
                  <Coche taille={40} epaisseur={14} />
                  Confirmé
                </div>
              }
            >
              <div style={{ fontSize: creneau.length > 13 ? 50 : 62, fontWeight: 800, color: C.orange, marginTop: 2, whiteSpace: "nowrap" }}>
                {creneau}
              </div>
            </Ligne>
          </div>
        </AbsoluteFill>
      </Telephone>
    </AbsoluteFill>
  );
};
