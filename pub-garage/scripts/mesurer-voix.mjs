// Mesure chaque fichier public/voix/<id>.wav (durée, début/fin de parole, pauses internes)
// et écrit src/voix/mesures.json. À relancer après chaque changement de voix : `npm run voix`.
// Aucune dépendance : lit le WAV directement (PCM 16/24/32 bits ou float 32, mono ou stéréo).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const segments = JSON.parse(readFileSync(join(RACINE, "src/voix/segments.json"), "utf8"));

const SEUIL_DB = -35; // sous ce niveau (relatif au pic), on considère que c'est un silence
const PAUSE_MIN = 0.12; // une pause interne doit durer au moins 120 ms
// mêmes règles que src/timeline.ts
const DUREE_TOTALE = 40;
const FIN_CIBLE = 3.5; // écran final visé après la dernière phrase
const FIN_MIN = 2; // écran final minimum
const PAUSE_PLANCHER = 0.25;
const RESSERRAGE_MAX = 0.5;
const ETIREMENT_MAX = 1.5;

function lireWav(chemin) {
  const b = readFileSync(chemin);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error(`${chemin} n'est pas un WAV (convertissez avec : npx remotion ffmpeg -i entree.m4a -ac 1 -ar 44100 sortie.wav)`);
  }
  let fmt = null;
  let data = null;
  for (let o = 12; o + 8 <= b.length; ) {
    const id = b.toString("ascii", o, o + 4);
    const taille = b.readUInt32LE(o + 4);
    if (id === "fmt ") {
      let format = b.readUInt16LE(o + 8);
      if (format === 0xfffe) format = b.readUInt16LE(o + 32);
      fmt = { format, canaux: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) };
    } else if (id === "data") {
      data = b.subarray(o + 8, Math.min(b.length, o + 8 + taille));
    }
    o += 8 + taille + (taille % 2);
  }
  if (!fmt || !data) throw new Error(`${chemin} : WAV incomplet`);
  const { format, canaux, sr, bits } = fmt;
  const octets = bits / 8;
  const n = Math.floor(data.length / (octets * canaux));
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let somme = 0;
    for (let c = 0; c < canaux; c++) {
      const p = (i * canaux + c) * octets;
      if (format === 3 && bits === 32) somme += data.readFloatLE(p);
      else if (bits === 16) somme += data.readInt16LE(p) / 32768;
      else if (bits === 24) somme += data.readIntLE(p, 3) / 8388608;
      else if (bits === 32) somme += data.readInt32LE(p) / 2147483648;
      else throw new Error(`${chemin} : format non géré (${bits} bits)`);
    }
    x[i] = somme / canaux;
  }
  return { x, sr };
}

function mesurer({ x, sr }) {
  const pas = Math.round(sr * 0.01);
  const rms = [];
  for (let i = 0; i + pas <= x.length; i += pas) {
    let s = 0;
    for (let j = i; j < i + pas; j++) s += x[j] * x[j];
    rms.push(Math.sqrt(s / pas));
  }
  const pic = Math.max(...rms, 1e-9);
  const voise = rms.map((v) => 20 * Math.log10(v / pic + 1e-12) > SEUIL_DB);
  const morceaux = [];
  for (let i = 0; i < voise.length; i++) {
    if (!voise[i]) continue;
    let j = i;
    while (j < voise.length && voise[j]) j++;
    const debut = i * 0.01;
    const fin = j * 0.01;
    const dernier = morceaux.at(-1);
    if (dernier && debut - dernier[1] < PAUSE_MIN) dernier[1] = fin;
    else morceaux.push([debut, fin]);
    i = j;
  }
  const propres = morceaux.filter(([a, b]) => b - a >= 0.05).map(([a, b]) => [arrondi(a), arrondi(b)]);
  if (propres.length === 0) throw new Error("aucune parole détectée");
  return {
    duree: arrondi(x.length / sr),
    debutParole: propres[0][0],
    finParole: propres.at(-1)[1],
    morceaux: propres,
  };
}

const arrondi = (v) => Math.round(v * 1000) / 1000;

const mesures = {};
for (const seg of segments) {
  mesures[seg.id] = mesurer(lireWav(join(RACINE, "public/voix", `${seg.id}.wav`)));
}

// pauses étirées ou resserrées selon le débit de la voix (même calcul que src/timeline.ts)
const parole = segments.reduce((t, s) => t + mesures[s.id].finParole - mesures[s.id].debutParole, 0);
const pauses = segments.reduce((t, s) => t + s.pause, 0);
let k = Math.min(ETIREMENT_MAX, (DUREE_TOTALE - FIN_CIBLE - parole) / pauses);
if (k < RESSERRAGE_MAX) k = (DUREE_TOTALE - FIN_MIN - parole) / pauses;

let curseur = 0;
for (const seg of segments) {
  const m = mesures[seg.id];
  const debut = curseur + Math.max(Math.min(seg.pause, PAUSE_PLANCHER), seg.pause * k);
  curseur = debut + (m.finParole - m.debutParole);
  console.log(
    `${seg.id}  parole ${debut.toFixed(2)} → ${curseur.toFixed(2)} s  (${m.morceaux.length} morceau(x))  ${seg.texte.replaceAll("*", "")}`,
  );
}
console.log(`\nParole : ${parole.toFixed(1)} s. Dernière phrase finie à ${curseur.toFixed(2)} s sur ${DUREE_TOTALE} s.`);
if (Math.abs(k - 1) > 0.01) console.log(`Pauses ajustées à ${Math.round(k * 100)} % selon le débit de la voix.`);
if (k < RESSERRAGE_MAX || curseur > DUREE_TOTALE - FIN_MIN) {
  console.error(`⚠️  Trop long, même en resserrant les pauses : parlez un peu plus vite ou raccourcissez le texte.`);
  process.exit(1);
}
writeFileSync(join(RACINE, "src/voix/mesures.json"), JSON.stringify(mesures, null, 2) + "\n");
