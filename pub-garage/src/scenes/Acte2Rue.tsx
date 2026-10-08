// Acte 2 — « Le client, lui, appelle le garage d'en face. »
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { DOUX, ressort } from "../anim";
import { AppelManque } from "../composants/Icones";
import { Voiture } from "../composants/Voiture";
import { M } from "../moments";
import { C, POLICE } from "../theme";

const ECHELLE_AUTO = 0.42;
const DEPART_X = -380;
const ARRIVEE_X = 805;

const Facade: React.FC<{ x: number; enseigne: string; allumee: number; ouverte: boolean }> = ({ x, enseigne, allumee, ouverte }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={0} y={190} width={470} height={520} fill="#2A2C31" />
    <rect x={-12} y={172} width={494} height={30} rx={6} fill="#383A40" />
    <rect
      x={36}
      y={232}
      width={398}
      height={124}
      rx={14}
      fill={interpolateColors(allumee, [0, 1], ["#3A3C42", C.orange])}
    />
    <text
      x={235}
      y={318}
      textAnchor="middle"
      fontFamily={POLICE}
      fontWeight={800}
      fontSize={78}
      letterSpacing={2}
      fill={interpolateColors(allumee, [0, 1], [C.gris, C.encre])}
    >
      {enseigne}
    </text>
    {ouverte ? (
      <>
        <rect x={56} y={410} width={358} height={300} fill={C.creme} opacity={0.92} />
        <rect x={56} y={410} width={358} height={300} fill={C.orangePale} opacity={0.35} />
        <rect x={56} y={410} width={358} height={34} fill="#45484F" />
      </>
    ) : (
      <>
        <rect x={56} y={410} width={358} height={300} fill="#45484F" />
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={56} y={430 + i * 26} width={358} height={5} fill="#383A40" />
        ))}
      </>
    )}
  </g>
);

export const Acte2Rue: React.FC<{ entree: number; sortie: number }> = ({ entree, sortie }) => {
  const frame = useCurrentFrame();
  const apparition = ressort(frame, entree, DOUX);
  const depart = ressort(frame, sortie, DOUX);
  const roule = ressort(frame, M.departVoiture, DOUX, M.arriveeVoiture - M.departVoiture);
  const x = interpolate(roule, [0, 1], [DEPART_X, ARRIVEE_X]);
  const tours = ((x - DEPART_X) / (56 * ECHELLE_AUTO)) * (180 / Math.PI);
  const allumee = ressort(frame, M.enseigneAllumee, DOUX);

  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(apparition, 1 - depart),
        transform: `translateX(${(1 - apparition) * 260 - depart * 1150}px)`,
      }}
    >
      <svg width={1080} height={1000} viewBox="0 0 1080 1000" style={{ position: "absolute", top: 400 }}>
        <Facade x={40} enseigne="VOUS" allumee={0} ouverte={false} />
        <Facade x={570} enseigne="EN FACE" allumee={allumee} ouverte />
        <g transform="translate(398 150)">
          <circle r={62} fill={C.panneau} stroke={C.fond} strokeWidth={8} />
          <g transform="translate(-40 -40)">
            <AppelManque taille={80} />
          </g>
        </g>
        <rect x={0} y={710} width={1080} height={34} fill="#303237" />
        <rect x={0} y={744} width={1080} height={256} fill="#141517" />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={i * 120 + 20} y={930} width={70} height={10} rx={5} fill={C.trait} />
        ))}
        <g transform={`translate(${x} 900) scale(${-ECHELLE_AUTO} ${ECHELLE_AUTO}) translate(-400 -396)`}>
          <Voiture id="client" carrosserie={C.creme2} bas={C.creme3} angleRoues={-tours} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
