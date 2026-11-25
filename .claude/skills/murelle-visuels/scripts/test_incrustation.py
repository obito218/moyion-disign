#!/usr/bin/env python3
"""Test de non-régression de incruster_motif.py sur une scène synthétique.

Usage : python3 test_incrustation.py  (écrit ses fichiers dans un dossier temporaire)
Vérifie : fidélité géométrique ≥ 0,98, pixels hors du mur et objets masqués inchangés,
détection d'un ordre de coins erroné.
"""
import os
import re
import subprocess
import sys
import tempfile

import cv2
import numpy as np

ICI = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(ICI, "incruster_motif.py")
COINS = "180,110 1460,60 1480,790 170,770"


def lancer(dossier, *args):
    r = subprocess.run([sys.executable, SCRIPT, *args], cwd=dossier, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"ÉCHEC d'exécution : {r.stderr}")
    m = re.search(r"corrélation[^:]*: ([0-9.]+)", r.stdout)
    return float(m.group(1)) if m else -1.0


def main():
    d = tempfile.mkdtemp(prefix="murelle-test-")
    W, H = 1600, 1000
    piece = np.zeros((H, W, 3), np.uint8)
    piece[:] = (np.array([229, 239, 244]) * np.linspace(0.75, 1.0, W)[None, :, None]).astype(np.uint8)
    piece[780:] = (120, 150, 175)
    cv2.rectangle(piece, (520, 560), (1100, 800), (170, 185, 160), -1)
    cv2.imwrite(os.path.join(d, "piece.png"), piece)
    masque = np.zeros((H, W), np.uint8)
    cv2.rectangle(masque, (520, 560), (1100, 800), 255, -1)
    cv2.imwrite(os.path.join(d, "masque.png"), masque)
    motif = np.full((600, 900, 3), (235, 240, 245), np.uint8)
    for i in range(0, 900, 60):
        cv2.line(motif, (i, 0), (i, 599), (50, 60, 52), 3)
    for j in range(0, 600, 60):
        cv2.line(motif, (0, j), (899, j), (79, 110, 189), 3)
    cv2.circle(motif, (200, 150), 90, (50, 60, 52), -1)
    cv2.imwrite(os.path.join(d, "motif.png"), motif)

    resultats = []
    fid = lancer(d, "--piece", "piece.png", "--motif", "motif.png", "--coins", COINS, "--mur-cm", "400x270",
                 "--masque", "masque.png", "--ombre", "0.5", "--sortie", "rendu.png")
    resultats.append(("Fidélité géométrique ≥ 0,98", fid >= 0.98, f"{fid:.3f}"))
    rendu = cv2.imread(os.path.join(d, "rendu.png"))
    resultats.append(("Objet masqué inchangé", np.array_equal(piece[565:795, 525:1095], rendu[565:795, 525:1095]), ""))
    resultats.append(("Hors du mur inchangé", np.array_equal(piece[:40], rendu[:40]) and np.array_equal(piece[800:], rendu[800:]), ""))
    faux = lancer(d, "--piece", "piece.png", "--motif", "motif.png", "--coins", "1460,60 180,110 1480,790 170,770",
                  "--mur-cm", "400x270", "--ombre", "0", "--sortie", "faux.png")
    resultats.append(("Ordre de coins erroné détecté (< 0,90)", faux < 0.90, f"{faux:.3f}"))

    ok = all(r[1] for r in resultats)
    for nom, bon, detail in resultats:
        print(f"{'OK   ' if bon else 'ÉCHEC'} {nom} {detail}")
    print(f"\n{'Tous les tests passent' if ok else 'Des tests échouent'} — fichiers : {d}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
