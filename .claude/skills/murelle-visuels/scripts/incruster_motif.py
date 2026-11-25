#!/usr/bin/env python3
"""Incruste le motif réel d'un papier peint sur le mur d'une photo de pièce.

Le motif n'est jamais redessiné : il subit seulement une mise à l'échelle uniforme,
un recadrage (mode « couvrir ») ou une répétition (mode « repeter »), puis la
projection en perspective sur les 4 coins du mur. L'éclairage de la pièce peut être
reporté par multiplication (--ombre 0 pour le désactiver). Les objets devant le mur
sont protégés par un masque (blanc = garder la pièce).

Exemple :
  python3 incruster_motif.py --piece salon.jpg --motif motif.webp \
      --coins "212,140 1430,120 1440,780 205,790" --mur-cm 400x270 \
      --masque masque.png --sortie rendu.png --controle controle.png
"""
import argparse
import sys

import cv2
import numpy as np


def lire_image(chemin):
    img = cv2.imread(chemin, cv2.IMREAD_UNCHANGED)
    if img is None:
        sys.exit(f"Impossible de lire l'image : {chemin}")
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    elif img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    return img


def lire_coins(texte):
    try:
        pts = [tuple(float(v) for v in p.split(",")) for p in texte.split()]
    except ValueError:
        sys.exit("--coins : format attendu \"x,y x,y x,y x,y\"")
    if len(pts) != 4:
        sys.exit("--coins : il faut exactement 4 points (haut-gauche, haut-droit, bas-droit, bas-gauche)")
    return np.array(pts, dtype=np.float32)


def redimensionner(img, largeur, hauteur):
    """Mise à l'échelle sans déformation de proportions (appelée avec un facteur uniforme)."""
    agrandit = largeur > img.shape[1] or hauteur > img.shape[0]
    interp = cv2.INTER_LANCZOS4 if agrandit else cv2.INTER_AREA
    return cv2.resize(img, (largeur, hauteur), interpolation=interp)


def toile_murale(motif, l_toile, h_toile, mode, largeur_motif_cm, mur_l_cm):
    """Remplit un mur « vu de face » avec le motif, à l'échelle uniforme."""
    mh, mw = motif.shape[:2]
    if mode == "couvrir":
        echelle = max(l_toile / mw, h_toile / mh)
        nw, nh = max(1, round(mw * echelle)), max(1, round(mh * echelle))
        grand = redimensionner(motif, nw, nh)
        x0, y0 = (nw - l_toile) // 2, (nh - h_toile) // 2
        return grand[y0:y0 + h_toile, x0:x0 + l_toile].copy(), echelle
    # mode « repeter » : un raccord du motif mesure largeur_motif_cm sur le mur réel
    l_raccord = max(1, round(l_toile * largeur_motif_cm / mur_l_cm))
    echelle = l_raccord / mw
    h_raccord = max(1, round(mh * echelle))
    raccord = redimensionner(motif, l_raccord, h_raccord)
    nx, ny = -(-l_toile // l_raccord), -(-h_toile // h_raccord)
    return np.tile(raccord, (ny, nx, 1))[:h_toile, :l_toile].copy(), echelle


def carte_eclairage(piece, masque_mur, force):
    """Variations lentes de lumière du mur d'origine, normalisées autour de 1."""
    if force <= 0:
        return None
    gris = cv2.cvtColor(piece, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    zone = masque_mur > 0.5
    if not zone.any():
        return None
    # Seuls les pixels clairs du mur d'origine renseignent la lumière : sur un mur déjà
    # tapissé (motif contrasté), les zones sombres du motif ne doivent pas devenir des ombres.
    seuil = np.percentile(gris[zone], 55)
    clair = (masque_mur * (gris >= seuil)).astype(np.float32)
    sigma = max(piece.shape[:2]) * 0.03
    poids = cv2.GaussianBlur(clair, (0, 0), sigma)
    flou = cv2.GaussianBlur(gris * clair, (0, 0), sigma) / np.maximum(poids, 1e-4)
    reference = np.percentile(flou[zone], 90)
    lumiere = np.clip(flou / max(reference, 1e-4), 0.0, 1.15)
    return (1.0 - force) + force * lumiere


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--piece", required=True, help="photo de la pièce")
    ap.add_argument("--motif", required=True, help="motif fournisseur à plat (jamais modifié)")
    ap.add_argument("--coins", required=True, help="coins du mur dans la photo : HG HD BD BG, en pixels")
    ap.add_argument("--mur-cm", required=True, help="dimensions réelles du mur, ex. 400x270")
    ap.add_argument("--mode", choices=["couvrir", "repeter"], default="couvrir")
    ap.add_argument("--largeur-motif-cm", type=float, default=0, help="mode repeter : largeur réelle d'un raccord")
    ap.add_argument("--masque", help="masque des objets devant le mur (blanc = garder la pièce)")
    ap.add_argument("--adoucir", type=float, default=0.0, help="flou du bord du masque en pixels (ex. 0.7) pour éviter l'effet crénelé")
    ap.add_argument("--ombre", type=float, default=0.5, help="report de l'éclairage, 0 à 1 (0 = motif brut)")
    ap.add_argument("--sortie", required=True)
    ap.add_argument("--controle", help="image de contrôle : motif attendu / mur redressé côte à côte")
    a = ap.parse_args()

    try:
        mur_l_cm, mur_h_cm = (float(v) for v in a.mur_cm.lower().split("x"))
    except ValueError:
        sys.exit("--mur-cm : format attendu LARGEURxHAUTEUR en cm, ex. 400x270")
    if a.mode == "repeter" and a.largeur_motif_cm <= 0:
        sys.exit("--mode repeter demande --largeur-motif-cm")

    piece = lire_image(a.piece)
    motif = lire_image(a.motif)
    coins = lire_coins(a.coins)
    H_img, W_img = piece.shape[:2]

    # Toile « vue de face » : assez de pixels pour ne pas perdre de détail à la projection
    bord = max(np.linalg.norm(coins[1] - coins[0]), np.linalg.norm(coins[2] - coins[3]))
    l_toile = int(min(6000, max(1200, bord * 2)))
    h_toile = int(round(l_toile * mur_h_cm / mur_l_cm))
    toile, echelle = toile_murale(motif, l_toile, h_toile, a.mode, a.largeur_motif_cm, mur_l_cm)

    src = np.array([[0, 0], [l_toile, 0], [l_toile, h_toile], [0, h_toile]], dtype=np.float32)
    M = cv2.getPerspectiveTransform(src, coins)
    mur = cv2.warpPerspective(toile, M, (W_img, H_img), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT)
    masque_mur = cv2.warpPerspective(np.ones((h_toile, l_toile), np.float32), M, (W_img, H_img), flags=cv2.INTER_LINEAR)

    alpha = masque_mur.copy()
    if a.masque:
        occ = cv2.imread(a.masque, cv2.IMREAD_GRAYSCALE)
        if occ is None:
            sys.exit(f"Impossible de lire le masque : {a.masque}")
        if occ.shape != (H_img, W_img):
            sys.exit(f"Le masque doit faire {W_img}x{H_img} px (comme la photo), il fait {occ.shape[1]}x{occ.shape[0]}")
        occ = occ.astype(np.float32) / 255.0
        if a.adoucir > 0:
            occ = cv2.GaussianBlur(occ, (0, 0), a.adoucir)
        alpha *= 1.0 - occ

    mur_f = mur.astype(np.float32)
    eclairage = carte_eclairage(piece, masque_mur, a.ombre)
    if eclairage is not None:
        mur_f *= eclairage[..., None]
    sortie = piece.astype(np.float32) * (1 - alpha[..., None]) + mur_f * alpha[..., None]
    cv2.imwrite(a.sortie, np.clip(sortie, 0, 255).astype(np.uint8))

    # Contrôle de fidélité : le mur rendu, redressé, doit reproduire la toile (corrélation proche de 1)
    Minv = cv2.getPerspectiveTransform(coins, src)
    redresse = cv2.warpPerspective(mur, Minv, (l_toile, h_toile), flags=cv2.INTER_LINEAR)
    marge = max(4, l_toile // 100)
    g1 = cv2.cvtColor(toile, cv2.COLOR_BGR2GRAY)[marge:-marge, marge:-marge].astype(np.float32)
    g2 = cv2.cvtColor(redresse, cv2.COLOR_BGR2GRAY)[marge:-marge, marge:-marge].astype(np.float32)
    g1 -= g1.mean()
    g2 -= g2.mean()
    correlation = float((g1 * g2).sum() / (np.sqrt((g1 ** 2).sum() * (g2 ** 2).sum()) + 1e-9))
    if a.controle:
        h = 600
        v1 = cv2.resize(toile, (round(l_toile * h / h_toile), h))
        v2 = cv2.resize(redresse, (round(l_toile * h / h_toile), h))
        cv2.imwrite(a.controle, np.hstack([v1, np.full((h, 12, 3), 255, np.uint8), v2]))

    zone_px = float(masque_mur.sum())
    # pixels du motif d'origine par pixel du mur rendu (< 1 : le motif est agrandi)
    px_motif_par_px_rendu = 1.0 / (echelle * bord / l_toile)
    print(f"Rendu : {a.sortie} ({W_img}x{H_img})")
    print(f"Mur : {mur_l_cm:g} x {mur_h_cm:g} cm, toile {l_toile}x{h_toile} px, mode {a.mode}, éclairage {a.ombre:g}")
    print(f"Surface du mur dans la photo : {zone_px / (W_img * H_img):.0%}")
    print(f"Fidélité géométrique (corrélation motif attendu / mur redressé) : {correlation:.3f}")
    if px_motif_par_px_rendu < 1:
        print(f"ATTENTION : le motif est agrandi (x{1 / px_motif_par_px_rendu:.1f}) : prévoir un fichier motif plus grand pour un rendu net.")
    largeur_px = (np.linalg.norm(coins[1] - coins[0]) + np.linalg.norm(coins[2] - coins[3])) / 2
    hauteur_px = (np.linalg.norm(coins[3] - coins[0]) + np.linalg.norm(coins[2] - coins[1])) / 2
    ecart = abs((largeur_px / hauteur_px) / (mur_l_cm / mur_h_cm) - 1)
    if ecart > 0.05:
        print(f"ATTENTION : proportions du mur dans la photo ({largeur_px / hauteur_px:.2f}) ≠ --mur-cm ({mur_l_cm / mur_h_cm:.2f}). "
              "Si la photo est prise de face, le motif sera étiré : ajuster --mur-cm au rapport de la photo.")
    if correlation < 0.9:
        print("ATTENTION : fidélité < 0,90 : vérifier l'ordre des coins (HG, HD, BD, BG) et l'image de contrôle.")


if __name__ == "__main__":
    main()
