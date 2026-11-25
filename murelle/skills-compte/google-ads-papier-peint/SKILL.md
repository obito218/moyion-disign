---
name: google-ads-papier-peint
description: Conseiller Google Ads / Google Shopping pour la boutique Shopify MURELLE (papier peint panoramique sur mesure, vendu au m²) — seuils de rentabilité, bloquants avant dépense, flux Merchant Center, lancement, décisions chiffrées. À utiliser pour toute question pub, ROAS, CPA, budget, flux, Merchant Center.
---

# Google Ads — papier peint panoramique (MURELLE)

## Contexte à vérifier avant de répondre
Sources de vérité, dans cet ordre : les données Shopify en direct si le connecteur Shopify est disponible (prix des variantes, produits avec images, politiques, paiements) ; le dépôt `obito218/moyion-disign` s'il est accessible (`murelle/COMPTE-RENDU.md`, `murelle/RECHERCHE-SKILLS.md`) ; sinon, demander. Les valeurs ci-dessous datent du 25/11/2026 : les remplacer dès qu'une source plus récente les contredit.

- Produit : papier peint panoramique imprimé sur mesure, vendu au m² (quantité = m² facturés). Lés de 50 cm, 10 cm de marge de coupe en largeur et en hauteur, surface arrondie au m² supérieur.
- Gammes (option « Matière ») : Essentielle = Intissé UV ; **Signature = Intissé HP Latex (mise en avant)** ; Prestige = Soie HP Latex.
- Prix en ligne : **37 / 45 / 53 € TTC le m²**. Proposition non validée : 39 / 49 / 59. Obsolète : 29 / 39 / 52. Toujours relire le prix réel des variantes.
- Commande type : mur de 320 × 250 cm → 7 lés, 10 m² facturés, soit ≈ 370 / 450 / 530 €.
- Coût livré réel : inconnu. Hypothèse de travail : 40 % du prix HT, jusqu'au devis fournisseur.
- Budget de départ : ≈ 2 000 € au total. Pas de stock avant demande prouvée.
- Canal principal : Google Shopping (Shopping standard pour le test, Performance Max ensuite). Meta en test.
- Marché : France (UE) → RGPD et Consent Mode v2.

## Calculs à refaire à chaque conseil chiffré
1. HT = TTC / 1,2. Marge brute par m² = HT − coût livré.
2. Frais de paiement ≈ 3 % du TTC → marge nette par m².
3. ROAS de rentabilité = prix / marge nette, en précisant la base (TTC ou HT selon la valeur de conversion reçue par Google Ads).
4. ROAS cible de pilotage = rentabilité + marge de sécurité (≥ 2,3 sur base TTC tant que les coûts réels ne sont pas confirmés).
5. CPA max = marge nette par commande moyenne (m² × marge nette par m²).

Référence au 25/11/2026 (coût = 40 % du HT, frais 3 %) :

| Gamme | HT/m² | Coût max/m² | Marge nette/m² | Commande 10 m² | Marge/commande |
|---|---|---|---|---|---|
| Essentielle | 30,83 € | 12,33 € | 17,39 € | 370 € | 174 € |
| Signature | 37,50 € | 15,00 € | 21,15 € | 450 € | 211 € |
| Prestige | 44,17 € | 17,67 € | 24,91 € | 530 € | 249 € |

ROAS de rentabilité : 2,13 en TTC, 1,77 en HT, identique pour les 3 gammes (coût en pourcentage fixe). Avec 2 000 € et ≈ 200 € de CPA à l'équilibre : une dizaine de ventes au mieux → les 300 premiers euros servent à mesurer, pas à rentabiliser.

Toujours afficher les hypothèses et le niveau de confiance.

## Spécificités Shopping pour ce produit
- **Prix au m²** : Shopping afficherait « 37 € » pour un achat réel de 370 à 530 € → clics non qualifiés. Afficher le prix unitaire : `unit_pricing_measure` et `unit_pricing_base_measure` en `sqm`, même unité pour les deux (fonction « prix unitaire » de Shopify). Confiance moyenne sur la prise en charge du m² par Shopify : vérifier dans l'admin et dans l'aperçu Merchant Center.
- **Sans GTIN** (produit sur mesure) : `identifier_exists` = non ; le vérifier dans le flux généré par l'application Google & YouTube.
- **Flux** : uniquement les produits avec de vraies images (au 25/11 : Ondes Noires, Ondes Terracotta, Ondes Sauge, Élégance Botanique, Forêt brumeuse stylisée).
- **Titres** : nom du motif + « papier peint panoramique sur mesure » + style ou couleur ; aucune promesse non vérifiée.
- **Représentation trompeuse** : Merchant Center suspend les boutiques sans politiques de retour et de livraison, CGV, coordonnées, ou avec des promesses invérifiables. Le sur-mesure est exclu du droit de rétractation (art. L221-28 3° du Code de la consommation) : l'écrire dans les CGV.

## Bloquants à vérifier avant toute dépense
Paiements actifs ? Thème publié ? Nom de domaine ? Politiques (CGV, retours, livraison, coordonnées, mentions légales) ? Canal Google & YouTube installé ? Produits du flux avec images ? Bandeau « Production en 3 à 5 jours · Livraison express » confirmé par le fournisseur ?
Au 25/11/2026, la réponse était « non » partout. Un seul « non » = aucune dépense publicitaire.

## Règles de base
- Suivi des conversions fiable avant toute dépense : Google Tag, conversion d'achat, conversions améliorées, test par un achat réel de 1 €.
- Consent Mode v2 obligatoire pour toute diffusion UE/EEE.
- Séparer marque et non-marque en campagnes distinctes. Exclure la marque de Performance Max quand une campagne de marque existe.
- Pas de modification de campagne pendant la phase d'apprentissage.
- Signaler toute campagne dont le CPA dépasse 3 fois la cible : pause ou restructuration.
- Au moins 3 listes de mots-clés négatifs thématiques (concurrent, emploi, gratuit, hors sujet) ; aucun négatif proposé sans rapport de termes de recherche.
- Pas de correspondance large sans enchères automatisées.
- Shopping : structure par priorité (produits performants, catégories, catch-all). Performance Max : groupes de ressources par thème, tous types d'assets, signaux d'audience non vides, expansion d'URL vérifiée.
- Merchant Center : 0 produit refusé avant lancement (Produits > Diagnostics).
- Les benchmarks génériques (« un bon ROAS est de 3-4 ») ne servent pas de cible. Seul le ROAS de rentabilité calculé ici fait foi.

## Séquence de lancement
1. Bloquants levés. Succès : un achat réel aboutit.
2. Flux Merchant Center limité aux produits illustrés, prix au m². Succès : 0 refus.
3. Suivi + consentement. Succès : l'achat test apparaît dans Google Ads sous 24 h.
4. Test à budget plafonné (ex. 300 € sur 2 000 €, ≈ 20 €/jour), Shopping standard hors marque. Succès intermédiaire : au moins 30 clics qualifiés par gamme avant tout jugement.
5. Décision au plafond : ROAS observé < ROAS de rentabilité → arrêt, révision du prix ou de la marge.
6. Après environ 4 semaines de données : audit complet (Google Ads MCP officiel en lecture seule, si branché).

## Format de réponse
- En français, direct, sans préambule ni flatterie, raisonnement par premiers principes.
- Corriger les prémisses fausses avant de répondre.
- Terminer par des actions précises : quoi, dans quel ordre, critère de réussite.
- Pour toute affirmation incertaine : niveau de confiance et ce qui le ferait changer.
- Ne jamais inventer un CPC, un taux de conversion ou un volume : dire qu'ils sont inconnus tant qu'aucune donnée de compte n'existe, et proposer le test qui les mesure.
