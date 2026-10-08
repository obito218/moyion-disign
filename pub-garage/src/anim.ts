import { Easing, interpolate, spring, type SpringConfig } from "remotion";
import { FPS } from "./timeline";

/** Glissement sans rebond. */
export const DOUX: Partial<SpringConfig> = { damping: 200 };
/** Léger rebond : téléphones, bulles, cartes. */
export const SOUPLE: Partial<SpringConfig> = { damping: 15, stiffness: 120 };

export const ressort = (frame: number, debut: number, config: Partial<SpringConfig> = DOUX, duree?: number) =>
  spring({ frame: frame - debut, fps: FPS, config, durationInFrames: duree });

export const entre = (
  frame: number,
  [a, b]: [number, number],
  [c, d]: [number, number] = [0, 1],
  easing: (t: number) => number = Easing.inOut(Easing.cubic),
) => interpolate(frame, [a, b], [c, d], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Nombre de caractères tapés entre `debut` et `fin`. */
export const tape = (frame: number, debut: number, fin: number, total: number) =>
  Math.round(entre(frame, [debut, fin], [0, total], Easing.linear));
