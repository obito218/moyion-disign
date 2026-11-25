# Familles de motifs : « Choisissez votre motif »

Sur une fiche produit, le bloc « Choisissez votre motif » affiche les autres motifs de la même famille sous forme de miniatures. Chaque miniature est un lien vers la vraie fiche du produit, avec son URL, son prix et ses variantes. Au clic, la gamme choisie (même valeur de « Matière ») et les dimensions saisies sont reprises sur la fiche suivante.

Tout se gère depuis l'admin Shopify, sans toucher au code.

## Créer une famille

1. Admin Shopify → **Contenu** → **Métaobjets** → **Famille de motifs** → **Ajouter une entrée**.
2. **Nom de la famille** : nom interne (par exemple « Forêt brumeuse »). Il n'est pas affiché aux clients.
3. **Motifs de la famille** : choisis les produits existants. L'ordre de la liste est l'ordre des miniatures ; fais glisser pour réordonner.
4. **Enregistrer**. Le bloc apparaît aussitôt sur la fiche de chaque produit de la liste.

Pour ajouter un motif à « Ondes Noires », ouvre l'entrée « Ondes Noires » et ajoute le produit dans « Motifs de la famille ».

## Choisir l'image de la miniature

Produits → ouvrir le produit → section **Métachamps** (bas de page) → **Miniature du motif** → choisir une image, idéalement le motif à plat, plus lisible en petit. Si le champ est vide, la photo principale du produit est utilisée, recadrée en carré au centre.

## Règles

- Le bloc ne s'affiche que si la famille compte **au moins 2 motifs avec une image** (miniature ou photo principale). Un produit sans aucune image est ignoré.
- Un produit ne doit appartenir qu'à **une seule famille**. S'il en a plusieurs, la première trouvée s'applique.
- La gamme n'est reprise que si le motif suivant a la même valeur de « Matière » (Intissé UV, Intissé HP Latex, Soie HP Latex). Sinon, il s'ouvre sur sa première variante.
- Les dimensions ne sont reprises que si elles sont valides (dans les limites du configurateur).
- Une famille qui ne compte qu'un seul motif ne s'affiche pas.

## Ce qui a été créé

| Élément | Où | Rôle |
|---|---|---|
| Métaobjet « Famille de motifs » (`famille_motifs`) | Contenu → Métaobjets | Nom + liste ordonnée de produits |
| Métachamp produit « Miniature du motif » (`murelle.miniature_motif`) | Fiche produit → Métachamps | Image de la miniature |
| Bloc « Choix du motif » (`blocks/murelle-motifs.liquid`) | Thème « Horizon – Gammes », modèle produit, sous le prix | Affichage |
| Script `assets/murelle-motifs.js` (≈ 4 Ko, chargé seulement quand le bloc s'affiche) | Thème | Nom au survol, préchargement de la page, reprise gamme + dimensions |
| Styles « Choisissez votre motif » | Fin de `assets/murelle.css` | Miniatures, sélection |

Copies du bloc, du script et du test dans `murelle/theme/`.

## Référencement et Google Ads

- Chaque motif garde son produit Shopify, son URL, son titre, sa description et ses données structurées. Rien n'est fusionné.
- Les miniatures sont de vrais liens, explorables par Google.
- Changer de motif charge la vraie page du produit, donc une vraie visite pour Google Ads et les statistiques Shopify.
- Les miniatures pèsent quelques Ko chacune (carré de 80 à 240 px selon l'écran).
