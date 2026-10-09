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

/** Écran final (offre + signature) après la dernière phrase : visé, et minimum accepté. */
const FIN_CIBLE_S = 3.5;
const FIN_MIN_S = 2;
const PAUSE_PLANCHER = 0.25;
/** Les transitions entre scènes ont besoin de temps : on ne divise jamais les pauses par plus de 2… */
const RESSERRAGE_MAX = 0.5;
/** … et on ne les allonge pas de plus de moitié, pour garder un rythme vivant. */
const ETIREMENT_MAX = 1.5;

const mesure = (id: string): Mesure => {
  const m = mesures[id];
  if (!m) throw new Error(`Pas de mesure pour la phrase ${id} : lancez « npm run voix ».`);
  return m;
};

/** Toutes les pauses sont étirées ou resserrées d'autant pour que la voix, quel que soit son débit,
 * finisse ≈ 3,5 s avant la fin (au pire 2 s). */
const facteurPauses = (segments: Segment[]) => {
  const parole = segments.reduce((t, s) => t + mesure(s.id).finParole - mesure(s.id).debutParole, 0);
  const pauses = segments.reduce((t, s) => t + s.pause, 0);
  let k = Math.min(ETIREMENT_MAX, (DUREE_S - FIN_CIBLE_S - parole) / pauses);
  if (k < RESSERRAGE_MAX) k = (DUREE_S - FIN_MIN_S - parole) / pauses;
  if (k < RESSERRAGE_MAX) {
    throw new Error(
      `La voix dure ${parole.toFixed(1)} s sans les pauses : trop long pour ${DUREE_S} s. Parlez un peu plus vite ou raccourcissez le texte.`,
    );
  }
  return k;
};

const construire = (): Phrase[] => {
  const segments = segmentsJson as Segment[];
  const k = facteurPauses(segments);
  let curseur = 0;
  return segments.map((s) => {
    const m = mesure(s.id);
    const debut = curseur + Math.max(Math.min(s.pause, PAUSE_PLANCHER), s.pause * k);
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
if (derniere.fin > DUREE - FIN_MIN_S * FPS) {
  throw new Error(
    `La voix finit à ${(derniere.fin / FPS).toFixed(1)} s : il faut au moins 2 s d'écran final avant ${DUREE_S} s.`,
  );
}

export const p = (id: string): Phrase => {
  const phrase = PHRASES.find((x) => x.id === id);
  if (!phrase) throw new Error(`Phrase inconnue : ${id}`);
  return phrase;
};
