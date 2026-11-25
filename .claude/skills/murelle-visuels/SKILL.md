---
name: murelle-visuels
description: Préparer et contrôler les visuels produits MURELLE (papier peint panoramique) — contrôle qualité des images reçues, mises en situation par incrustation en perspective du motif fournisseur réel sans le redessiner, règles d'ordre et de format des carrousels. À utiliser avant d'ajouter ou de remplacer une image produit, ou pour créer une mise en situation d'un motif dans une pièce.
---

# Visuels MURELLE

## Règle absolue
Le motif fournisseur reste strictement fidèle : jamais redessiné, recoloré, réinterprété, déformé ni généré par IA. Les seules opérations permises sur le motif sont la mise à l'échelle uniforme, le recadrage, la répétition (raccord) et la projection en perspective. L'éclairage de la pièce peut être reporté par multiplication (réglable, désactivable). Le fichier source n'est jamais modifié.

Une pièce générée par IA est acceptable comme décor ; le motif y est alors incrusté avec `scripts/incruster_motif.py`, jamais généré.

## Prérequis
Python 3 avec Pillow et OpenCV. Si `python3 -c "import cv2"` échoue : `pip install opencv-python-headless`. Test de bon fonctionnement : `python3 .claude/skills/murelle-visuels/scripts/test_incrustation.py`.

## 1. Contrôler les images reçues (toujours, avant tout envoi sur Shopify)
```bash
python3 .claude/skills/murelle-visuels/scripts/controle_images.py chemin/vers/*.webp
```
Lire le verdict de chaque fichier et l'alerte de lot :
- Grande image de fiche : 2000 px de large conseillés ; 1500–1999 acceptable ; < 1500 insuffisant → le signaler à l'utilisateur, ne pas bloquer s'il confirme.
- Mélange portrait / paysage dans une même fiche → bandes vides dans le carrousel mobile : le signaler et proposer un ordre ou un remplacement.
- Doublons identiques → ne pas réimporter (réutiliser le fichier déjà dans Shopify).
- Mode CMYK / palette, transparence, orientation EXIF → à corriger par l'utilisateur ou à signaler.

Ne jamais retoucher, recadrer ou compresser une image reçue sans demande explicite.

## 2. Ordre et format d'une galerie produit
1. Mise en situation principale, paysage 3:2, la plus nette (≥ 2000 px de large idéalement).
2. Autres mises en situation, même format autant que possible.
3. Visuel avec dimensions (si fourni).
4. Motif à plat en dernier ; c'est aussi la miniature du sélecteur « Choisissez votre motif » (métachamp `murelle.miniature_motif`).

Nommage : `MURELLE_<n°>_<scène>.<ext>` (ex. `MURELLE_01_salon.webp`), originaux non modifiés rangés dans `murelle/visuels/<handle>/`.
Textes alternatifs : « Visualisation : <pièce et mobilier> devant le papier peint panoramique <Nom>. » ; pour le motif : « Motif du papier peint panoramique <Nom> à plat : <description factuelle>. »

## 3. Créer une mise en situation (incrustation fidèle)
Il faut : une photo de pièce où le mur est plat et visible, le fichier motif le plus grand disponible, les dimensions réelles du mur (cm).

1. **Coins du mur** (pixels de la photo) dans l'ordre haut-gauche, haut-droit, bas-droit, bas-gauche. Les estimer en regardant l'image, puis les tracer sur une copie pour vérifier avant de continuer :
   ```bash
   python3 -c "import cv2;i=cv2.imread('piece.jpg');[cv2.circle(i,p,12,(0,0,255),-1) for p in [(x1,y1),(x2,y2),(x3,y3),(x4,y4)]];cv2.imwrite('coins.png',i)"
   ```
2. **Masque des objets devant le mur** (canapé, plante, lampe…) : image noire de la taille de la photo, blanc sur les objets à garder. Le dessiner avec des polygones (`cv2.fillPoly`) ou le faire fournir. Sans masque, tout ce qui est devant le mur est recouvert.
3. **Incrustation** :
   ```bash
   python3 .claude/skills/murelle-visuels/scripts/incruster_motif.py \
     --piece piece.jpg --motif motif.webp --coins "x1,y1 x2,y2 x3,y3 x4,y4" \
     --mur-cm 400x270 --masque masque.png --ombre 0.5 \
     --sortie rendu.png --controle controle.png
   ```
   - `--mode couvrir` (défaut) : le motif panoramique couvre tout le mur, mise à l'échelle uniforme, recadrage centré — comme une impression sur mesure.
   - `--mode repeter --largeur-motif-cm 100` : motif à raccord répété, à la taille réelle indiquée par le fournisseur.
   - `--ombre` : 0,5 pour un mur uni ; 0,2–0,3 si le mur d'origine porte déjà un motif contrasté ; 0 pour le motif brut.
4. **Vérifier avant de livrer** :
   - « Fidélité géométrique » ≥ 0,98 (test de référence : 0,998). Sous 0,95 : coins faux ou mal ordonnés → corriger, ne pas livrer.
   - Alerte « motif agrandi » : rendu potentiellement flou → demander un fichier motif plus grand.
   - Regarder `rendu.png` (bords du mur, masque, éclairage) et `controle.png` (à gauche le motif attendu, à droite le mur redressé : ils doivent être identiques).
5. Présenter le rendu à l'utilisateur avec ses limites avant tout envoi sur Shopify.

## Retours d'expérience (Jardin d'Antan, 25/11/2026)
- **Photo prise de face** : le rapport largeur/hauteur passé à `--mur-cm` doit être celui du mur dans la photo, sinon le motif est étiré (le script alerte au-delà de 5 %).
- **Marges de scan** : retirer seulement les bandes blanches uniformes du bord du fichier motif (copie de travail), jamais le motif ; l'original reste intact et sert d'image « motif à plat ».
- **Bords du mur** : mesurer au pixel (profil de luminosité) ; s'arrêter au haut de la plinthe ; 1 px de trop = liseré de l'ancien papier peint.
- **Masques sur mur déjà tapissé (noir/crème)** :
  - feuillages : `S > 150 et 35 < V < 205` (HSV OpenCV) dans un cadre autour de la plante, fermeture 3×3, composantes ≥ 12 px ;
  - canapés, fauteuils : GrabCut initialisé par masque (bande haute = mur probable, pixels noirs de la bande = mur certain, cœur du meuble = objet certain) ;
  - objets clairs (vases, pots, livres) : polygones relevés au zoom, puis retirer les pixels sombres (V < 75) à l'intérieur ;
  - tiges fines (diffuseur, lampe arc) : couleur dans un couloir étroit (laiton `S > 140 et V > 60` ou reflet `V > 225`) ; traits sombres fins = sombre moins ouverture 5×5 ;
  - `--adoucir 0.7` pour lisser les bords ; `--ombre 0.5` avec l'éclairage lu sur les seuls pixels clairs du mur.
- **Contrôle** : zoomer ×2–3 sur chaque bord d'objet avant de livrer ; les défauts typiques sont des liserés de l'ancien motif.

## Limites connues
- Un seul plan par passage : un mur qui fait un angle se traite en deux passages (une face chacun) ; l'alignement du motif entre les deux faces n'est pas automatique.
- Les ombres portées précises (plinthes, cadres) ne sont pas recréées ; seules les variations lentes de lumière le sont.
- Le masque conditionne la crédibilité : un masque grossier se voit.

## Test de référence
Scène synthétique (mur en perspective, canapé masqué, dégradé de lumière) : fidélité 0,998 ; pixels hors du mur et objets masqués strictement inchangés ; ordre de coins erroné détecté (fidélité < 0,90).
