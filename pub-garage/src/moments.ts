// Instants clés (en frames), tous calculés depuis la voix : les scènes et les bruitages lisent les mêmes valeurs.
import { p } from "./timeline";

/** Frame située à `k` (0 → 1) de la durée parlée de la phrase `id`. */
const dans = (id: string, k: number) => {
  const ph = p(id);
  return ph.debut + Math.round((ph.fin - ph.debut) * k);
};

const s09 = p("09");

export const M = {
  // bascules entre actes
  atelierVersRue: p("03").fin + 8,
  rueVersClient: p("04").fin + 8,
  clientVersFiche: p("07").fin + 24,
  ficheVersCartes: p("09").fin + 8,
  cartesVersOffre: p("10").fin + 10,

  // acte 1
  sonnerie: p("02").debut - 12,
  finSonnerie: p("03").debut,
  premierPlanTelephone: p("02").fin + 6,
  appelManque: dans("03", 0.55),
  // acte 2
  departVoiture: p("04").debut + 6,
  arriveeVoiture: p("04").fin - 2,
  enseigneAllumee: p("04").fin - 6,
  // acte 3
  sms: dans("05", 0.5),
  clicLien: dans("06", 0.12),
  demande: dans("06", 0.42),
  finDemande: p("06").fin,
  pointsFrappe: p("07").debut - 4,
  reponse: dans("07", 0.32),
  finReponse: p("07").fin - 6,
  merci: p("07").fin + 2,
  // acte 4
  fiche: dans("08", 0.55),
  lignesFiche: [0, 1, 2].map((i) => (s09.morceaux[i] ?? s09.debut + i * 20) - 3),
  confirme: (s09.morceaux[2] ?? s09.fin) + 14,
  // acte 5
  retournement: dans("10", 0.42),
  // acte 6
  jours: p("11").debut - 4,
  essai: dans("11", 0.36),
  engagement: p("12").debut - 3,
  signature: p("12").fin + 14,
};
