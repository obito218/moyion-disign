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

## 19. Trois gammes : Essentielle, Signature, Adhésive (26 novembre 2026)
Demande de l'utilisateur : plus aucun nom technique (HP, Intissé, Latex…) ; trois gammes de prix : le prix le plus bas, le prix recommandé (« Notre recommandation »), l'adhésif (« Pose facile »). Décisions (QCM) : 3ᵉ gamme nommée « Adhésive », prix gardé à 53 €/m², variantes renommées partout, nombre de lés masqué au client.
- **Produits (Admin API, `productOptionUpdate`, 25 produits dont le modèle)** : option « Matière » → « Gamme » ; valeurs Intissé UV → Essentielle (37 €), Intissé HP Latex → Signature (45 €), Soie HP Latex → Adhésive (53 €). Mêmes variantes (identifiants inchangés), prix vérifiés après coup sur les 25 produits. Le paiement, les e-mails et les commandes affichent désormais le nom de la gamme.
- **Thème « Horizon – Gammes » (version bf2a2e1)** : réglages « Gammes MURELLE » reliés aux nouvelles valeurs ; gamme 3 = Adhésive, « Dos adhésif, sans colle », « Pas de colle à préparer : retirez la protection au dos, posez, lissez. » ; nouveau réglage « Badge de la gamme » (gamme 3 : « Pose facile »), affiché sur la carte de gamme, dans l'estimateur et dans la section « Trois gammes, un même motif » (ancien titre « Trois gammes, trois finitions »). « Notre recommandation » reste sur Signature. Habillage « Prestige » (double bordure, reflet) et barres de finition retirés de la gamme 3.
- **Lés masqués** : ligne « Nombre de lés » retirée de la fiche ; propriétés « _Nombre de lés » et « _Gamme » privées (préfixe « _ ») : invisibles au client (fiche, panier, paiement), visibles dans la commande dans l'admin. Le schéma du mur sur la fiche garde ses pointillés de découpe.
- **Textes** : étape 02 (« Essentielle, Signature ou Adhésive »), FAQ « Quelles gammes proposez-vous ? », fiches de la section Gammes, valeurs par défaut (FAQ, section Gammes). Vérification : plus aucune occurrence d'Intissé, Latex, Soie, Prestige ou « satinée » dans le thème, les descriptions, le référencement, les collections et les pages.
- Vérifié sur Shopify : fiche Ondes Noires (ordinateur) et Ondes Terracotta (mobile, 260 × 250 → 7 m² → 259 / 315 / 371 €), accueil (estimateur et section Gammes). Copies dans `murelle/theme/` identiques au thème (sommes MD5).
- À confirmer : « Finition mate » (Essentielle) et « Finition intermédiaire » (Signature) viennent de l'ancien fournisseur ; à vérifier avec les produits AliExpress. Le thème actuellement publié « Horizon » lit les mêmes produits : il affiche donc les nouveaux noms de variantes (déduction, non vérifiée en capture) ; les badges n'existent que dans « Horizon – Gammes ».

## 20. Nouveau motif « Brume d'autrefois » (26 novembre 2026)
- Contrôle préalable : aucun produit « Brume d'autrefois » n'existait (25 produits vérifiés ; « Forêt de pins, brume » et « Forêt brumeuse stylisée » sont d'autres motifs, « Élégance Botanique » une autre gravure). Création validée par l'utilisateur (QCM) : collection « Forêt et sous-bois », salon en image principale.
- Produit `gid://shopify/Product/16026595000660`, adresse `/products/brume-dautrefois`, en ligne, copié du modèle : gammes Essentielle / Signature / Adhésive à 37 / 45 / 53 €, description standard, étiquette `foret`. Collection « Forêt et sous-bois » uniquement (retiré de « Page d'accueil », héritée du modèle). Pas de référence fournisseur (non communiquée).
- Galerie (5 images, rattachées à ce seul produit) : salon (principale), hall d'entrée, chambre, salle à manger, gravure à plat. Textes alternatifs descriptifs. Gravure = miniature `murelle.miniature_motif`.
- Nettoyage : salon et salle à manger contenaient en haut 17 lignes parasites (9 lignes d'une autre image + liseré blanc, restes d'un montage) ; seules ces lignes ont été retirées, sans redimensionnement, en WebP sans perte (pixels identiques au reste de la source, vérifié) ; originaux dans `murelle/visuels/brume-dautrefois/originaux/`. Hall, chambre et gravure importés tels quels.
- Vérifié : ordre des médias et image principale (requête), fiche ordinateur (grande image + grille 2 × 2) et mobile (carrousel), configurateur Signature 400 × 270 → mur 10,8 m², facturé 11 m², 495 € ; collection ordinateur et mobile (6 motifs, Brume d'autrefois en tête).
- Limites : images de 760 px de large (gravure 780 px), un peu douces en grand écran ; formats légèrement différents (1,56 / 1,50 / 1,37) → petit décalage de hauteur dans la 2e ligne de la grille et dans le carrousel mobile ; mises en situation générées : teintes plus vert sauge et beige que la gravure à plat (plus bleu-gris et sépia), composition du hall différente de la gravure. Le client recevra la gravure, pas la teinte des mises en situation.
- Skill `murelle-catalogue` mise à jour : nouveaux noms de variantes, contrôle du configurateur selon la règle de facturation actuelle, contrôle des bandes parasites.

## 21. Motifs sans photo archivés (26 novembre 2026)
Demande : retirer tous les papiers peints sans photo. Décisions (QCM) : archiver (réversible) plutôt que supprimer ; garder les collections devenues vides telles quelles ; mettre les motifs avec photos dans « Nos motifs du moment ».
- **19 produits archivés** (statut ARCHIVED : invisibles sur le site, restaurables en un clic dans Produits > Archivés) : Flamants fond noir, Colibris et bananiers, Jungle colorée à palmiers, Bananiers vert clair, Jungle dense toucan, Forêt de pins brume, Sous-bois lumineux, Grands arbres sépia, Système solaire, Dinosaures pastel, Montgolfières roses, Fusée et espace, Ours et écureuils, Baleine et océan, Coup de pinceau rose, Abstrait peinture bleu-vert, Arches terracotta, Montagnes en lignes, Plumes dorées. Aucune suppression, collections d'origine conservées.
- **6 produits en ligne** : Brume d'autrefois, Élégance Botanique, Forêt brumeuse stylisée, Ondes Noires, Ondes Terracotta, Ondes Sauge. Produit « Modèle » gardé en brouillon (sert à créer les nouveaux motifs).
- **Collection « Nos motifs du moment »** (accueil) : ajout des 6 motifs (elle ne contenait que des motifs archivés).
- **Section « Trois gammes » de l'accueil** : produit de référence Jungle colorée à palmiers (archivé) → Ondes Noires (mêmes prix 37 / 45 / 53 €), thème « Horizon – Gammes ».
- **Laissé tel quel, à la demande** : « Tropical et jungle » et « Chambre enfant et bébé » sont désormais vides mais restent dans le menu et dans « Quatre univers » ; un client qui clique voit une page sans motif.
- Remarque d'affichage : dans « Nos motifs du moment », les cartes gardent le format de chaque image (Élégance Botanique est carrée) → hauteurs inégales ; réglable (format d'image des cartes de la section) si l'utilisateur le souhaite.

## 22. Ondes Sauge : 4 mises en situation (26 novembre 2026)
- Produit identifié : « Ondes Sauge » (`/products/ondes-sauge`), nommé par l'utilisateur et confirmé visuellement (mêmes ondulations vert olive sur fond clair que le motif à plat déjà en ligne).
- 4 images importées sans aucune modification (fichiers reçus, sommes MD5 identiques, ni recadrage ni réencodage ; aucune bande parasite détectée) et rattachées à ce seul produit, avec textes alternatifs : hall d'entrée, chambre, salon, salle à manger (760 × 506 px chacune).
- Galerie : hall d'entrée (image principale, comme pour Ondes Terracotta), chambre, salon, salle à manger, puis le motif à plat existant, conservé (dernière position ; reste la miniature du sélecteur « Choisissez votre motif »).
- Aucun code, thème, prix, texte ou autre produit modifié. Seul effet hors fiche : la vignette d'Ondes Sauge dans les collections (Design et inspiration, Nos motifs du moment) montre désormais le hall au lieu du motif à plat.
- Vérifié : ordre et image principale (requête), nombre d'images des autres produits inchangé, fiche ordinateur (grande image + grille 2 × 2) et mobile (carrousel), sélecteur de motif (Ondes Sauge sélectionné), configurateur 300 × 250 → 7,5 m², facturé 8 m², 296 €.
- Limites : 760 px de large (un peu doux en grand écran) ; mises en situation générées : fond plus crème et chaud que le motif à plat (vert très pâle), composition différente du fichier fournisseur ; motif à plat plus allongé (1,63) que les pièces (1,50) → léger écart de hauteur dans la dernière ligne de la grille.

## 23. Nouveau motif « Jardin des Brumes » (26 novembre 2026)
- Aucun produit de ce nom n'existait (vérifié, archivés compris). Créé à la demande (nom donné par l'utilisateur) : `gid://shopify/Product/16027301609812`, adresse `/products/jardin-des-brumes`, en ligne, copié du modèle (gammes Essentielle / Signature / Adhésive à 37 / 45 / 53 €, description standard), étiquette `tropical`, collection « Tropical et jungle » uniquement (confirmée par l'utilisateur ; retiré de « Page d'accueil », héritée du modèle).
- Images : les 4 PNG d'origine de l'utilisateur (`~/Downloads/01-salon.png`, `02-salle-a-manger.png`, `03-chambre-adulte.png`, `04-hall-entree.png` sur son Mac, 766–767 × 510 px) envoyés directement du Mac vers Shopify (téléversement préparé `stagedUploadsCreate`, puis `fileCreate`), sans conversion ni retouche. Rattachés à ce seul produit, textes alternatifs descriptifs. Ordre : salon (principale), salle à manger, chambre, hall d'entrée.
- Motif à plat (5e image du chat) non ajouté à la galerie (consigne « exclusivement les 4 images ») ; copie conservée dans `murelle/visuels/jardin-des-brumes/` avec les copies du chat des 4 images.
- Vérifié : médias et ordre (requête), nombre d'images des autres produits inchangé, fiche ordinateur (grande image, 2 côte à côte, grande image) et mobile (carrousel 4 points), configurateur Signature 400 × 270 → 10,8 m², facturé 11 m², 495 € ; collection « Tropical et jungle » ordinateur et mobile (1 motif).
- Limites : 767 px de large, un peu doux en grand écran ; mises en situation générées (le motif réel est celui du fichier à plat). Défauts existants signalés, non corrigés : bandeau de collection « 1 MOTIFS » (pluriel fixe), collection sans image de bannière.

## 24. Formation « Module 3 » lue (27 novembre 2026)
- Contenu payant de l'utilisateur : transcrit et lu uniquement sur son Mac (outil local, rien publié). Skill privée `methode-google-murelle` et notes conservées sur le Mac (`~/Downloads/MURELLE-transcription/`), **volontairement absentes de ce dépôt public**.
- Actions MURELLE identifiées (détail dans la skill privée) : collection vide, icônes sociales génériques, format de devise « 37,00 € », délais de livraison, pages FAQ et Notre histoire, paiements, e-mail pro, SEO (title/méta, H1, descriptions uniques), images ≥ 1000 px, ordre de lancement Search Console → GMC → Ads.

## 25. Corrections Google (méthode Module 3) — 27 novembre 2026
Décisions de l'utilisateur : collection « Chambre enfant et bébé » laissée visible (signalé : motif de refus GMC tant qu'elle est vide) ; icônes réseaux sociaux supprimées (pas de comptes) ; « Notre histoire » en version factuelle, à valider avant publication.
- **Titres et descriptions Google (SEO)** sur les 7 motifs en ligne et 5 collections (Admin API, champ SEO) : modèle « Papier Peint Panoramique <motif> | MURELLE », descriptions 137–160 caractères, factuelles (« imprimé à la commande aux dimensions de votre mur, dès 37 €/m² »). Invisible pour les visiteurs.
- **Page « Questions fréquentes »** `/pages/faq` créée et publiée (titre et description SEO) : gammes, choix du motif, mesures, calcul du prix, dimensions acceptées, délai (communiqué sur demande, rien d'inventé), frais de livraison (affichés au paiement), retours (exception sur-mesure art. L221-28 + garantie légale de conformité), pose, paiement ; liens vers 3 collections.
- **Page « Notre histoire »** `/pages/notre-histoire` créée **en brouillon** (non publiée), texte factuel à valider.
- **Menu du pied de page** renommé « Informations » : FAQ, Contact, Rechercher ; affiché dans le pied de page du thème « Horizon – Gammes » (nouveau bloc menu, intertitre discret).
- **Icônes réseaux sociaux** génériques (facebook.com, instagram.com, youtube.com, tiktok.com, x.com) retirées du pied de page (thème « Horizon – Gammes »).
- Non faisable par les outils (à faire par l'utilisateur) : format de devise « 37,00 € » (Paramètres > Général) et titre / méta-description de l'accueil (Boutique en ligne > Préférences).
- Repéré, non modifié : bouton « Submit » en anglais sur la page Contact ; page Contact sans adresse, téléphone ni e-mail.

## 26. « Chambre enfant et bébé » supprimée (27 novembre 2026)
- Demande de l'utilisateur : supprimer la section chambre enfant. La dépublication étant refusée par l'outil (sécurité), la **collection a été supprimée** (`collectionDelete`, irréversible) ; les 6 motifs enfants archivés restent dans Produits > Archivés (sans cette collection).
- Menu principal : entrée « Chambre d'enfant » retirée (Accueil, Forêt et sous-bois, Tropical et jungle, Design, Tous les motifs, Contact).
- Accueil (thème « Horizon – Gammes ») : carte retirée, section « Quatre univers » renommée « Nos univers » (3 cartes). Vérifié en capture ordinateur et mobile.
- Effet Google : plus de catégorie vide dans la navigation.

## 27. SEO de nuit et thème à publier (27 novembre 2026)
**Correction des sections 25 et 26.** Le thème « Horizon – Gammes » est devenu le thème en ligne le 26/11 à 14 h 16 ; les modifications de thème faites ensuite (icônes sociales, menu « Informations », « Nos univers », gammes sur Ondes Noires) sont enregistrées mais **en attente de publication**, donc pas encore visibles sur murelle.fr. La publication par l'outil échoue (`changed_on_shopify` sur `config/settings_data.json`), puis est refusée pour une copie (« seuls les thèmes créés par l'agent »).
- **Thème « MURELLE – 27 nov »** (`gid://shopify/OnlineStoreTheme/210120212820`, non publié) : copie du thème en ligne contenant toutes ces corrections, plus celles de cette nuit. **À publier par l'utilisateur** : Boutique en ligne > Thèmes > « MURELLE – 27 nov » > … > Publier. Les références au thème 209539301716 (skill `murelle-catalogue`) seront à mettre à jour ensuite.
- Sur cette copie :
  - accueil : un seul H1, « Papier peint panoramique sur mesure » (le surtitre du bandeau ; le grand titre devient un paragraphe), rendu visuel identique (vérifié en capture ordinateur et mobile) ;
  - page Contact : bouton « Submit » → « Envoyer ».
- **Descriptions produit** (en ligne immédiatement, tous thèmes) : texte unique de 284 à 347 mots pour les 7 motifs : ce qu'on voit, intertitre H2 de recherche, les 3 gammes et la règle de prix, liens vers des motifs proches et la collection, intertitre « Où poser… », usages, mention « ni repris ni échangé, sauf défaut ». Rien d'inventé (ni délai, ni matière, ni certification). Volontairement plus court que les 450–550 mots visés, faute d'informations vérifiées supplémentaires.
- **Textes de collection** (en ligne) : Forêt et sous-bois, Tropical et jungle, Design et inspiration, avec liens vers leurs motifs et une collection voisine.
- **Blog « Actualités »** : 2 articles de conseils **en brouillon** (invisibles tant qu'ils ne sont pas publiés), titre et description SEO remplis :
  - « Comment mesurer son mur pour un papier peint panoramique » (`/blogs/actualites/mesurer-son-mur-papier-peint-panoramique`) : largeur et hauteur à 3 endroits, plus grande valeur, plage acceptée 50–2000 × 50–500 cm, arrondi au m² supérieur (exemples 320 × 250 → 8 m², 260 × 250 → 6,5 → 7 m²) ;
  - « Papier peint adhésif ou papier peint à coller : comment choisir ? » (`/blogs/actualites/papier-peint-adhesif-ou-a-coller`) : Adhésive (dos adhésif, 53 €/m²) contre Essentielle (37 €/m²) et Signature (45 €/m²) posées à la colle. Prix revérifiés sur les variantes.
- Reste à faire par l'utilisateur : publier le thème ; titre et méta-description de l'accueil (Boutique en ligne > Préférences) ; valider « Notre histoire » et les 2 articles ; informations légales (SIRET), délais de livraison réels, Shopify Payments ; puis Search Console + sitemap.

## 28. Bandeau « Livraison offerte » (27 novembre 2026)
- Demande : « livraison offerte » dans le bandeau vert, si c'est compatible avec Google Merchant Center.
- Réglages d'expédition réels (Profil général) : France offerte dès 50 € d'achat, 8,80 € en dessous ; Union européenne 22 € ; autres pays desservis 29 €. Une commande de 1 m² en Essentielle (37 €) ou en Signature (45 €) paie donc la livraison : « livraison offerte » sans condition serait faux.
- Bandeau (thème « MURELLE – 27 nov », commit e6bc37c) : « Imprimé à la commande, à vos dimensions » → « Livraison offerte en France dès 50 € d'achat », avec un lien vers la FAQ. Visible quand ce thème sera publié.
- FAQ (en ligne) : la réponse « Combien coûte la livraison ? » donne désormais ces tarifs, au lieu de « affichés au paiement ».
- Pour GMC : déclarer les mêmes règles dans Merchant Center (ou les importer de Shopify par l'application Google & YouTube). Aucune politique d'expédition Shopify n'existe encore (Paramètres > Politiques) : à créer avec les délais réels.
- Repéré, non modifié : la politique de confidentialité donne une adresse Gmail personnelle comme contact (à remplacer par contact@murelle.fr une fois l'envoi configuré).
- Mise à jour à la demande de l'utilisateur : bandeau « Livraison offerte dès 50 € d'achat » (sans « en France » : seul le marché France est actif, la boutique ne vend pas ailleurs ; commit f5d3252). FAQ : « Nous livrons en France. La livraison est offerte dès 50 € d'achat ; en dessous, elle coûte 8,80 €. » (les tarifs UE et international, sans marché actif, retirés).

## 29. Nouveau motif « Terre Graphique » (27 novembre 2026)
- Aucun produit de ce nom n'existait (vérifié par l'adresse et le titre). Créé à la demande : `gid://shopify/Product/16030179524948`, adresse `/products/terre-graphique`, en ligne, copié du modèle (Essentielle / Signature / Adhésive à 37 / 45 / 53 €), étiquette `design`, collection « Design et inspiration » uniquement (la collection existante ; aucune collection ne s'appelle exactement « Design Inspiration », rien n'a été renommé). Retiré de « Page d'accueil », héritée du modèle.
- Images : les 4 PNG d'origine du Mac de l'utilisateur (`~/Downloads/01-salon-geometrique.png`, `02-salle-a-manger-geometrique.png`, `03-chambre-adulte-geometrique.png`, `04-hall-entree-geometrique.png`, 765 × 509 px) envoyés tels quels (téléversement préparé + `fileCreate`), textes alternatifs descriptifs. Ordre : salon (principale), salle à manger, chambre, hall d'entrée. Copies de référence dans `murelle/visuels/terre-graphique/`.
- Défauts constatés dans les fichiers fournis, **non corrigés** (consigne « ne modifie aucune des images ») : liseré blanc de 4 px sur le bord gauche de la salle à manger ; liseré blanc de 8 px à gauche et ligne claire de 2 px en haut du hall d'entrée.
- SEO : titre « Papier Peint Panoramique Géométrique Terre Graphique | MURELLE », description 154 caractères, texte unique (≈ 300 mots, même plan que les autres motifs, liens vers la collection Design et Ondes Terracotta).
- Vérifié : médias et ordre (requête), nombre d'images d'Ondes Terracotta (5) et de Jardin des Brumes (4) inchangé ; captures thème « MURELLE – 27 nov » : fiche ordinateur (grande image, 2 côte à côte, grande image) et mobile (carrousel), Signature 400 × 270 → 10,8 m², facturé 11 m², 495 € ; collection Design ordinateur et mobile (4 motifs, Terre Graphique en premier).
- En attente : motif à plat envoyé dans le chat (« insère celle-ci aussi ») : fichier introuvable sur le Mac et non transmis au conteneur ; à déposer dans Téléchargements pour l'ajouter en 5e image et comme miniature.
- Signalé, non modifié : le texte de la collection Design ne décrit que les ondulations (« en deux couleurs franches ») et ne cite pas Terre Graphique.

## 30. Nouveau motif « Jungle Nocturne » (27 novembre 2026)
- Aucun produit de ce nom n'existait (adresse et titres vérifiés, archivés compris) ; motif différent de Jardin des Brumes (comparaison des motifs à plat : fond sombre, bananiers, sans palmier ni oiseau). Créé à la demande : `gid://shopify/Product/16030338482516`, adresse `/products/jungle-nocturne`, en ligne, copié du modèle (Essentielle / Signature / Adhésive à 37 / 45 / 53 €), étiquette `tropical`, collection « Tropical et jungle » uniquement (retiré de « Page d'accueil », héritée du modèle).
- Images : les 4 PNG d'origine du Mac (`~/Downloads/01-salon-tropical-angles.png`, `02-salle-a-manger-tropical-angles.png`, `03-chambre-adulte-tropical-angles.png`, `04-hall-entree-tropical-angles.png`, 765 × 509 px) envoyés tels quels, textes alternatifs descriptifs. Ordre : salon (principale), salle à manger, chambre, hall d'entrée. Motif à plat (5e image du chat) non ajouté (« exclusivement les quatre images ») ; copies de référence dans `murelle/visuels/jungle-nocturne/`.
- Défauts constatés dans les fichiers fournis, **non corrigés** (consigne « ne recadre pas ») : ligne claire de 1 px en bas du salon ; bande blanche de 3 px en bas de la salle à manger.
- SEO : titre « Papier Peint Panoramique Tropical Jungle Nocturne | MURELLE », description 154 caractères, texte unique (liens vers la collection tropicale, Jardin des Brumes et la collection forêt).
- Vérifié : médias et ordre (requête), images de Jardin des Brumes (4) et de Terre Graphique (4) inchangées ; captures thème « MURELLE – 27 nov » : fiche ordinateur et mobile (carrousel), Signature 400 × 270 → 10,8 m², facturé 11 m², 495 € ; collection Tropical et jungle ordinateur et mobile (2 motifs, Jungle Nocturne en premier).
- Signalé, non modifié : le texte de la collection parle de « tons doux, loin des couleurs vives », ce que Jungle Nocturne (verts profonds sur fond sombre) ne reflète pas.

## 31. Nouveau motif « L'Écho des Forêts » (27 novembre 2026)
- Aucun produit de ce nom n'existait (adresses `l-echo-des-forets` / `lecho-des-forets` et titres vérifiés, archivés compris) ; motif différent de Forêt brumeuse stylisée (comparaison visuelle : ici grands arbres feuillus et pins dans une brume beige, là-bas sapins et collines). Créé à la demande : `gid://shopify/Product/16030392451412`, adresse `/products/lecho-des-forets` (générée par Shopify), en ligne, copié du modèle (Essentielle / Signature / Adhésive à 37 / 45 / 53 €), étiquette `foret`, collection « Forêt et sous-bois » uniquement (retiré de « Page d'accueil »).
- Images : les 4 PNG d'origine du Mac (`~/Downloads/01-salon-foret-brumeuse.png`, `02-salle-a-manger-foret-brumeuse.png`, `03-chambre-adulte-foret-brumeuse.png`, `04-hall-entree-foret-brumeuse.png`, 767 × 511 px) envoyés tels quels, textes alternatifs descriptifs. Ordre : salon (principale), salle à manger, chambre, hall d'entrée. Copies de référence dans `murelle/visuels/lecho-des-forets/`.
- Défauts constatés dans les fichiers fournis, **non corrigés** (consigne « ne modifie pas… leurs proportions ») : liseré blanc de 2 px à droite du salon et de la chambre ; ligne claire de 1 px en bas du salon et de la salle à manger, en haut de la chambre et du hall.
- SEO : titre « Papier Peint Panoramique Forêt L'Écho des Forêts | MURELLE » (le mot-clé « forêt brumeuse » reste à Forêt brumeuse stylisée, pour éviter que deux fiches se concurrencent), description 154 caractères, texte unique (liens vers la collection forêt, Forêt brumeuse stylisée et Jardin des Brumes).
- Vérifié : médias et ordre (requête), images de Forêt brumeuse stylisée (7) et de Jungle Nocturne (4) inchangées ; captures thème « MURELLE – 27 nov » : fiche ordinateur et mobile, Signature 400 × 270 → 10,8 m², facturé 11 m², 495 € ; collection Forêt et sous-bois ordinateur et mobile (4 motifs, L'Écho des Forêts en premier).
- **Ajout (à la demande, « rajoute cette photo »)** : motif à plat de Jungle Nocturne (fichier du chat, identique à la 5e image du message initial ; aucun original sur le Mac) importé tel quel (WebP 784 × 490, via le dépôt public), placé en 5e et dernière position de la galerie et défini comme miniature du motif (`murelle.miniature_motif`). Défaut du fichier, non corrigé : bande blanche de 3 px en bas et liseré de 1 px à droite. Sur ordinateur, la dernière ligne de la grille (hall + motif à plat) a deux images de proportions légèrement différentes (1,50 et 1,60).
- **Terre Graphique, motif à plat (27/11, à la demande)** : fichier du chat (WebP 764 × 768, quasi carré) importé tel quel via le dépôt public, placé en 5e et dernière position de la fiche Terre Graphique (après les 4 ambiances) et défini comme miniature (`murelle.miniature_motif`). Défaut du fichier, non corrigé : bande blanche de 3 px en haut et de 2 px à droite. Sur ordinateur, la dernière ligne de la grille associe le hall (paysage) et le motif carré : hauteurs inégales, le hall est centré avec du vide au-dessus et au-dessous. Mobile : carrousel à 5 points.

## 32. E-mail contact@murelle.fr (27 novembre 2026)
- Adresse publique créée par l'utilisateur chez OVH (Plan MX, redirection de `contact@murelle.fr` vers la boîte Gmail dédiée à MURELLE, sans copie locale) ; testée par l'utilisateur (message reçu). La boîte Gmail dédiée reste privée (compte Google MURELLE : Search Console, Merchant Center, Ads) et n'est citée nulle part sur le site ni dans ce dépôt.
- Affichage : page Contact (phrase au-dessus du formulaire, lien `mailto:`), introduction de la FAQ, pied de page (bloc texte sous « La lettre MURELLE », icône enveloppe en CSS, couleur #E0A07F, contraste ≈ 5:1 sur le fond vert). Vérifié en capture ordinateur et mobile.
- Thème « MURELLE – 27 nov » (`210120212820`) publié par l'utilisateur dans l'admin, puis publication des derniers changements par l'outil, avec son accord (`theme_publish` accepté cette fois ; il listait aussi comme « en attente » le bandeau, le H1 de l'accueil et le bouton « Envoyer »).
- Reste : la politique de confidentialité donne encore l'ancien Gmail personnel comme contact ; réglages Paramètres > Général à faire par l'utilisateur (« E-mail de la boutique » = Gmail MURELLE, « E-mail de l'expéditeur » = contact@murelle.fr + authentification du domaine chez OVH). Répondre depuis contact@ nécessite une boîte e-mail (OVH ou Google Workspace).

## 33. Pied de page en 4 colonnes (27 novembre 2026)
- Demande : pied de page organisé comme l'exemple fourni (site tiers : structure seulement, aucun texte repris).
- Colonnes (thème en ligne « MURELLE – 27 nov », publié avec l'accord de l'utilisateur) :
  1. **Nous contacter** : ✉ contact@murelle.fr (lien `mailto:`), « Page contact ». Téléphone, adresse et horaires non affichés : non fournis, rien d'inventé.
  2. **Informations légales** : nouveau menu `informations-legales` avec « Politique de confidentialité » seulement (les autres pages n'existent pas encore : mentions légales, CGV, livraison, retours, à ajouter dès leur création ; aucun lien mort).
  3. **Navigation** : menu `footer` renommé « Navigation » : Accueil, Forêt et sous-bois, Tropical et jungle, Design, Tous les motifs, Questions fréquentes, Contact (« Rechercher » retiré, déjà dans l'en-tête).
  4. **La lettre MURELLE** : titre, texte et champ d'inscription regroupés.
- CSS (`assets/murelle.css`) : colonnes alignées en haut, lien « Page contact » sans soulignement (souligné au survol), titre « Nous contacter » aligné sur les titres de menus (ordinateur). Vérifié en capture ordinateur et mobile.

## 34. Élégance Botanique : photos d'ambiance remplacées (27 novembre 2026)
- Fiche existante identifiée : `gid://shopify/Product/16016564093268`, `/products/elegance-botanique` (aucun doublon). Motif vérifié : la gravure fournie (arbres, montagnes, village au bord de l'eau) est celle de l'ancienne photo « 03 salon » ; différente de Brume d'autrefois.
- Avant : 3 photos d'ambiance (3 salons, 1254 × 1254 et 780 × 790), aucun motif à plat. Après : les 4 PNG d'origine du Mac (`01-salon-`, `02-salle-a-manger-`, `03-chambre-`, `04-hall-entree-elegance-botanique.png`, 768 × 512) envoyés tels quels, dans cet ordre, textes alternatifs descriptifs. Les 3 anciennes images sont détachées de la fiche mais conservées dans Contenu > Fichiers.
- Inchangés (vérifiés) : nom, adresse, prix 37 / 45 / 53 €, description, titre SEO, étiquette, collections (Page d'accueil, Forêt et sous-bois, Nos motifs du moment), configurateur (Signature 400 × 270 → 10,8 m², facturé 11 m², 495 €). Brume d'autrefois garde ses 5 images.
- Effet hors fiche : la vignette d'Élégance Botanique dans les collections et sur l'accueil montre désormais le nouveau salon.
- Gravure à plat fournie (1672 × 941) non ajoutée (« les quatre nouvelles images ») ; copie conservée dans `murelle/visuels/elegance-botanique/2026-11-27/`. Défauts des fichiers fournis, non corrigés : liserés clairs de 1 px sur certains bords.

## 35. Nouveau motif « Élégance des Brumes » (27 novembre 2026)
- Avant création, signalé à l'utilisateur avec une comparaison (`murelle/comparaison-elegance-des-brumes.png`) : les 4 photos d'ambiance fournies (`*-premier-carrousel.png`) montrent la gravure d'Élégance Botanique (arbres, montagnes, village au bord de l'eau), et non le motif à plat fourni (paysage tropical gris : palmiers, grand arbre, nuages). L'utilisateur a maintenu sa demande : création dans « Tropical et jungle » avec ces 4 photos, puis ajout du motif à plat au carrousel.
- Créé : `gid://shopify/Product/16030813421908`, `/products/elegance-des-brumes`, en ligne, copié du modèle (Essentielle / Signature / Adhésive à 37 / 45 / 53 €), étiquette `tropical`, collection « Tropical et jungle » uniquement (retiré de « Page d'accueil »). Aucun produit de ce nom n'existait.
- Galerie : 1) motif à plat (copie du chat, WebP 764 × 618, via le dépôt public ; c'est le motif vendu, placé en premier et défini comme miniature), 2–5) les 4 PNG d'origine du Mac (756 × 500, envoyés tels quels) : salon, salle à manger, chambre, hall. Textes alternatifs des ambiances factuels (« Visualisation : … papier peint panoramique de grands arbres »), sans attribuer la gravure au motif tropical.
- Texte et SEO : description du motif à plat (le produit imprimé), titre « Papier Peint Panoramique Tropical Élégance des Brumes | MURELLE », description 152 caractères.
- Vérifié : médias et ordre, collection (3 motifs), fiche ordinateur (motif en grand, puis 2 × 2) et mobile (carrousel 5 points), Signature 400 × 270 → 10,8 m², facturé 11 m², 495 € ; Élégance Botanique (4 images) et Jardin des Brumes (4) inchangés.
- Risque connu, accepté par l'utilisateur : visuels d'ambiance d'un autre motif sur la fiche (incohérence pour le client, motif de refus possible par Google Merchant Center). À remplacer par des mises en situation du motif tropical. Défaut du fichier à plat : liseré blanc de 2 px en bas et à droite.
- **Correction (27/11, à la demande)** : les 4 photos d'ambiance « premier-carrousel » (gravure d'Élégance Botanique) sont retirées de la fiche (conservées dans Contenu > Fichiers et dans `murelle/visuels/elegance-des-brumes/anciennes-ambiances/`) et remplacées par 4 nouvelles mises en situation qui montrent bien le motif tropical gris (`01-salon-`, `02-salle-a-manger-`, `03-chambre-`, `04-hall-entree-elegance-des-brumes.png`, PNG d'origine du Mac, 764 × 512 et 764 × 504, envoyés tels quels). Ordre : motif à plat (inchangé, 1er), salon, salle à manger, chambre, hall. Le risque d'incohérence noté plus haut est levé. Vérifié : fiche ordinateur (motif en grand, puis 2 × 2) et mobile (carrousel), Signature 400 × 270 → 495 € ; Élégance Botanique (4), Jardin des Brumes (4) et Jungle Nocturne (5) inchangés. Défauts des fichiers, non corrigés : liseré blanc de 2 px à gauche de la salle à manger et du hall.

## 36. Sélecteur de motifs par catégorie (27 novembre 2026)
- **Avant** : bloc « Choix du motif » (`blocks/murelle-motifs.liquid`) alimenté par des familles saisies à la main (métaobjet `famille_motifs`, une seule famille : Ondes Noires / Terracotta / Sauge) ; chaque clic chargeait une nouvelle page.
- **Source unique** : nouveau métachamp de collection `murelle.categorie_motifs` (booléen, « Catégorie de motifs (sélecteur) »), coché sur Forêt et sous-bois, Tropical et jungle, Design et inspiration. Le bloc lit la catégorie du produit affiché et liste tous ses motifs (ordre de la collection, 50 au plus). Nouveau motif : l'ajouter à sa collection suffit. Nouvelle catégorie : cocher le métachamp sur sa collection. Aucune catégorie écrite dans le code ; le métaobjet `famille_motifs` n'est plus lu (données conservées).
- **Même bloc, même style** (vignettes carrées, bordure du motif choisi), complétés par : prix au m² de la gamme en cours sous le nom (« 45,00 € / m² · Signature »), mis à jour au changement de gamme et au survol ; changement de motif **sans rechargement** (`assets/murelle-motifs.js`, module) : la fiche du motif choisi est préchargée au survol puis remplace `<main>` avec la fonction `morph` d'Horizon (mécanisme des listes combinées), l'adresse est mise à jour (motif, gamme, dimensions), le configurateur, le sélecteur et les recommandations sont relancés avec les données du nouveau motif ; en cas d'erreur, navigation classique. Avertissement dans l'éditeur si un motif est dans plusieurs catégories.
- **Miniatures** : `murelle.miniature_motif` ajoutée à Élégance Botanique (gravure à plat fournie, hors galerie), Jardin des Brumes (motif à plat fourni, hors galerie), Forêt brumeuse stylisée (image « détail » déjà dans sa galerie). Sans miniature (L'Écho des Forêts) : carré pris en haut au centre de la photo principale (`crop: 'region'`).
- **Tests** : `murelle/theme/tests/motifs/test.js` (Chromium, pages factices) : 21 vérifications OK (survol, prix par gamme, préchargement, changement sur place, adresse, titre, formulaire, configurateur relancé, dimensions, focus, deuxième changement, clic sur le motif courant, repli en cas d'erreur, aucune erreur JS). Captures du thème : Forêt 4 motifs, Tropical 3, Design 4, aucun mélange ; ordinateur et mobile.
- **Non testé en conditions réelles** : le changement sans rechargement sur la vraie boutique (le conteneur n'accède pas au site) ; à vérifier après publication (voir la liste de contrôle donnée à l'utilisateur).
- Thème « MURELLE – 27 nov » : publié avec l’accord de l’utilisateur (27/11).

## 37. Image principale = papier peint seul (27 novembre 2026)
- **Analyse** : aucun canal Google & YouTube installé (canaux : boutique en ligne, point de vente, Shop) : pas encore de flux Google Merchant Center. Quand il sera installé, il prendra la 1re image de la galerie comme image principale et les suivantes comme images secondaires ; aucune variante (gamme) n'a d'image propre. Le thème utilise aussi la 1re image pour les vignettes de collection, l'image de partage (`og:image`) et les données structurées (`structured_data`). Règle unique retenue : **le motif à plat désigné par `murelle.miniature_motif` est l'image n° 1** ; ambiances ensuite.
- **Appliqué** (`productReorderMedia`, aucune image supprimée, ni retouchée) : Forêt brumeuse stylisée (papier peint sur un mur nu, 763 × 335), Ondes Noires (794 × 560), Ondes Terracotta (780 × 480), Ondes Sauge (780 × 480), Brume d'autrefois (780 × 568), Terre Graphique (764 × 768), Jungle Nocturne (784 × 490) ; Élégance Botanique (gravure 1672 × 941) et Jardin des Brumes (784 × 524) : motif à plat ajouté à la galerie en 1re position ; Élégance des Brumes : déjà conforme. Résultat vérifié par requête : 10 motifs sur 11 ont `featuredMedia` = miniature, toutes au statut READY sur cdn.shopify.com.
- **Non conforme, faute de fichier** : L'Écho des Forêts (aucun motif à plat ; image n° 1 = salon). À demander.
- **Signalé, non corrigé** (consigne : ne pas modifier les motifs) : liserés blancs de 2 à 9 px sur les bords de plusieurs fichiers à plat (Ondes Noires 4/2/6/9, Ondes Sauge et Terracotta 4 px haut/bas/gauche, Brume 4 haut / 5 droite, Jardin 2/2/5, Terre 4 haut / 2 droite, Jungle 3 bas / 1 droite) : Google interdit les bordures ; résolution 760–800 px sauf Élégance Botanique (1672) : fichiers HD à demander au fournisseur, sans agrandissement artificiel.
- Vérifié en capture : fiche Ondes Noires (ordinateur : motif en grand puis 4 ambiances ; mobile : carrousel 5 points, motif en premier) ; collection Forêt (vignettes = motifs à plat ; option du thème « 2e image au survol » active, donc l'ambiance apparaît au survol). Thème non modifié.

## 38. Liserés blancs retirés + motif à plat de L'Écho des Forêts (27 novembre 2026)
- **Demande** : « supprime les bordures blanches » (images principales) et motif à plat fourni pour L'Écho des Forêts (vérifié : mêmes troncs, pin à droite et arbuste que ses ambiances ; ambiances plus chaudes que le fichier à plat, qui fait foi).
- **Méthode** : seules les lignes et colonnes de bord quasi blanches et uniformes (moyenne ≥ 249, minimum ≥ 225) sont retirées ; aucun redimensionnement, aucune retouche ; WebP sans perte ; intérieur vérifié identique pixel pour pixel à l'original ; originaux conservés dans le dépôt (fichiers d'origine inchangés à côté de `motif-a-plat-sans-liseres.webp`) et dans Contenu > Fichiers (détachés des fiches).
- **Retiré** (haut/bas/gauche/droite, px) : Ondes Noires 4/2/6/9 (779 × 554), Ondes Sauge 4/4/4/0 et Ondes Terracotta 4/4/4/0 (776 × 472), Brume d'autrefois 4/0/0/5 (775 × 564), Jardin des Brumes 2/2/0/5 (779 × 520), Terre Graphique 4/0/0/2 (762 × 764), Jungle Nocturne 0/3/0/1 (783 × 487), Élégance des Brumes 4/2/0/2 (762 × 612), L'Écho des Forêts 4/1/0/5 (775 × 435). Sans liseré : Élégance Botanique, Forêt brumeuse stylisée.
- **Fiches** : nouveau fichier en 1re image et `murelle.miniature_motif` mis à jour ; ancien fichier à plat détaché. Résultat (requête) : **11 motifs sur 11** ont le motif à plat en image principale (= miniature), ambiances conservées (5 images par fiche, 7 pour Forêt brumeuse). Captures : fiche L'Écho des Forêts (ordinateur et mobile), collection Design (vignettes nettes, sans liseré).
- Reste : résolution des fichiers à plat 760–780 px (Élégance Botanique 1672) ; fichiers HD à demander au fournisseur.

## 39. Bannière de la collection Tropical et jungle (27 novembre 2026)
- La collection n'avait pas d'image : la section `murelle-collection-hero` affichait la version sans photo (fond clair), contrairement à Forêt et Design.
- 5 photos d'ambiance des motifs tropicaux comparées en simulation de bannière (recadrage 3:1, dégradé du thème, titre blanc) ; retenue : **salon de Jungle Nocturne** (mur de jungle sur toute la largeur, titre lisible, cohérent avec la chambre de Forêt et l'entrée de Design). Appliquée comme image de collection (`collectionUpdate`, copie du fichier produit, texte alternatif « Visualisation : … »). Aucune autre donnée modifiée.
- Vérifié en capture ordinateur et mobile : bannière avec étiquette « Visualisation », 3 motifs listés. Limite : image source de 765 px de large, un peu douce en plein écran (Forêt : 1672 px).

## 40. « Forêt brumeuse stylisée » supprimée (27 novembre 2026)
- Demande : supprimer le motif (changement de fournisseur). Confirmé par l'utilisateur (« publie et supprime »).
- Références retirées avant la suppression : description de L'Écho des Forêts (lien remplacé par Élégance Botanique) ; texte de la collection Forêt et sous-bois (réécrit : L'Écho des Forêts, Brume d'autrefois, Élégance Botanique) ; bannière de la collection Forêt (chambre de Forêt brumeuse → salon de L'Écho des Forêts, choisi par simulation parmi 4 ambiances) ; section « Inspirations » de l'accueil (4 photos de Forêt brumeuse → salon, salle à manger, chambre, entrée d'Élégance Botanique ; thème publié avec accord).
- `productDelete` sur `gid://shopify/Product/15992920146260` (irréversible). Redirection créée : `/products/foret-brumeuse-stylisee` → `/collections/foret-et-sous-bois` (pas de page 404). Copies des visuels conservées dans `murelle/visuels/` (fichiers `MURELLE_0x_*.jpg`).
- Vérifié : produit introuvable par son adresse ; collection Forêt = 3 motifs (L'Écho des Forêts, Brume d'autrefois, Élégance Botanique), bannière et texte à jour (capture) ; « Nos motifs du moment » sans ce motif ; sélecteur de motifs de la catégorie Forêt mis à jour automatiquement.

## 41. Nouvelle image du bandeau d'accueil (27 novembre 2026)
- Demande : remplacer l'image du bandeau d'accueil (`murelle_hero`, ancienne image : salon avec fresque tropicale) par l'image fournie (hall d'entrée, fresque forestière grise, console en bois).
- Fichier d'origine du Mac (`~/Downloads/Hall d'entrée avec fresque forestière.png`, 1672 × 941, PNG) envoyé tel quel (téléversement préparé + `fileCreate`), nommé `murelle-accueil-hall-fresque-forestiere.png`, texte alternatif descriptif ; copie de référence dans `murelle/visuels/accueil/`. Réglages du bandeau inchangés (textes, boutons, mention « Visualisation », cadrages 52 % / 40 %). Aucun motif du catalogue associé (le champ « Motif visible » reste vide).
- Vérifié en capture ordinateur et mobile (titre lisible, cadrage) ; thème publié avec l'accord de l'utilisateur. Limite : 1672 px de large, sous les 2400 px conseillés par la section pour les grands écrans.
- **Voile blanc retiré (27/11, à la demande)** : réglage du bandeau « Couleur du texte » passé de « Texte vert forêt sur voile crème » (`tone: light`, dégradé crème jusqu'à 90 % d'opacité à gauche) à « Texte crème sur voile vert forêt » (`tone: dark`, option existante du thème, aucun code modifié). Vérifié en capture ordinateur (image aux tons naturels, dégradé sombre discret à gauche, titre lisible) et mobile (texte sur fond vert forêt sous l'image). Publié avec l'accord de l'utilisateur.

## 42. Nouveau motif « Toile Sauvage » (27 novembre 2026)
- Les images fournies montrent un motif absent du catalogue (gravure sépia : lion, cerf, perroquets, singes, héron sous de grands arbres) ; comparé aux 3 motifs tropicaux en ligne, aucun ne correspond. Nom choisi par l'utilisateur : **Toile Sauvage** ; hall d'entrée ajouté à sa demande.
- Créé : `gid://shopify/Product/16031220334932`, `/products/toile-sauvage`, en ligne, copié du modèle (Essentielle / Signature / Adhésive à 37 / 45 / 53 €), étiquette `tropical`, collection « Tropical et jungle » uniquement. Titre SEO « Papier Peint Panoramique Tropical Toile Sauvage | MURELLE », description 158 caractères, texte unique.
- Images (ordre) : 1) motif à plat (copie du chat 784 × 788, seules les lignes blanches de bord retirées : bas 5, gauche 2, droite 2 px → 780 × 783, intérieur identique au pixel près), défini comme miniature ; 2) salon, 3) salle à manger, 4) chambre, 5) hall : PNG d'origine du Mac (1672 × 941, identifiés par empreinte visuelle : « Salon luxueux… », « Salle à manger naturelle… », « Chambre chaleureuse… », « Hall d'entrée chaleureux… » ; « Foyer chaleureux… », non envoyé dans le chat, non utilisé), envoyés tels quels. Copies dans `murelle/visuels/toile-sauvage/`.
- Vérifié : médias et ordre (requête), image principale = motif à plat ; fiche ordinateur (motif en grand, ambiances 2 × 2) et mobile (carrousel) ; sélecteur Tropical = 4 motifs, Toile Sauvage sélectionné ; Signature 400 × 270 → 10,8 m², facturé 11 m², 495 €. Autres motifs tropicaux : 5 images chacun, inchangés.

## 43. Nouveau motif « Clairière d'Automne » (27 novembre 2026)
- Nom et catégorie donnés par l'utilisateur. Aucun produit de ce nom ; motif comparé à Brume d'autrefois et Élégance Botanique : différent (grands chênes à droite, étang à roseaux, village aux toits de chaume au loin).
- Créé : `gid://shopify/Product/16031291998548`, `/products/clairiere-dautomne`, en ligne, copié du modèle (Essentielle / Signature / Adhésive à 37 / 45 / 53 €, configurateur identique), étiquette `foret`, collection « Forêt et sous-bois » uniquement (retiré de « Page d'accueil »). Titre SEO « Papier Peint Panoramique Forêt Clairière d'Automne | MURELLE », description 159 caractères, texte unique.
- Images (ordre) : 1) motif à plat (copie du chat 780 × 568 ; seules les lignes blanches de bord retirées : haut 4, bas 3, droite 5 px → 775 × 561, intérieur identique au pixel près), défini comme miniature ; 2) salon, 3) salle à manger, 4) chambre, 5) hall : PNG d'origine du Mac (≈ 1671 × 941 ; « Salon chaleureux… », « Salle à manger méditerranéenne… », « Chambre chaleureuse au papier peint pastoral », « Entrée chaleureuse au mural pastoral », identifiés par empreinte visuelle, sans bordure), envoyés tels quels. Copies dans `murelle/visuels/clairiere-dautomne/`.
- Vérifié : médias et ordre (requête), image principale = motif à plat ; fiche ordinateur (motif en grand, ambiances 2 × 2) et mobile (carrousel) ; sélecteur Forêt = 4 motifs, Clairière d'Automne sélectionné ; Signature 400 × 270 → 10,8 m², facturé 11 m², 495 € ; collection Forêt = 4 motifs actifs, les 3 autres inchangés (5 images chacun).
