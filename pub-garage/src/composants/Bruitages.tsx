import { Html5Audio, Sequence, staticFile } from "remotion";
import { M } from "../moments";
import { RAFALE } from "../scenes/Acte1Atelier";
import { DECALAGE_CARTES } from "../scenes/Acte5Retournement";

type Son = { nom: string; de: number; volume: number; duree?: number };

// Sonneries : une par rafale visuelle, coupée net quand l'appel bascule en « manqué ».
const sonneries: Son[] = [];
for (let de = M.sonnerie; de < M.finSonnerie; de += RAFALE) {
  sonneries.push({ nom: "sonnerie", de, volume: 0.4, duree: M.finSonnerie - de });
}

const SONS: Son[] = [
  ...sonneries,
  { nom: "manque", de: M.appelManque, volume: 0.4 },
  { nom: "sms", de: M.sms, volume: 0.45 },
  { nom: "clic", de: M.clicLien, volume: 0.5 },
  { nom: "pop", de: M.demande - 4, volume: 0.45 },
  { nom: "pop", de: M.reponse, volume: 0.45 },
  { nom: "pop", de: M.merci, volume: 0.45 },
  { nom: "valide", de: M.fiche, volume: 0.3 },
  ...M.lignesFiche.map((de) => ({ nom: "pop", de, volume: 0.22 })),
  { nom: "valide", de: M.confirme, volume: 0.25 },
  ...[0, 1, 2].map((i) => ({ nom: "retourne", de: M.retournement + i * DECALAGE_CARTES, volume: 0.45 })),
  { nom: "tampon", de: M.engagement + 4, volume: 0.55 },
];

/** Bruitages discrets, tous sous la voix (l'atelier est bruyant : la vidéo doit marcher sans le son). */
export const Bruitages: React.FC = () => (
  <>
    {SONS.map((s, i) => (
      <Sequence key={i} from={s.de} durationInFrames={s.duree} layout="none" name={`son ${s.nom}`}>
        <Html5Audio src={staticFile(`sons/${s.nom}.wav`)} volume={s.volume} />
      </Sequence>
    ))}
  </>
);
