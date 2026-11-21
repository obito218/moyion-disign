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
