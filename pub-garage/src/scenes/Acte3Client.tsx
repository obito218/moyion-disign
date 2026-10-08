// Acte 3 — SMS automatique, lien WhatsApp, l'assistante propose un créneau.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DOUX, SOUPLE, entre, ressort, tape } from "../anim";
import { Bulle, PointsFrappe, TexteProgressif, type Morceau } from "../composants/Bulle";
import { BulleChat, Chevron } from "../composants/Icones";
import { HAUT_ECRAN, Telephone } from "../composants/Telephone";
import { M } from "../moments";
import { C } from "../theme";

const BLANC_BULLE = "#FFFCF7";

const MOTS_VIDES = /^(garage|auto|autos|automobile|automobiles|du|de|des|la|le|les|l'|d'|et|&)$/i;

/** « Garage Dupont » → « D », « Garage du Centre » → « C », « TPA » → « TPA ». */
export const initiales = (nom: string) => {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  const utiles = mots.filter((m) => !MOTS_VIDES.test(m));
  const retenus = utiles.length > 0 ? utiles : mots;
  if (retenus.length === 1 && retenus[0].length <= 3) return retenus[0].toUpperCase();
  return retenus
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase() ?? "")
    .join("");
};

/** « Mardi 14h » → « mardi 14h » au milieu d'une phrase (on ne touche pas aux sigles). */
export const dansLaPhrase = (creneau: string) =>
  /^[A-ZÀ-Ý][a-zà-ÿ]/.test(creneau) ? creneau[0].toLowerCase() + creneau.slice(1) : creneau;

/** 06 00 00 00 00 → 33600000000 (format des liens wa.me). */
export const versInternational = (numero: string) => {
  const chiffres = numero.replace(/\D/g, "");
  return chiffres.startsWith("0") ? `33${chiffres.slice(1)}` : chiffres;
};

const EnTete: React.FC<{ nomGarage: string; sousTitre: React.ReactNode; avatar: React.ReactNode }> = ({ nomGarage, sousTitre, avatar }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: HAUT_ECRAN + 150,
      paddingTop: HAUT_ECRAN + 12,
      paddingLeft: 14,
      paddingRight: 24,
      background: C.creme,
      borderBottom: `2px solid ${C.creme3}`,
      display: "flex",
      alignItems: "center",
      gap: 14,
      zIndex: 2,
    }}
  >
    <Chevron taille={50} />
    <div
      style={{
        width: 96,
        height: 96,
        flexShrink: 0,
        borderRadius: 48,
        background: C.orange,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.creme,
        fontSize: 40,
        fontWeight: 800,
      }}
    >
      {avatar}
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 42, fontWeight: 800, color: C.encre, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {nomGarage}
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, color: C.acier, display: "flex", alignItems: "center", gap: 10 }}>{sousTitre}</div>
    </div>
  </div>
);

const EcranSms: React.FC<{ nomGarage: string; numero: string; sms: number; tap: number }> = ({ nomGarage, numero, sms, tap }) => (
  <AbsoluteFill style={{ background: C.creme2 }}>
    <EnTete nomGarage={nomGarage} avatar={initiales(nomGarage)} sousTitre={<span>SMS · {numero}</span>} />
    <div style={{ position: "absolute", top: HAUT_ECRAN + 186, width: "100%", textAlign: "center", fontSize: 28, fontWeight: 600, color: C.acier }}>
      Aujourd'hui 10:43
    </div>
    <div style={{ position: "absolute", top: HAUT_ECRAN + 240, left: 24, right: 24 }}>
      <Bulle cote="gauche" fond={BLANC_BULLE} apparition={sms} largeurMax={520}>
        <div style={{ fontSize: 42 }}>
          Bonjour, ici {nomGarage}. On ne peut pas décrocher. Écrivez-nous ici&nbsp;:
        </div>
        <div
          style={{
            position: "relative",
            marginTop: 18,
            padding: "18px 18px",
            borderRadius: 22,
            background: C.creme,
            border: `2px solid ${C.creme3}`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            overflow: "hidden",
          }}
        >
          <BulleChat taille={78} />
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: C.encre }}>Écrire sur WhatsApp</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: C.acier }}>wa.me/{versInternational(numero)}</div>
          </div>
          {tap > 0 && tap < 1 ? (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 420,
                height: 420,
                marginLeft: -210,
                marginTop: -210,
                borderRadius: 210,
                background: C.orange,
                opacity: 0.35 * (1 - tap),
                transform: `scale(${0.1 + tap})`,
              }}
            />
          ) : null}
        </div>
      </Bulle>
    </div>
  </AbsoluteFill>
);

type ChatProps = {
  nomGarage: string;
  creneau: string;
  frame: number;
};

const CLIENT_DEMANDE = "Bonjour, j'ai un bruit quand je freine.";

const EcranChat: React.FC<ChatProps> = ({ nomGarage, creneau, frame }) => {
  const demande = ressort(frame, M.demande - 4, SOUPLE);
  const lettresDemande = tape(frame, M.demande, M.finDemande, CLIENT_DEMANDE.length);

  const reponse: Morceau[] = [
    { t: "Bonjour ! On peut vous prendre " },
    { t: dansLaPhrase(creneau), gras: true, couleur: C.orangeFonce },
    { t: ". Ça vous va ?" },
  ];
  const longueurReponse = reponse.reduce((n, m) => n + m.t.length, 0);
  const points = frame >= M.pointsFrappe && frame < M.reponse ? ressort(frame, M.pointsFrappe, SOUPLE) : 0;
  const bulleReponse = ressort(frame, M.reponse, SOUPLE);
  const lettresReponse = tape(frame, M.reponse, M.finReponse, longueurReponse);
  const merci = ressort(frame, M.merci, SOUPLE);

  return (
    <AbsoluteFill style={{ background: "#EDE6DB" }}>
      <EnTete
        nomGarage={nomGarage}
        avatar={<BulleChat taille={58} couleur={C.creme} />}
        sousTitre={
          <>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: C.orange, display: "inline-block" }} />
            Assistante · en ligne
          </>
        }
      />
      <div
        style={{
          position: "absolute",
          top: HAUT_ECRAN + 190,
          left: 22,
          right: 22,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <Bulle cote="droite" fond={C.orangePale} apparition={demande}>
          <TexteProgressif morceaux={[{ t: CLIENT_DEMANDE }]} visibles={lettresDemande} />
        </Bulle>
        <div style={{ position: "relative" }}>
          <Bulle cote="gauche" fond={BLANC_BULLE} apparition={bulleReponse}>
            <TexteProgressif morceaux={reponse} visibles={lettresReponse} />
          </Bulle>
          {points > 0 ? (
            <div style={{ position: "absolute", left: 0, top: 0 }}>
              <PointsFrappe apparition={points} fond={BLANC_BULLE} />
            </div>
          ) : null}
        </div>
        <Bulle cote="droite" fond={C.orangePale} apparition={merci}>
          Oui, parfait. Merci&nbsp;!
        </Bulle>
      </div>
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 34,
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: 1,
            height: 84,
            borderRadius: 42,
            background: BLANC_BULLE,
            display: "flex",
            alignItems: "center",
            paddingLeft: 30,
            fontSize: 32,
            fontWeight: 600,
            color: C.gris,
          }}
        >
          Message
        </div>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={40} height={40} viewBox="0 0 100 100">
            <path d="M14 50L88 16 70 86 50 60z" fill={C.creme} />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

type Props = {
  nomGarage: string;
  numero: string;
  creneau: string;
  entree: number;
  sortie: number;
};

export const Acte3Client: React.FC<Props> = ({ nomGarage, numero, creneau, entree, sortie }) => {
  const frame = useCurrentFrame();
  const arrivee = ressort(frame, entree, SOUPLE);
  const depart = ressort(frame, sortie, DOUX);
  const sms = ressort(frame, M.sms, SOUPLE);
  const tap = entre(frame, [M.clicLien, M.clicLien + 16], [0, 1]);
  const bascule = ressort(frame, M.clicLien + 8, DOUX);

  return (
    <AbsoluteFill style={{ transform: `translateX(${-1150 * depart}px)`, opacity: 1 - depart }}>
      <Telephone
        style={{
          left: 230,
          top: interpolate(arrivee, [0, 1], [1950, 230]),
        }}
      >
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-30 * bascule}%)`, filter: `brightness(${1 - 0.25 * bascule})` }}>
          <EcranSms nomGarage={nomGarage} numero={numero} sms={sms} tap={tap} />
        </div>
        {bascule > 0.001 ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - bascule) * 100}%)` }}>
            <EcranChat nomGarage={nomGarage} creneau={creneau} frame={frame} />
          </div>
        ) : null}
      </Telephone>
    </AbsoluteFill>
  );
};
