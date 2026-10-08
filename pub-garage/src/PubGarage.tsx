import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Bruitages } from "./composants/Bruitages";
import { Etiquette, type Plage } from "./composants/Etiquette";
import { SousTitres } from "./composants/SousTitres";
import { Acte1Atelier } from "./scenes/Acte1Atelier";
import { Acte2Rue } from "./scenes/Acte2Rue";
import { Acte3Client } from "./scenes/Acte3Client";
import { Acte4Fiche } from "./scenes/Acte4Fiche";
import { Acte5Retournement } from "./scenes/Acte5Retournement";
import { Acte6Offre } from "./scenes/Acte6Offre";
import { M } from "./moments";
import { DUREE, PHRASES, p } from "./timeline";
import { C, POLICE } from "./theme";

export type PropsPub = {
  nomGarage: string;
  numero: string;
  creneau: string;
};

export const PROPS_PAR_DEFAUT: PropsPub = {
  nomGarage: "Garage Dupont",
  numero: "06 00 00 00 00",
  creneau: "Mardi 14h",
};

const Visible: React.FC<{ de: number; a: number; children: React.ReactNode }> = ({ de, a, children }) => {
  const frame = useCurrentFrame();
  return frame >= de && frame < a ? <>{children}</> : null;
};

// Bascules entre actes (frames absolues), accrochées à la voix.
const T12 = M.atelierVersRue;
const T23 = M.rueVersClient;
const T34 = M.clientVersFiche;
const T45 = M.ficheVersCartes;
const T56 = M.cartesVersOffre;
const CHEVAUCHEMENT = 24;
/** Gain de la voix au mixage : ≈ -15 LUFS en sortie, assez fort pour un haut-parleur de téléphone. */
const VOLUME_VOIX = 1.2;

export const PubGarage: React.FC<Partial<PropsPub>> = (entree) => {
  const nomGarage = String(entree.nomGarage ?? PROPS_PAR_DEFAUT.nomGarage);
  const numero = String(entree.numero ?? PROPS_PAR_DEFAUT.numero);
  const creneau = String(entree.creneau ?? PROPS_PAR_DEFAUT.creneau);

  const etiquettes: Plage[] = [
    { de: 0, a: T23, texte: "AUJOURD'HUI" },
    { de: T23 + 2, a: p("06").debut, texte: "1 · LE SMS", accent: true },
    { de: p("06").debut + 2, a: T34, texte: "2 · WHATSAPP", accent: true },
    { de: T34 + 4, a: T45, texte: "3 · LA FICHE", accent: true },
    { de: T56 + 4, a: DUREE + 30, texte: `POUR ${nomGarage.toUpperCase()}`, accent: true }, // reste affichée jusqu'à la dernière image
  ];

  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: POLICE }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 42%, ${C.fondClair} 0%, ${C.fond} 72%)` }} />
      <Visible de={0} a={T12 + CHEVAUCHEMENT}>
        <Acte1Atelier sortie={T12} />
      </Visible>
      <Visible de={T12} a={T23 + CHEVAUCHEMENT}>
        <Acte2Rue entree={T12} sortie={T23} />
      </Visible>
      <Visible de={T23} a={T34 + CHEVAUCHEMENT}>
        <Acte3Client nomGarage={nomGarage} numero={numero} creneau={creneau} entree={T23} sortie={T34} />
      </Visible>
      <Visible de={T34} a={T45 + CHEVAUCHEMENT}>
        <Acte4Fiche nomGarage={nomGarage} creneau={creneau} entree={T34} sortie={T45} />
      </Visible>
      <Visible de={T45} a={T56 + CHEVAUCHEMENT}>
        <Acte5Retournement creneau={creneau} entree={T45 + 8} sortie={T56} />
      </Visible>
      <Visible de={T56} a={DUREE}>
        <Acte6Offre entree={T56} />
      </Visible>
      <Etiquette plages={etiquettes} />
      <SousTitres />
      {PHRASES.map((ph) => (
        <Sequence key={ph.id} from={ph.audio} layout="none" name={`voix ${ph.id}`}>
          <Html5Audio src={staticFile(`voix/${ph.id}.wav`)} volume={VOLUME_VOIX} />
        </Sequence>
      ))}
      <Bruitages />
    </AbsoluteFill>
  );
};
