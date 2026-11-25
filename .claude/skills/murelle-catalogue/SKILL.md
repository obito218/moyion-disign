---
name: murelle-catalogue
description: Ajouter ou mettre à jour un motif (produit) dans la boutique Shopify MURELLE selon les règles du projet — création par duplication du produit modèle, import et ordre des images, textes alternatifs, collection, famille de motifs, miniature, vérifications. À utiliser dès qu'il faut créer un produit, remplacer ou ajouter des images, ou associer des motifs dans « Choisissez votre motif ».
---

# Catalogue MURELLE

Outils : connecteur Shopify (`graphql_query`, `graphql_mutation`, `theme_screenshot`). Charger la skill Shopify `admin-graphql` avant la première requête. Images : contrôler d'abord avec la skill `murelle-visuels`.

## Règles
- Ne jamais inventer de nom, de référence fournisseur, de prix ou de lien. Le nom du produit fixe son adresse (`/products/<handle>`) : la faire valider par l'utilisateur, ne plus la changer une fois des annonces lancées.
- Ne créer aucun doublon : vérifier l'existence par l'adresse avant de créer.
- Ne modifier ni les autres produits, ni les collections existantes (hors ajout du produit traité), ni le thème.
- Ne jamais générer, redessiner ou retoucher une image.
- Ne rien supprimer : une image retirée d'une fiche reste dans Contenu → Fichiers.
- Toujours demander : nom, collection, ordre des images, si ce n'est pas précisé.

## Références (au 25/11/2026 — revérifier par requête avant usage)
- Produit modèle (brouillon) : `gid://shopify/Product/15992522768724` ; variantes « Matière » : Intissé UV / Intissé HP Latex / Soie HP Latex (prix au m² : 37 / 45 / 53 € TTC à ce jour).
- Collections : `design-et-inspiration` 737673871700 · `foret-et-sous-bois` 737673773396 · `tropical-et-jungle` 737673806164 · `chambre-enfant-et-bebe` 737673838932 · `frontpage` (Page d'accueil) 696826429780 — la duplication y ajoute le produit : l'en retirer.
- Familles de motifs : métaobjet `famille_motifs` (champs `nom`, `produits` = liste ordonnée). Entrée « Ondes Noires » : `gid://shopify/Metaobject/676719395156`.
- Miniature du sélecteur : métachamp produit `murelle.miniature_motif` (file_reference, image).
- Thème de travail (non publié) : `gid://shopify/OnlineStoreTheme/209539301716` — aperçu `https://cdskau-zu.myshopify.com/products/<handle>?preview_theme_id=209539301716`.

## Procédure : nouveau motif
1. **Existe-t-il ?** `productByIdentifier(identifier: {handle: "<handle>"}) { id }` → si oui, passer en mise à jour.
2. **Images** : copier les fichiers reçus, sans modification, dans `murelle/visuels/<handle>/` ; commit + push sur la branche de travail. Le conteneur ne joint pas `cdn.shopify.com`, mais `raw.githubusercontent.com` oui (dépôt public) : l'URL brute sert de source d'import.
3. **Créer** :
   ```graphql
   mutation { productDuplicate(productId: "gid://shopify/Product/15992522768724", newTitle: "<Nom>", newStatus: ACTIVE, includeImages: false, synchronous: true) { newProduct { id handle } userErrors { field message } } }
   ```
4. **Collection et étiquettes** :
   ```graphql
   mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { handle tags collections(first: 5) { nodes { handle } } } userErrors { field message } } }
   ```
   avec `{"id": "...", "tags": ["design", "ref:<référence fournisseur si fournie>"], "collectionsToJoin": ["gid://shopify/Collection/<id>"], "collectionsToLeave": ["gid://shopify/Collection/696826429780"]}`.
5. **Importer les images** : `fileCreate(files: [{originalSource: "<URL brute GitHub>", contentType: IMAGE, filename: "MURELLE_..", alt: ".."}])`, puis interroger `node(id:) { ... on MediaImage { fileStatus image { width height url } } }` jusqu'à `READY`. Shopify ajoute un suffixe au nom si le fichier existe déjà : ce n'est pas un doublon de produit.
6. **Attacher sans copier** : `fileUpdate(files: [{id: "<MediaImage>", referencesToAdd: ["<Product>"]}])`.
7. **Ordonner** : `productReorderMedia(id: "<Product>", moves: [{id: "<MediaImage>", newPosition: "0"}, ...])` (tâche asynchrone : relire ensuite l'ordre).
8. **Miniature** : `metafieldsSet` sur `murelle.miniature_motif` (type `file_reference`) avec l'image du motif à plat.
9. **Famille** (si demandé) : `metaobjectUpdate` du champ `produits` — la valeur remplace toute la liste : renvoyer la liste complète, dans l'ordre voulu.

## Procédure : remplacer une image
Importer la nouvelle (étapes 5–6), la placer à la position de l'ancienne (étape 7), puis `fileUpdate(files: [{id: "<ancienne>", referencesToRemove: ["<Product>"]}])`. Ne pas utiliser `originalSource` sur l'ancien fichier si l'extension change (Shopify exige la même extension).

## Vérifications (obligatoires avant de dire « fait »)
1. Requête : `product { status collections { handle } featuredMedia { id } media(first: 20) { nodes { id alt ... on MediaImage { image { url width height } } } } }` → ordre, image principale, collection.
2. Captures `theme_screenshot` (thème 209539301716) : la collection et la fiche, `viewport: both`.
3. Configurateur : ouvrir `/products/<handle>?variant=<id Intissé HP Latex>&largeur=400&hauteur=270` → Signature cochée, 9 lés, 13 m², total cohérent avec le prix.
4. Si famille : le sélecteur affiche tous les motifs, le motif courant est sélectionné.
5. Ajouter une ligne à `murelle/COMPTE-RENDU.md` (quoi, où, limites : résolution, référence manquante), commit + push.

## Pièges déjà rencontrés (API 2026-10 et outils)
- `collectionUpdate(collection:)` (plus `input:`) ; ajout aux collections via `productUpdate.collectionsToJoin` ; `Publication.name` → `catalog.title` ; `Shop.billingAddress` → `shopAddress`.
- `theme_bash` : pas de `;` ni `||` entre commandes, limite d'environ 1 appel par minute ; `theme_screenshot` aussi limité : regrouper les vérifications.
- Le thème publié n'est pas « Horizon – Gammes » tant que l'utilisateur ne l'a pas publié : les images produit, elles, sont visibles partout dès l'import.
