// Citadine générique vue de profil, avant à gauche. Repère : 800×400, sol à y = 396.
import { C } from "../theme";

const CAISSE =
  "M40 300 L44 252 Q48 232 80 226 L300 204 L408 126 Q418 116 440 116 L630 116 Q652 116 664 132 " +
  "L740 222 L760 236 L764 300 Q764 318 744 318 L692 318 A72 72 0 0 0 548 318 L262 318 " +
  "A72 72 0 0 0 118 318 L60 318 Q40 318 40 300 Z";

const Roue: React.FC<{ cx: number; angle: number }> = ({ cx, angle }) => (
  <g transform={`translate(${cx} 340) rotate(${angle})`}>
    <circle r={56} fill={C.encre} />
    <circle r={35} fill={C.acierClair} />
    {[0, 72, 144, 216, 288].map((a) => (
      <rect key={a} x={-5} y={-33} width={10} height={24} rx={4} fill={C.acier} transform={`rotate(${a})`} />
    ))}
    <circle r={11} fill={C.acierFonce} />
  </g>
);

type Props = {
  id: string;
  carrosserie?: string;
  bas?: string;
  vitre?: string;
  angleRoues?: number;
};

/** À utiliser dans un <svg> (c'est un <g>). */
export const Voiture: React.FC<Props> = ({
  id,
  carrosserie = C.acier,
  bas = C.acierFonce,
  vitre = "#2A2D33",
  angleRoues = 0,
}) => (
  <g>
    <defs>
      <clipPath id={`caisse-${id}`}>
        <path d={CAISSE} />
      </clipPath>
    </defs>
    <circle cx={190} cy={322} r={68} fill="#101113" />
    <circle cx={620} cy={322} r={68} fill="#101113" />
    <path d={CAISSE} fill={carrosserie} />
    <rect x={0} y={276} width={800} height={60} fill={bas} clipPath={`url(#caisse-${id})`} />
    <path d="M318 200 L410 136 Q418 130 428 130 L520 130 L520 200 Z" fill={vitre} />
    <path d="M536 130 L624 130 Q636 130 644 140 L690 200 L536 200 Z" fill={vitre} />
    <path d="M372 200 L440 130 L462 130 L394 200 Z" fill={C.creme} opacity={0.14} />
    <path d="M590 200 L620 130 L634 130 L604 200 Z" fill={C.creme} opacity={0.12} />
    <path d="M302 208 Q298 262 304 314" fill="none" stroke={bas} strokeWidth={4} />
    <path d="M528 206 L528 312" fill="none" stroke={bas} strokeWidth={4} />
    <rect x={474} y={220} width={36} height={9} rx={4.5} fill={bas} />
    <rect x={650} y={220} width={36} height={9} rx={4.5} fill={bas} />
    <path d="M318 198 L342 190 L348 208 L324 212 Z" fill={bas} />
    <path d="M47 248 Q50 237 70 234 L98 231 L94 252 Z" fill={C.creme} />
    <path d="M744 226 L759 238 L761 264 L745 264 Z" fill={C.orange} />
    <rect x={36} y={286} width={70} height={16} rx={8} fill={C.encre} opacity={0.55} />
    <rect x={716} y={286} width={52} height={16} rx={8} fill={C.encre} opacity={0.55} />
    <Roue cx={190} angle={angleRoues} />
    <Roue cx={620} angle={angleRoues} />
  </g>
);
