// La voix pilote tout : chaque phrase démarre après sa « pause », les scènes et les
// sous-titres s'accrochent aux phrases. Changer la voix = remesurer (`npm run voix`), rien d'autre.
import mesuresJson from "./voix/mesures.json";
import segmentsJson from "./voix/segments.json";

export const FPS = 30;
export const DUREE_S = 40;
export const DUREE = DUREE_S * FPS;

type Segment = {
  id: string;
  pause: number;
  texte: string;
  prononciation?: string;
  sousTitre?: boolean;
};

type Mesure = {
  duree: number;
  debutParole: number;
  finParole: number;
  morceaux: number[][];
};

export type Phrase = {
  id: string;
  texte: string;
  sousTitre: boolean;
  /** frame où le fichier audio démarre (peut précéder la parole s'il y a un blanc au début) */
  audio: number;
  /** frame où la parole commence */
  debut: number;
  /** frame où la parole se termine */
  fin: number;
  /** frame de début de chaque morceau de parole séparé par une pause (≥ 1 élément) */
  morceaux: number[];
};

const mesures = mesuresJson as Record<string, Mesure>;

const construire = (): Phrase[] => {
  let curseur = 0;
  return (segmentsJson as Segment[]).map((s) => {
    const m = mesures[s.id];
    if (!m) {
      throw new Error(`Pas de mesure pour la phrase ${s.id} : lancez « npm run voix ».`);
    }
    const debut = curseur + s.pause;
    const fin = debut + (m.finParole - m.debutParole);
    curseur = fin;
    return {
      id: s.id,
      texte: s.texte,
      sousTitre: s.sousTitre ?? true,
      audio: Math.round((debut - m.debutParole) * FPS),
      debut: Math.round(debut * FPS),
      fin: Math.round(fin * FPS),
      morceaux: m.morceaux.map(([a]) => Math.round((debut + a - m.debutParole) * FPS)),
    };
  });
};

export const PHRASES = construire();

const derniere = PHRASES[PHRASES.length - 1];
if (derniere.fin > DUREE - 2 * FPS) {
  throw new Error(
    `La voix finit à ${(derniere.fin / FPS).toFixed(1)} s : il faut au moins 2 s d'écran final avant ${DUREE_S} s.`,
  );
}

export const p = (id: string): Phrase => {
  const phrase = PHRASES.find((x) => x.id === id);
  if (!phrase) throw new Error(`Phrase inconnue : ${id}`);
  return phrase;
};
