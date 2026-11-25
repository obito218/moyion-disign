#!/usr/bin/env python3
"""Contrôle qualité d'un lot d'images produit MURELLE, sans les modifier.

Usage : python3 controle_images.py image1.webp image2.png ...
Signale : résolution insuffisante pour la grande image de la fiche, formats et
modes de couleur à risque, orientation EXIF, poids, doublons, et mélange de
formats (portrait/paysage) qui crée des bandes dans le carrousel mobile.
"""
import hashlib
import os
import sys

from PIL import Image

SEUIL_OK = 2000      # largeur conseillée pour la grande image d'une fiche
SEUIL_MINI = 1500    # en dessous : flou visible sur ordinateur


def famille_format(l, h):
    r = l / h
    if 0.95 <= r <= 1.05:
        return "carré"
    if r > 1.05:
        return f"paysage {r:.2f}:1"
    return f"portrait 1:{h / l:.2f}"


def main(chemins):
    if not chemins:
        sys.exit(__doc__)
    empreintes, formats, alertes_lot = {}, set(), []
    print(f"{'Fichier':42} {'Format':6} {'Taille px':>11} {'Poids':>8}  Verdict")
    for p in chemins:
        try:
            im = Image.open(p)
        except Exception as e:  # fichier illisible
            print(f"{os.path.basename(p)[:42]:42} ILLISIBLE ({e})")
            continue
        l, h = im.size
        poids = os.path.getsize(p) / 1024
        md5 = hashlib.md5(open(p, "rb").read()).hexdigest()
        empreintes.setdefault(md5, []).append(os.path.basename(p))
        fam = famille_format(l, h)
        formats.add(fam.split()[0])
        notes = []
        if l >= SEUIL_OK:
            notes.append("OK grande image")
        elif l >= SEUIL_MINI:
            notes.append("acceptable (viser 2000 px)")
        else:
            notes.append(f"INSUFFISANT (< {SEUIL_MINI} px de large)")
        if im.mode in ("CMYK", "P", "LA"):
            notes.append(f"mode {im.mode} à convertir en RVB")
        if im.mode in ("RGBA", "LA") and im.getchannel("A").getextrema()[0] < 255:
            notes.append("transparence")
        try:
            orient = im.getexif().get(274, 1)
        except Exception:
            orient = 1
        if orient not in (1, None):
            notes.append(f"orientation EXIF {orient}")
        if poids > 5000:
            notes.append("fichier > 5 Mo")
        print(f"{os.path.basename(p)[:42]:42} {im.format or '?':6} {l:>5}x{h:<5} {poids:>6.0f}Ko  {fam} · {' · '.join(notes)}")
    for md5, noms in empreintes.items():
        if len(noms) > 1:
            alertes_lot.append(f"Doublons identiques : {', '.join(noms)}")
    if "portrait" in formats and ("paysage" in formats or "carré" in formats):
        alertes_lot.append("Mélange portrait / paysage : bandes vides dans le carrousel mobile (le plus haut impose la hauteur).")
    if alertes_lot:
        print("\nÀ l'échelle du lot :")
        for x in alertes_lot:
            print(f"- {x}")


if __name__ == "__main__":
    main(sys.argv[1:])
