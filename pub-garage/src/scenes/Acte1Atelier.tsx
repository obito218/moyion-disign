// Acte 1 — « Vous êtes sous une voiture. Le téléphone sonne. Vous ne pouvez pas décrocher. »
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DOUX, SOUPLE, entre, ressort } from "../anim";
import { AppelManque, Cle, Combine } from "../composants/Icones";
import { HAUTEUR_TEL, LARGEUR_TEL, Telephone } from "../composants/Telephone";
import { Voiture } from "../composants/Voiture";
import { M } from "../moments";
import { C } from "../theme";

/** Numéro du client volontairement masqué : on n'affiche jamais le vrai numéro de quelqu'un. */
export const NUMERO_CLIENT = "06 •• •• •• 34";
/** Durée d'un cycle de sonnerie (30 frames de sonnerie + pause), partagée avec le bruitage. */
export const RAFALE = 46;

/** Chaussure de sécurité pointe en l'air (il est allongé sur le dos) ; origine = talon au sol. */
const ChaussureLevee: React.FC<{ x: number; y: number; angle?: number }> = ({ x, y, angle = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <rect x={-20} y={-42} width={40} height={42} rx={8} fill={C.encre} />
    <rect x={-20} y={-96} width={36} height={72} rx={16} fill={C.encre} />
    <rect x={-29} y={-90} width={11} height={92} rx={5} fill={C.orange} />
  </g>
);

/** Chaussure posée à plat, pointe vers la gauche ; origine = talon au sol. */
const ChaussurePosee: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-30} y={-52} width={32} height={52} rx={8} fill={C.encre} />
    <rect x={-84} y={-32} width={86} height={32} rx={15} fill={C.encre} />
    <rect x={-86} y={-7} width={88} height={9} rx={4} fill={C.orange} />
  </g>
);

/** Mécanicien allongé sous l'avant de la voiture : on ne voit que ses jambes, un genou levé. */
const Atelier: React.FC<{ frame: number }> = ({ frame }) => {
  // le pied bat la mesure : il est occupé
  const tape = Math.max(0, Math.sin(frame / 4.5)) * 10;
  return (
    <svg width={1080} height={440} viewBox="0 0 1080 440">
      <rect x={0} y={398} width={1080} height={42} fill="#17181A" />
      <rect x={0} y={396} width={1080} height={5} fill={C.trait} />
      <ellipse cx={650} cy={398} rx={400} ry={14} fill="#0E0F10" opacity={0.7} />
      {/* planche à roulettes */}
      <rect x={330} y={376} width={300} height={13} rx={6} fill={C.orange} />
      {[352, 604].map((x) => (
        <circle key={x} cx={x} cy={392} r={7} fill={C.encre} />
      ))}
      {/* jambe du fond, genou levé */}
      <path
        d="M470 350 L284 266 L182 362"
        fill="none"
        stroke="#2B303A"
        strokeWidth={38}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ChaussurePosee x={196} y={396} />
      {/* jambe de devant, tendue ; le pied tapote */}
      <path d="M470 370 L232 372" stroke={C.pantalon} strokeWidth={40} strokeLinecap="round" />
      <ChaussureLevee x={232} y={396} angle={-tape} />
      <g transform="translate(36 350) rotate(-30) scale(0.62)">
        <Cle taille={100} couleur={C.acierClair} />
      </g>
      <g transform="translate(270 0)">
        <Voiture id="atelier" />
      </g>
    </svg>
  );
};

const EcranAppel: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(${C.fondClair}, ${C.fond})` }}>
    <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", color: C.gris, fontSize: 36, fontWeight: 600 }}>
      Appel entrant
    </div>
    <div style={{ position: "absolute", top: 222, width: "100%", textAlign: "center", color: C.creme, fontSize: 64, fontWeight: 800 }}>
      {NUMERO_CLIENT}
    </div>
    <div
      style={{
        position: "absolute",
        top: 420,
        left: "50%",
        marginLeft: -120,
        width: 240,
        height: 240,
        borderRadius: 120,
        background: C.panneau,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Combine taille={130} couleur={C.creme} />
    </div>
    {[
      { cote: { left: 70 }, fond: C.acierFonce, angle: 135 },
      { cote: { right: 70 }, fond: C.orange, angle: 0 },
    ].map((b, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          bottom: 130,
          ...b.cote,
          width: 150,
          height: 150,
          borderRadius: 75,
          background: b.fond,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Combine taille={84} couleur={C.creme} style={{ transform: `rotate(${b.angle}deg)` }} />
      </div>
    ))}
  </AbsoluteFill>
);

const EcranVerrouille: React.FC<{ notif: number }> = ({ notif }) => (
  <AbsoluteFill style={{ background: C.fond }}>
    <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", color: C.creme, fontSize: 168, fontWeight: 600 }}>
      10:42
    </div>
    <div
      style={{
        position: "absolute",
        left: 22,
        right: 22,
        top: 470,
        padding: "34px 30px",
        borderRadius: 44,
        background: C.panneau,
        display: "flex",
        alignItems: "center",
        gap: 24,
        opacity: Math.min(1, notif * 1.5),
        transform: `translateY(${(1 - notif) * -260}px)`,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          flexShrink: 0,
          borderRadius: 34,
          background: "#3B2A1F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppelManque taille={90} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 50, fontWeight: 800, color: C.creme, lineHeight: 1.05, whiteSpace: "nowrap" }}>Appel manqué</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: C.gris, marginTop: 10 }}>{NUMERO_CLIENT}</div>
      </div>
    </div>
  </AbsoluteFill>
);

/** Arcs « ça sonne » de chaque côté du téléphone. */
const Ondes: React.FC<{ t: number; cx: number; cy: number }> = ({ t, cx, cy }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
    {[0, 1, 2].map((i) => {
      const phase = (((t - i * 4) % 15) + 15) % 15 / 15;
      const o = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
      const r = 170 + i * 42;
      return [-1, 1].map((s) => (
        <path
          key={`${i}${s}`}
          d={`M ${cx + s * r * Math.cos(0.6)} ${cy - r * Math.sin(0.6)} A ${r} ${r} 0 0 ${s > 0 ? 1 : 0} ${cx + s * r * Math.cos(0.6)} ${cy + r * Math.sin(0.6)}`}
          fill="none"
          stroke={C.orange}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={o}
        />
      ));
    })}
  </svg>
);

export const Acte1Atelier: React.FC<{ sortie: number }> = ({ sortie }) => {
  const frame = useCurrentFrame();

  // la voiture glisse déjà à la frame 0 : la miniature de la vidéo n'est jamais un écran vide
  const arrivee = ressort(frame, -14, DOUX);
  const focus = ressort(frame, M.premierPlanTelephone, DOUX); // l'atelier s'efface, le téléphone passe au premier plan
  const depart = ressort(frame, sortie, DOUX);

  const apparition = ressort(frame, M.sonnerie, SOUPLE);
  const t = frame - M.sonnerie;
  const sonne = t >= 0 && frame < M.finSonnerie;
  const rafale = sonne && t % RAFALE < 30;
  const vibration = rafale ? Math.sin(t * 2.3) * 4 : 0;

  const echelle = interpolate(focus, [0, 1], [0.42, 1]) * interpolate(apparition, [0, 1], [0.6, 1]);
  const cy = interpolate(focus, [0, 1], [460, 865]);
  const rotation = interpolate(focus, [0, 1], [-6, 0]) + vibration;
  const bascule = entre(frame, [M.finSonnerie - 2, M.finSonnerie + 8]); // appel entrant → appel manqué
  const notif = ressort(frame, M.appelManque, SOUPLE);

  return (
    <AbsoluteFill style={{ transform: `translateX(${-1150 * depart}px)`, opacity: 1 - depart }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: interpolate(apparition, [0, 1], [640, 900]),
          transform: `translateX(${(1 - arrivee) * -700}px) translateY(${focus * 260}px)`,
          opacity: 1 - focus,
        }}
      >
        <Atelier frame={frame} />
      </div>
      {rafale && focus < 0.5 ? <Ondes t={t} cx={540} cy={cy} /> : null}
      {apparition > 0 ? (
        <Telephone
          sombre
          style={{
            left: 540 - LARGEUR_TEL / 2,
            top: cy - HAUTEUR_TEL / 2,
            opacity: Math.min(1, apparition * 2),
            transform: `scale(${echelle}) rotate(${rotation}deg)`,
          }}
        >
          <div style={{ position: "absolute", inset: 0, opacity: 1 - bascule }}>
            <EcranAppel />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: bascule }}>
            <EcranVerrouille notif={notif} />
          </div>
        </Telephone>
      ) : null}
    </AbsoluteFill>
  );
};
