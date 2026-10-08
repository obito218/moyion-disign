// Acte 6 — « 30 jours pour essayer, gratuitement. Sans engagement. »
// Le texte géant suit la voix mot à mot : il tient lieu de sous-titre sur cet écran.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DOUX, SOUPLE, ressort } from "../anim";
import { M } from "../moments";
import { C } from "../theme";

export const CREDIT_VOIX = "Voix de synthèse : Kokoro, voix ff_siwis (données SIWIS, CC BY 4.0)";

export const Acte6Offre: React.FC<{ entree: number }> = ({ entree }) => {
  const frame = useCurrentFrame();
  const jours = ressort(frame, Math.max(entree, M.jours), SOUPLE);
  const essai = ressort(frame, M.essai, DOUX);
  const engagement = ressort(frame, M.engagement, SOUPLE);
  const signature = ressort(frame, M.signature, DOUX);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 430,
          width: "100%",
          textAlign: "center",
          opacity: Math.min(1, jours * 1.5),
          transform: `translateY(${(1 - jours) * 90}px)`,
        }}
      >
        <div style={{ fontSize: 290, fontWeight: 800, lineHeight: 0.92, color: C.orange, letterSpacing: -6 }}>30</div>
        <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 1, color: C.orange, letterSpacing: 4 }}>JOURS</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 880,
          width: "100%",
          textAlign: "center",
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.12,
          color: C.creme,
          opacity: essai,
          transform: `translateY(${(1 - essai) * 40}px)`,
        }}
      >
        pour essayer,
        <br />
        gratuitement.
      </div>
      <div style={{ position: "absolute", top: 1120, width: "100%", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            padding: "26px 48px 30px",
            border: `7px solid ${C.orange}`,
            borderRadius: 26,
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: 2,
            color: C.creme,
            opacity: Math.min(1, engagement * 1.5),
            transform: `scale(${0.85 + 0.15 * engagement})`,
          }}
        >
          SANS ENGAGEMENT
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1440,
          width: "100%",
          textAlign: "center",
          opacity: signature,
          transform: `translateY(${(1 - signature) * 30}px)`,
        }}
      >
        <div style={{ fontSize: 54, fontWeight: 800, color: C.creme }}>Obito</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: C.gris, marginTop: 4 }}>Montsoult (95)</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 92,
          height: 26,
          opacity: signature,
          transform: `scaleX(${signature})`,
          background: `repeating-linear-gradient(-45deg, ${C.orange} 0 26px, ${C.fond} 26px 52px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 34,
          width: "100%",
          textAlign: "center",
          fontSize: 22,
          fontWeight: 500,
          color: C.acier,
          opacity: signature,
        }}
      >
        {CREDIT_VOIX}
      </div>
    </AbsoluteFill>
  );
};
