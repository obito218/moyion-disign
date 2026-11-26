# MURELLE — Guide de pose et trois gammes : compte rendu

Date : 20 novembre 2026

## Où vit le projet

- **Site** : thème Shopify « Horizon » (thème principal) de la boutique Murelle. Le dépôt GitHub ne contenait qu'un README.
- **Notice de pose** : canvas claude.ai « Notice de pose Murelle » (https://claude.ai/artifact/FDLLrSwgupcif3rpFoimS7).
- Ce dossier garde une copie de la notice (source v2, original v1, script de génération).

## 1. Notice de pose (publiée, version 3 du canvas)

Conservé sans changement : le titre, les 8 étapes et **tous leurs textes techniques**, les illustrations des étapes 1 et 3 à 8, les personnages (mêmes proportions partout), les 10 pictos du matériel, les trois cartes finales.

Modifié :
- Identité alignée sur le site : Newsreader (titres), Work Sans (texte), IBM Plex Mono (libellés), palette du thème (#343C32, #F4EFE5, #FAF7F1, #DCCFBA, #A0B292).
- Lisibilité : texte courant de 17 à 18–19 px, consignes d'étape de 19 à 19–21 px, titres d'étape de 36 à 30–42 px, numéros d'étape en vert forêt (ils étaient en sauge, contraste insuffisant). Tailles fluides (clamp) pour mobile.
- Ouverture : schéma pleine largeur, numéros plus grands, repère « Lé n°1 : commencez ici », flèche du sens de pose, légende HTML lisible sur mobile, trois règles d'or mises en avant.
- **Correction factuelle** : l'ancien schéma montrait 7 lés « d'environ 51 cm » sur 3,60 m. Le configurateur calcule des lés de 50 cm avec 10 cm de marge : 3,60 m donne 8 lés. Le nouvel exemple (340 cm → 7 lés de 50 cm) est cohérent avec le calcul du site.
- Nouvelle section « Avant de commencer » : 4 pictogrammes (lés présents, numérotation, motif conforme, espace et matériel prêts).
- Étape 2 redessinée : les lés étalés au sol dans l'ordre, contrôle du raccord à la loupe, colis ouvert (l'ancien dessin montrait des lés déjà au mur).
- Étape 4 : l'étiquette « colle intissé » du sac est retirée du dessin (non confirmé pour la Soie HP Latex). Le texte de l'étape reste inchangé.
- Tableau « Selon votre gamme » (colle, méthode, séchage, entretien par gamme) rempli de **[À CONFIRMER]** : rien n'est inventé.
- Cartes finales : filet vert forêt, picto, « Besoin d'aide » avec lien discret vers la page contact.
- Séparateurs « trois lés », styles d'impression (A4, pas de coupure dans une étape, couleurs conservées).

## 2. Trois gammes dans le thème Shopify (enregistré, **non publié**)

Principe : les variantes Shopify restent **Intissé UV / Intissé HP Latex / Soie HP Latex** (aucun produit ni variante créé). Le thème les affiche sous leur nom de gamme.

| Gamme | Matière Shopify | Prix actuel de la variante | Prix proposé |
|---|---|---|---|
| Essentielle | Intissé UV | 37 €/m² | 39 €/m² |
| Signature (recommandée) | Intissé HP Latex | 45 €/m² | 49 €/m² |
| Prestige | Soie HP Latex | 53 €/m² | 59 €/m² |

Fichiers :
- `config/settings_schema.json` : groupe « Gammes MURELLE » (nom, matière liée, finition, texte, gamme recommandée, badge, bouton, phrase d'aide, nom de la propriété panier). Tout est modifiable dans l'éditeur de thème.
- `snippets/murelle-gamme.liquid` : correspondance matière → gamme (source unique).
- `snippets/murelle-gamme-picker.liquid`, `snippets/murelle-gamme-card.liquid` : les cartes. Les boutons radio portent les mêmes attributs que le sélecteur Horizon, donc changement de variante, prix et panier passent par le mécanisme existant.
- `snippets/variant-main-picker.liquid`, `blocks/variant-picker.liquid`, `templates/product.json` : nouveau style « Cartes de gammes MURELLE », activé sur la fiche produit.
- `blocks/murelle-configurator.liquid`, `assets/murelle-configurator.js` : propriété de ligne `Gamme`, ligne « Gamme » dans le récapitulatif, total « Pour votre mur » sur chaque carte. Calcul des lés, marges, surface facturée et quantité : inchangés.
- `snippets/cart-products.liquid` : le panier affiche « Signature · Intissé HP Latex » (la propriété Gamme n'y est pas répétée).
- `sections/murelle-materials.liquid`, `sections/murelle-estimate.liquid`, `templates/index.json` : accueil aligné (gammes, recommandation, FAQ).
- `assets/murelle.css`, `DESIGN.md` : styles des cartes et contrat de design.

Ce que reçoit la commande : variante = matière technique (production), propriété `Gamme` = nom commercial, plus Largeur, Hauteur, Nombre de lés, Surface imprimée facturée comme avant.

## Vérifications faites

- Fiche produit, bureau et mobile, gamme Essentielle puis Signature (rendu serveur `?variant=`) : prix, badge, bouton, ligne Gamme, totaux corrects (10 m² : 370 / 450 / 530 €).
- Accueil : sections Gammes, Estimateur, FAQ.
- JS du configurateur exécuté en navigateur sur un DOM de test : la propriété Gamme suit la variante, la quantité reste 10 m², les totaux se vident si la dimension est invalide.
- JSON et schémas validés (`jq`).
- Notice : rendu 1280 px et 390 px, sans débordement horizontal, export PDF A4 de contrôle.

## Non vérifié

- Clic réel sur une carte puis ajout au panier sur la boutique : impossible avant publication. À tester juste après.
- Rendu des cartes dans l'éditeur Canvas de la notice et son export PDF natif.

## À valider avant la mise en ligne

1. Publier le thème (rien n'est visible des clients avant).
2. Prix : décider 39 / 49 / 59 puis modifier les 63 variantes (21 produits × 3). Le prix facturé est celui de la variante : le thème ne peut pas afficher un autre prix.
3. Fournisseur, par matière : colle, méthode (encollage du mur), séchage (1 à 2 jours), sous-couche (5 h), entretien (chiffon humide), pièces humides. Puis remplir le tableau de la notice.
4. Fournisseur : largeur réelle des lés (50 cm) et numérotation imprimée sur chaque lé.
5. Notice : adresse e-mail du service client ; le domaine murelle.fr n'est pas encore relié (domaine actuel : myshopify).
6. Format des prix : la boutique affiche « €37,00 », le configurateur « 37,00 € ». À harmoniser dans Paramètres > Devises (format « {{amount_with_comma_separator}} € »).
7. Préexistant : aucun produit n'a d'image.

## 3. Hero d'accueil (21 novembre 2026), thème « Horizon – Gammes »

- Photo : fichier Shopify `Salon_elegant_avec_fresque_tropicale_et_mobilier_naturel.png` (1672 × 941, déjà dans Contenu > Fichiers). Original conservé ; le CDN Shopify sert du WebP/AVIF redimensionné (480 à 1672 px) selon l'écran.
- `sections/murelle-hero.liquid` : nouvelle mise en page « cartel » (photo sans voile ni filtre, texte sur un cartel crème accroché au bas de l'image), réglages « Description de la photo », « Cadrage ordinateur » et « Cadrage mobile ». La mise en page d'origine (« overlay ») reste disponible. La mention « Visualisation » s'affiche même sans motif lié.
- `assets/murelle.css` : styles du cartel. Ordinateur : image pleine largeur, hauteur = écran moins l'en-tête (640 px minimum), recadrage vertical à 32 % (garde les palmiers, rogne le plafond et le tapis). Tablette et mobile (< 990 px) : texte sous l'image, image de 340 à 440 px de haut cadrée sur les palmiers centraux.
- `templates/index.json` : titre, sous-titre, bouton « Découvrir nos panoramiques » → `/collections/all` (Tous les motifs), lien « Calculer mon mur » conservé, légende produit retirée (motif non identifié dans le catalogue).
- Vérifié : 1440 × 900, 1920 × 1080, 1280 × 720, 1024 × 768, 390 × 844 ; bouton visible sans défiler partout, aucun débordement horizontal, image avec dimensions explicites et chargement prioritaire.
- Limite : la photo fait 1672 px de large ; sur écran Retina large, elle est agrandie (légère perte de netteté). Fournir l'original en 2800 px ou plus si disponible.

## 4. Hero immersif inspiré d'ENSŌ (21 novembre 2026), thème « Horizon – Gammes »

- Même photo (Fichiers Shopify, contenu intact, aucun filtre de couleur ; CDN WebP/AVIF, chargement prioritaire).
- `sections/murelle-hero.liquid` : 3ᵉ mise en page « immersive » (les mises en page « overlay » et « cartel » restent disponibles). Nouveaux réglages : surtitre, titre avec italique, bloc discret (titre + texte), libellé de défilement. Ancre vers la section suivante.
- `sections/header-group.json` : en-tête transparent natif d'Horizon activé sur l'accueil (palette « default » : texte vert forêt). Menu, recherche, compte, panier et menu mobile inchangés ; l'en-tête redevient opaque au défilement.
- `assets/murelle.css` : barre de verre (crème 55 %, flou 16 px, bordure crème, coins 10 px), dégradé vert forêt localisé à gauche + léger fondu bas sur le mobilier, typographie, boutons (vert forêt / transparent bordé), bloc discret à filet terracotta, indicateur de défilement animé, apparitions progressives (coupées si « réduire les animations »). Mobile/tablette (< 990 px) : photo en haut, texte sur panneau vert forêt, bouton principal crème, boutons pleine largeur.
- `templates/index.json` : textes du hero ; « Découvrir nos panoramiques » → /collections/all ; « Explorer notre univers » et l'indicateur → section « Quatre univers » (ancre).
- Contraste mesuré (crème sur fond réel, 1280 à 1920 px) : titre ≥ 3:1 sur 95 % de son fond, sous-titre ≥ 4:1 sur 95 % (médiane 8:1).
- Compromis : le dégradé assombrit le tiers gauche de la photo (fenêtre, plante, phare du panoramique). Le centre et la droite du papier peint restent intacts.

## 5. Visuels des univers et bannières de collection (21 novembre 2026)

- Thème « Horizon – Gammes » : `sections/murelle-collection-hero.liquid` (nouvelle « Bannière collection » : image de la collection, titre, accroche, nombre de motifs, bouton vers la grille, description dessous ; en-tête texte si pas d'image), `templates/collection.json` (bannière avant la grille `main-collection`, inchangée), `sections/murelle-wall.liquid` (texte alternatif + cadrage par point focal), `assets/murelle.css`.
- Données Shopify : champ de collection « Accroche » (`custom.accroche`) rempli pour les 4 univers ; image de la collection « Forêt et sous-bois » = `Chambre_sereine_au_coeur_de_la_foret.png` (Fichiers) avec texte alternatif.
- Vérifié : bannière forêt (ordinateur, mobile), carte « Forêt et sous-bois » de l'accueil, 4 produits visibles.
- En attente : les visuels Tropical et jungle, Chambre enfant et bébé, Design et inspiration (non fournis) ; publication du thème.

## 6. Six visuels « Forêt brumeuse stylisée » (22 novembre 2026)

- Originaux (non modifiés, 763 × 334-337 px) : `murelle/visuels/MURELLE_01…06.jpg` dans ce dépôt, importés dans Shopify > Contenu > Fichiers sous les mêmes noms, avec textes alternatifs.
- Fiche produit « Forêt brumeuse stylisée » : 7 médias dans l'ordre Chambre_sereine (1672 px, grande image) · 06 détail panoramique · 05 détail chambre · 03 salon · 04 salle à manger · 02 chambre angle · 01 chambre face. `templates/product.json` : galerie avec grande première image (1 grande + 3 rangées de 2 ; carrousel sur mobile).
- Accueil, section « Inspirations » (`sections/murelle-gallery.liquid` : option « Format d'origine », `assets/murelle.css`, `templates/index.json`) : 03 salon, 04 salle à manger, 02 chambre angle, 06 détail, liés à la fiche produit, mention « Visualisation ».
- Limite : 763 px de large, image légèrement agrandie dans les grandes cases (≈ 790 px) et floue sur écran Retina. Remplacer par des versions ≥ 1600 px dès que possible (même nom de fichier dans Shopify > Fichiers > Remplacer).

## 7. Identité visuelle 2026 (22 novembre 2026)

- Logo : découpé tel quel dans la planche officielle (version horizontale), fond pêche rendu transparent, aucun redessin. Fichiers : `murelle/identite/MURELLE_logo_horizontal.png` (dépôt) et Shopify > Contenu > Fichiers > MURELLE_logo_horizontal.png. Réglages du thème > Logo : 50 px ordinateur, 34 px mobile (`config/settings_data.json`).
- Polices (`config/settings_data.json`) : titres Playfair Display 400 ; texte, sous-titres et petits libellés Montserrat 400/500. Bibliothèque de polices Shopify (pas de chargement externe).
- Hero (`sections/murelle-hero.liquid` : réglage « Couleur du texte » ; `assets/murelle.css` ; `templates/index.json`) : titre « L’art de transformer vos murs. » en vert forêt #343C32 sur voile crème à gauche ; surtitre, sous-titre, boutons, bloc discret et indicateur passés en vert forêt ; textes inchangés.
- Vérifié : accueil et fiche produit (gammes, configurateur, galerie) sur ordinateur et mobile.

## 8. Réassurance du panier (22 novembre 2026)

- `snippets/murelle-cart-reassurance.liquid` (nouveau), rendu à la fin de `snippets/cart-summary.liquid`, donc sous « Payer » et les paiements express, dans le panier latéral et sur la page panier. Calcul, remises, note et paiement inchangés.
- Réglages du thème > « Réassurance panier » (`config/settings_schema.json`) : activation, 4 éléments (icône, titre, texte). Par défaut : Paiement sécurisé / Imprimé à vos dimensions / Production en 3 à 5 jours / Livraison express (engagements déjà affichés sur le site).
- `assets/murelle.css` : grille 2 × 2, Montserrat, filet sable, icônes au trait vert forêt. Hauteur mesurée : 124 px (panier latéral), 156 px (mobile 360 px).
- Non vérifié sur la boutique : panier latéral ouvert avec un article (l'outil de capture ne l'ouvre pas) ; vérifié sur reproduction du balisage et page panier sans erreur.

## 9. Logos de paiement (22 novembre 2026)

- Constat : `shop.enabled_payment_types` est vide (aucun moyen de paiement activé dans Paramètres > Paiements) et l'API ne remonte aucun portefeuille (Apple Pay, Google Pay). Aucun logo n'est donc affiché pour l'instant.
- `snippets/murelle-payment-icons.liquid` (nouveau), rendu sous « Payer » (avant la réassurance) dans `snippets/cart-summary.liquid` : logos officiels Shopify (`payment_type_svg_tag`), filtrés sur les moyens réellement activés, dans l'ordre Visa, Mastercard, PayPal, Apple Pay. Apparition automatique dès l'activation.
- Réglages du thème > Réassurance panier : affichage oui/non, liste et ordre des moyens, libellé accessible. `assets/murelle.css` : rangée centrée, 22 px (24 px mobile), écart 8 px.
- Rendu des quatre logos vérifié sur une page de test temporaire (retirée), ordinateur et largeur 360 px.

## 10. Élégance Botanique (24 novembre 2026)

- Nouveau produit (demande confirmée) : « Élégance Botanique », `/products/elegance-botanique`, en ligne, créé par duplication du produit modèle (Matière : Intissé UV 37 €, Intissé HP Latex 45 €, Soie HP Latex 53 € le m²), collections Forêt et sous-bois et Page d'accueil, étiquette `foret`. Pas d'étiquette `ref:` fournisseur (référence non fournie).
- Médias : 1) `a_serene_modern_neutral_toned_living_room_interi.webp` (version reçue dans la conversation, 1254 × 1254 ; copie dans `murelle/visuels/elegance-botanique/`) ; 2) `Salon_contemporain_avec_mural_arbore.png` (PNG d'origine téléversé, 1254 × 1254). Textes alternatifs « Visualisation : … ».
- `assets/murelle.css` : galerie « grande première image » sans case vide (2 médias côte à côte ; nombre pair ≥ 4 : dernier en pleine largeur). Forêt brumeuse (7 médias) inchangée.
- Vérifié : fiche (ordinateur, mobile), carte dans la collection (5 motifs), fiche Forêt brumeuse.

## 11. Ondes Noires (25 novembre 2026)

- Nouveau produit « Ondes Noires », `/products/ondes-noires`, en ligne, créé par duplication du produit modèle (mêmes matières, prix 37/45/53 €, même configurateur), collection « Design et inspiration » uniquement (retiré de « Page d'accueil » héritée du modèle), étiquette `design`. Pas d'étiquette `ref:` fournisseur (non fournie).
- Médias dans l'ordre : MURELLE_01_salon.png (principale), MURELLE_02_salle_a_manger.png, MURELLE_04_vue_large.png (renommé par Shopify avec un suffixe), MURELLE_05_console.png, MURELLE_06_dimensions.webp. Images reçues dans la conversation, non modifiées, copiées dans `murelle/visuels/ondes-noires/`. Textes alternatifs « Visualisation : … ».
- Aucun fichier du thème modifié.
- Limite : mises en situation de 507 × 508 px (agrandies dans la grande image de la fiche, floues sur écran Retina).
- Vérifié sur le thème « Horizon – Gammes » : carte en tête de la grille « Design et inspiration » (ordinateur et mobile, 6 motifs) ; fiche avec 1 grande image puis 2 rangées de 2 sur ordinateur, carrousel à 5 points sur mobile ; configurateur 320 × 250 cm → 7 lés, 10 m², 370 / 450 / 530 € ; les 3 variantes sont vendables.
- Sur ordinateur, la grande image s'affiche à sa taille native (≈ 507 px), centrée avec du vide de part et d'autre : Horizon n'agrandit pas une image plus petite que sa case. Correctif : fournir des fichiers d'au moins 2000 px de large.
- Non testé par clic : l'ajout au panier (l'outil de capture ne peut ni cliquer ni suivre /cart/add). Même modèle de page et mêmes blocs que les autres fiches.
- 25 novembre, mise à jour : image principale remplacée à la demande par `MURELLE_01_salon.webp` (1536 × 1024, même scène de salon, nouvelle version), placée en position 1 et définie comme image principale ; l'ancienne `MURELLE_01_salon.png` (507 × 508) est retirée de la fiche mais conservée dans Contenu → Fichiers. Les 4 autres images et leur ordre sont inchangés.
- 25 novembre, 2ᵉ mise à jour : galerie remplacée par le nouveau lot. Ordre final : salon (`MURELLE_01_salon.webp`), console (`MURELLE_05_console.webp`, 1122 × 1402), séjour (`MURELLE_04_sejour.webp`, 1536 × 1024), dimensions 4 m × 2,7 m (`MURELLE_06_dimensions_mur.webp`, 1536 × 1024), motif à plat (`MURELLE_06_dimensions.webp`, inchangé : le fichier reçu est identique). Salle à manger, vue large et ancienne console retirées de la fiche, conservées dans Contenu → Fichiers.
- Effet constaté : sur mobile, le carrousel prend la hauteur de l'image la plus haute (console, en portrait), d'où des bandes crème au-dessus et au-dessous des images paysage. Non corrigé : il faudrait toucher au réglage de la galerie du thème.

## 12. « Choisissez votre motif » : familles de motifs (25 novembre 2026)

- Analyse préalable : un seul modèle produit pour les 23 produits ; configurateur lisant `?largeur=` / `?hauteur=` ; prix au m² par variante (option « Matière », identique sur tous les produits) ; panier = vraie variante + quantité en m² + propriétés ; forfait Basic, donc pas de « listes combinées » Shopify (réservées à Plus) ; aucune donnée de famille existante.
- Choix validés : vraie page avec préchargement (pas de remplacement sans rechargement) ; famille « Ondes Noires » créée avec Ondes Noires seul ; miniature = motif à plat ; bloc sous le prix, avant la gamme.
- Créé dans Shopify : métaobjet « Famille de motifs » (`famille_motifs`, accès vitrine en lecture), métachamp produit « Miniature du motif » (`murelle.miniature_motif`, image), entrée « Ondes Noires », miniature d'Ondes Noires = `MURELLE_06_dimensions.webp` (motif à plat déjà en ligne).
- Thème « Horizon – Gammes » : nouveau bloc `blocks/murelle-motifs.liquid`, script `assets/murelle-motifs.js`, styles ajoutés en fin de `assets/murelle.css`, bloc inséré dans `templates/product.json` entre le séparateur et « Choisissez votre gamme ». Configurateur, prix, panier, header, footer, Hero, collections et réglages globaux non modifiés. La transition de page envisagée a été retirée : le thème a son propre système, désactivé dans ses réglages globaux.
- Tests : famille temporaire (Ondes Noires, Élégance Botanique, Forêt brumeuse stylisée) → rendu ordinateur et mobile vérifié ; fiche cible ouverte avec `?variant=` (Signature) + 400 × 270 → Signature sélectionnée, 9 lés, 13 m², 585 € ; Plumes dorées (sans famille) inchangée ; script testé dans Chromium (13 vérifications sur 13 : nom au survol, préchargement, reprise gamme + dimensions, dimension invalide ignorée, clic sur le motif courant sans effet, sélection immédiate, aucune erreur). Famille temporaire supprimée ensuite ; avec un seul motif, le bloc est masqué sur Ondes Noires.
- Mode d'emploi : `murelle/familles-de-motifs.md`.
- Démo à la demande (« je ne le vois pas ») : Élégance Botanique et Forêt brumeuse stylisée ajoutées temporairement à la famille « Ondes Noires » pour rendre le bloc visible dans l'aperçu. À retirer avant de publier le thème (Contenu → Métaobjets → Famille de motifs → Ondes Noires).
- Famille « Ondes Noires » complétée (même direction artistique) : produits « Ondes Terracotta » (`/products/ondes-terracotta`) et « Ondes Sauge » (`/products/ondes-sauge`) créés par duplication du produit modèle (prix 37 / 45 / 53 €, même configurateur), collection « Design et inspiration » (retirés de « Page d'accueil », héritée du modèle), étiquette `design`, une image chacun (motif à plat 780 × 480 reçu dans la conversation, non modifié), miniature = cette image. Famille = Ondes Noires, Ondes Terracotta, Ondes Sauge ; démo (Élégance Botanique, Forêt brumeuse) retirée. Vérifié : sélecteur à 3 ondes sur ordinateur et mobile ; Ondes Terracotta ouverte avec Signature + 400 × 270 → 585 € ; grille Design à 8 motifs. Pas de référence fournisseur ni de mise en situation pour les deux nouvelles ondes.
- Élégance Botanique : 3ᵉ image ajoutée en fin de carrousel (`MURELLE_elegance_botanique_03_salon.webp`, 780 × 790, même scène gravée que les deux autres visuels, reçue dans la conversation, non modifiée). Ordre : salon arche (principale), salon lumineux, salon sépia. Vérifié : grande image + 2 côte à côte sur ordinateur, carrousel à 3 points sur mobile.

## 13. Compétences MURELLE (25 novembre 2026)
- Recherche documentée dans `murelle/RECHERCHE-SKILLS.md`.
- Créées : skills de projet `murelle-catalogue` et `murelle-visuels` (dossier `.claude/skills/`), chargées automatiquement par Claude Code sur ce dépôt. Testées (contrôle qualité sur les vrais visuels ; incrustation sur scène synthétique : 4/4).
- Mise à jour préparée : `google-ads-papier-peint` (prix 37/45/53, tableau de rentabilité, prix au m² dans Shopping, bloquants) — à téléverser sur le compte.
- Aucune modification du site Shopify dans cette mission.

## 14. Jardin d'Antan (25 novembre 2026)
- Nouveau produit « Jardin d'Antan » (`/products/jardin-dantan`), en ligne, collection « Forêt et sous-bois » uniquement (retiré de « Page d'accueil », héritée du modèle), étiquette `foret`, prix 37 / 45 / 53 €, configurateur et panier d'origine. Pas de référence fournisseur (non communiquée). Produit distinct de « Grands arbres, sépia » (non modifié).
- 5 images, dans l'ordre : salon (principale), séjour, vue rapprochée console, mur coté 4 m × 2,7 m, gravure à plat (fichier reçu, intact, aussi miniature `murelle.miniature_motif`).
- Images 1 à 4 créées à la demande de l'utilisateur, par incrustation fidèle de la gravure (skill `murelle-visuels`) sur les photos de pièces déjà utilisées pour Ondes Noires : motif seulement mis à l'échelle uniformément et projeté (fidélité 0,999–1,000), marge blanche du scan retirée de la copie de travail uniquement, objets devant le mur protégés par masques vérifiés au zoom.
- Limites : gravure source de 780 px → agrandie ×1,5 à ×1,7 sur le mur (légère douceur) ; vue rapprochée en 900 × 600 ; gravure à plat légèrement plus haute (1,37:1) que les autres (1,5:1) → petites bandes possibles dans le carrousel mobile.
- Vérifié : 5 médias dans l'ordre, image principale = salon ; fiche ordinateur (grande image + grille 2 × 2) et mobile (carrousel) ; Signature + 400 × 270 → 9 lés, 13 m², 585 € ; grille « Forêt et sous-bois » (6 motifs, Jardin d'Antan en tête). Ajout au panier non cliqué (outil sans clic).
- **Supprimé à la demande de l'utilisateur (« ce n'est pas à mon goût »)** : produit « Jardin d'Antan » et ses 5 fichiers Shopify supprimés (`productDelete`, `fileDelete`), images retirées du dépôt (elles restent dans l'historique Git). Collection « Forêt et sous-bois » revenue à 5 motifs. Les améliorations génériques de la skill `murelle-visuels` (option `--adoucir`, alerte de proportions, retours d'expérience) sont conservées.

## 15. Ondes Terracotta : 4 mises en situation (25 novembre 2026)
- Contrôle préalable : les 4 images montrent des vagues terracotta sur fond crème ; les deux fichiers nommés « Ondes_Sauge_Chambre » et « Ondes_Sauge_Entree » ne contiennent aucun vert sauge (couleur dominante orange-terracotta) : ils correspondent à Ondes Terracotta, pas à Ondes Sauge. Nommés `MURELLE_ondes_terracotta_04_chambre.webp` et `_05_entree.webp` dans Shopify et le dépôt ; contenu identique (sommes MD5 vérifiées).
- Galerie (5 images) : motif à plat (principale, inchangée), salon, salle à manger, chambre, entrée. Textes alternatifs ajoutés. Aucun autre élément modifié (prix, variantes, collection, thème).
- Réserves : images générées (le motif des pièces n'est pas exactement celui du fichier à plat) ; chambre et entrée d'un orange plus vif que le motif ; salon et salle à manger en 765 px ; formats mélangés (1,62 / 1,31 / 1,50 / 1,16) → bandes possibles dans le carrousel mobile.
- Ordre modifié à la demande : entrée en image principale, puis motif à plat, salon, salle à manger, chambre. Vérifié (Shopify, ordinateur, mobile).
- Collection « Design et inspiration » : image de collection = hall d'entrée Ondes Terracotta (bannière en haut de la page, comme « Forêt et sous-bois ») ; elle sert aussi de visuel à la carte Design de la section « Quatre univers » de l'accueil (image de la collection, sinon premier produit). Ordre des produits inchangé.

## 16. Section « Le sur-mesure » : estimateur fonctionnel (25 novembre 2026)
- Fichiers du thème « Horizon – Gammes » modifiés : `sections/murelle-estimate.liquid` (balisage, réglages), `assets/murelle-estimate.js` (réécrit), `assets/murelle.css` (4 anciennes règles du panneau remplacées par le bloc « Estimateur Le sur-mesure : panneau de calcul » en fin de fichier ; aucune autre règle touchée), `assets/murelle-configurator.js` (ajout : lecture/écriture des dimensions mémorisées pour la session ; calcul inchangé), `templates/index.json` (réglages de cette section seulement : produit de référence Ondes Noires, textes de réassurance).
- Règles de calcul reprises du code existant (identiques au configurateur des fiches) : lé 50 cm, marge de coupe 10 cm en largeur et en hauteur, lés = ⌈(L + 10) / 50⌉, surface imprimée = lés × 0,5 × (H + 10)/100, surface facturée = max(1, surface imprimée arrondie au m² supérieur) [règle remplacée le 26/11, voir section 18], prix = surface facturée × prix au m² de la variante (37 / 45 / 53 € lus dans Shopify). Limites 50–2 000 cm (largeur), 50–500 cm (hauteur). Ces valeurs sont désormais des réglages de la section, à faire confirmer par le fournisseur.
- Bouton : vérifie, mémorise (sessionStorage `murelle:dimensions`), ouvre « Tous les motifs » avec `?largeur=&hauteur=` ; toute fiche ouverte ensuite reprend les dimensions ; une adresse avec paramètres reste prioritaire.
- Tests (Chromium, vrai script, réplique du balisage) : 27/27 — 320×250, 100×100, 400×300, vides, négatif, zéro, lettres, décimale, hors limites, bouton invalide/valide, mémorisation, reprise sur fiche, priorité de l'adresse, réinsertion (éditeur), 390 / 768 / 1280 px sans débordement. Vérifié sur Shopify : rendu ordinateur et mobile ; fiche Ondes Noires 400×300 = 518 / 630 / 742 €, identique à l'estimateur. Copies et tests dans `murelle/theme/`.
- Reste signalé : l'étape 3 de la section mentionne toujours « 3 à 5 jours… livraison express » (texte existant, délai non confirmé) ; « Tous les motifs » contient encore les produits sans image.

## 17. Corrections « Le sur-mesure » et promesses (26 novembre 2026)
Décisions de l'utilisateur (QCM) : retirer le délai partout ; garder le calcul et l'expliquer ; masquer la matière technique ; panneau compact et prix lisibles.
- **Délai « 3 à 5 jours / livraison express » retiré partout** : bandeau du haut (« Imprimé à la commande, à vos dimensions »), étape 03 de « Le sur-mesure », FAQ « Quels sont les délais ? » (renvoi vers la page contact), bandeau de réassurance de l'accueil (« Prix calculé avant commande », « Une question ? »), réassurance du panier (valeurs par défaut des réglages), valeurs par défaut des sections FAQ et Hero, descriptions des 25 produits (Admin API, modèle compris). Vérification : plus aucune occurrence dans le thème.
- **Calcul expliqué** : la surface facturée s'affiche avec « Mur de X m² · N lés » ; le détail (4 lignes) et l'explication « lés entiers + marge de coupe + arrondi » sont dans un volet « Pourquoi cette surface ? Voir le détail ». Calcul et prix inchangés.
- **Matières techniques masquées** : réglage `gamme_show_material` à faux par défaut ; cartes de gamme, section « Trois gammes », estimateur, panier et FAQ affichent la finition. Les variantes Shopify gardent leur nom (paiement et commandes inchangés : la matière y reste visible).
- **Affichage** : panneau ~300 px plus court (784 px pour 200 × 300 cm sur un portable 1280 × 800, bouton visible sous les champs), prix en chiffres alignés.
- Tests : 27/27 sur la réplique ; captures Shopify accueil (ordinateur, mobile) et fiche Ondes Noires (200 × 300 = 296 / 360 / 424 €, identique à l'estimateur).
- Fournisseur : l'utilisateur passe d'un fournisseur (Sungpu) à AliExpress ; délais, largeur des lés et matières à confirmer avec la nouvelle source.

## 18. Nouvelle règle de facturation (26 novembre 2026)
Demande de l'utilisateur : facturer seulement la surface du mur arrondie au m² supérieur (6,5 m² → 7 m² ; 6 m² → 6 m²), sans lés entiers ni marge de coupe.
- **Règle appliquée partout** : surface facturée = max(1 m², ⌈largeur × hauteur / 10 000⌉) ; prix = surface facturée × prix au m² de la gamme. Configurateur des fiches (`assets/murelle-configurator.js`) et estimateur de l'accueil (`assets/murelle-estimate.js`) identiques.
- Le nombre de lés reste affiché sur les fiches et envoyé dans la commande, à titre d'information de production (calculé avec lé 50 cm et marge 10 cm, non facturés).
- Textes mis à jour : libellé « Surface facturée » (au lieu de « Surface imprimée facturée », aussi dans les propriétés de commande), note des fiches « La surface de votre mur est arrondie au m² supérieur. », estimateur « Surface facturée · Mur de X m², arrondi au m² supérieur » (volet de détail supprimé), FAQ « Comment mesurer », étape 02 et section « Trois gammes » (« prix calculé au m² de votre mur »), valeurs par défaut des sections.
- Tests : 29/29 sur la réplique (dont 260×250 → 7 m², 301×200 → 7 m², 200×300 → 6 m²) ; fiche Ondes Noires sur Shopify 260×250 → mur 6,5 m², facturé 7 m², 259 / 315 / 371 €.
- Effet commercial : pour 200 × 300 cm, 6 m² facturés au lieu de 8 (−25 % de chiffre d'affaires sur cet exemple) ; la marge de coupe et la chute des lés sont désormais à la charge de MURELLE.
