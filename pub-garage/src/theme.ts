import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Palette : graphite foncé, orange sécurité, blanc cassé.
export const C = {
  fond: "#1C1D20",
  fondClair: "#26282C",
  panneau: "#2E3035",
  trait: "#3D4046",
  acier: "#6B7079",
  acierClair: "#8A8F98",
  acierFonce: "#4E525A",
  gris: "#A3A6AC",
  encre: "#131416",
  orange: "#FF6B1A",
  orangeFonce: "#D2520C",
  orangePale: "#FFDCC6",
  creme: "#F3EEE6",
  creme2: "#E6DFD4",
  creme3: "#D6CEC1",
  pantalon: "#3E4552",
} as const;

export const POLICE = "Barlow";

for (const poids of [500, 600, 700, 800]) {
  loadFont({
    family: POLICE,
    url: staticFile(`fonts/barlow-latin-${poids}-normal.woff2`),
    weight: String(poids),
  });
}
