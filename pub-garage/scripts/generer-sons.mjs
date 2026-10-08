// Synthétise les bruitages (aucun fichier externe, aucune licence) dans public/sons/.
// Usage : node scripts/generer-sons.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const DOSSIER = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sons");

const tampon = (secondes) => new Float32Array(Math.round(secondes * SR));

/** Note de cloche douce : quelques partiels qui s'éteignent. */
const cloche = (x, debut, freq, amp, duree = 0.6) => {
  const partiels = [
    [1, 1, 0.32],
    [2, 0.35, 0.16],
    [3.01, 0.12, 0.07],
  ];
  const i0 = Math.round(debut * SR);
  for (let i = 0; i < duree * SR && i0 + i < x.length; i++) {
    const t = i / SR;
    const attaque = Math.min(1, t / 0.004);
    let v = 0;
    for (const [ratio, a, tau] of partiels) v += a * Math.sin(2 * Math.PI * freq * ratio * t) * Math.exp(-t / tau);
    x[i0 + i] += amp * attaque * v;
  }
};

// générateur pseudo-aléatoire déterministe (rendus identiques d'une fois sur l'autre)
let graine = 12345;
const bruit = () => {
  graine = (graine * 1103515245 + 12345) & 0x7fffffff;
  return graine / 0x3fffffff - 1;
};

const sons = {
  // sonnerie douce : 2 × (mi – do), répétée par la composition à chaque rafale
  sonnerie: () => {
    const x = tampon(1.05);
    [0, 0.13, 0.42, 0.55].forEach((t, i) => cloche(x, t, i % 2 ? 1046.5 : 1318.5, 0.32, 0.5));
    return x;
  },
  // appel manqué : deux notes qui descendent
  manque: () => {
    const x = tampon(0.8);
    cloche(x, 0, 784, 0.35);
    cloche(x, 0.16, 587.3, 0.35);
    return x;
  },
  // SMS reçu : deux notes qui montent
  sms: () => {
    const x = tampon(0.8);
    cloche(x, 0, 880, 0.35);
    cloche(x, 0.11, 1318.5, 0.35);
    return x;
  },
  // clic du doigt
  clic: () => {
    const x = tampon(0.05);
    let precedent = 0;
    for (let i = 0; i < x.length; i++) {
      const t = i / SR;
      const n = bruit();
      x[i] = 0.5 * (n - precedent) * Math.exp(-t / 0.004) + 0.15 * Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-t / 0.008);
      precedent = n;
    }
    return x;
  },
  // bulle de message qui apparaît
  pop: () => {
    const x = tampon(0.12);
    let phase = 0;
    for (let i = 0; i < x.length; i++) {
      const t = i / SR;
      phase += (2 * Math.PI * (950 - 3500 * t)) / SR;
      x[i] = 0.45 * Math.sin(phase) * Math.min(1, t / 0.002) * Math.exp(-t / 0.028);
    }
    return x;
  },
  // fiche reçue / rendez-vous confirmé : petit arpège montant
  valide: () => {
    const x = tampon(0.9);
    [523.3, 659.3, 784].forEach((f, i) => cloche(x, i * 0.07, f, 0.26, 0.7));
    return x;
  },
  // carte qui se retourne : souffle bref
  retourne: () => {
    const x = tampon(0.09);
    let filtre = 0;
    for (let i = 0; i < x.length; i++) {
      const t = i / SR;
      filtre += 0.25 * (bruit() - filtre);
      x[i] = 0.9 * filtre * Math.sin(Math.PI * Math.min(1, t / 0.09));
    }
    return x;
  },
  // « SANS ENGAGEMENT » : coup de tampon sourd
  tampon: () => {
    const x = tampon(0.4);
    let phase = 0;
    for (let i = 0; i < x.length; i++) {
      const t = i / SR;
      phase += (2 * Math.PI * (95 - 120 * Math.min(t, 0.3))) / SR;
      x[i] = 0.7 * Math.sin(phase) * Math.min(1, t / 0.003) * Math.exp(-t / 0.07) + 0.2 * bruit() * Math.exp(-t / 0.006);
    }
    return x;
  },
};

const ecrireWav = (chemin, x) => {
  const donnees = Buffer.alloc(x.length * 2);
  x.forEach((v, i) => donnees.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const entete = Buffer.alloc(44);
  entete.write("RIFF", 0);
  entete.writeUInt32LE(36 + donnees.length, 4);
  entete.write("WAVEfmt ", 8);
  entete.writeUInt32LE(16, 16);
  entete.writeUInt16LE(1, 20);
  entete.writeUInt16LE(1, 22);
  entete.writeUInt32LE(SR, 24);
  entete.writeUInt32LE(SR * 2, 28);
  entete.writeUInt16LE(2, 32);
  entete.writeUInt16LE(16, 34);
  entete.write("data", 36);
  entete.writeUInt32LE(donnees.length, 40);
  writeFileSync(chemin, Buffer.concat([entete, donnees]));
};

mkdirSync(DOSSIER, { recursive: true });
for (const [nom, fabriquer] of Object.entries(sons)) {
  const x = fabriquer();
  // fondu de sortie de 5 ms pour éviter tout clic en fin de fichier
  const n = Math.round(0.005 * SR);
  for (let i = 0; i < n; i++) x[x.length - 1 - i] *= i / n;
  ecrireWav(join(DOSSIER, `${nom}.wav`), x);
  const pic = x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  console.log(`${nom}.wav  ${(x.length / SR).toFixed(2)} s  pic ${(20 * Math.log10(pic)).toFixed(1)} dBFS`);
}
