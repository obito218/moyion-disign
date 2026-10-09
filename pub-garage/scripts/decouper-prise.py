"""Découpe UNE prise (les 12 phrases lues d'affilée) en public/voix/01.wav … 12.wav.

Lisez le texte d'une traite en laissant ~2 s de silence entre les phrases. En cas d'erreur, redites
simplement la phrase : la dernière bonne prise est gardée, les ratés et hésitations sont ignorés.
Chaque morceau est reconnu par transcription automatique (Whisper), puis nettoyé (coupe-bas,
débruitage léger), mis au même niveau et limité à -1,5 dBFS.

Installation (une fois), en plus de celle de generer-voix.py :
    curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
    tar -xjf sherpa-onnx-whisper-small.tar.bz2
Il faut aussi ffmpeg (sinon : --ffmpeg "npx remotion ffmpeg").

Utilisation :
    .venv/bin/python scripts/decouper-prise.py ma-prise.m4a --whisper sherpa-onnx-whisper-small
    npm run voix
Pour une voix de synthèse (ex. une prise ElevenLabs) : ajoutez --sans-debruitage --credit "Voix de synthèse : ElevenLabs".
"""
import argparse
import difflib
import importlib.util
import json
import re
import shlex
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np
import sherpa_onnx
import soundfile as sf

RACINE = Path(__file__).resolve().parent.parent
SEGMENTS = RACINE / "src" / "voix" / "segments.json"
SOURCE = RACINE / "src" / "voix" / "source.json"
SORTIE = RACINE / "public" / "voix"
SR = 44100
SEUIL_ALERTE = 0.7  # ressemblance texte attendu / texte entendu en dessous de laquelle on prévient
ECART_DANS_PHRASE = 1.2  # au-delà de ce silence (s), deux morceaux ne sont jamais la même phrase

# même niveau sonore et même limiteur que la voix de synthèse
_spec = importlib.util.spec_from_file_location("generer_voix", Path(__file__).with_name("generer-voix.py"))
_gv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_gv)


def decoder(chemin: Path, ffmpeg: str, debruiter: bool) -> np.ndarray:
    filtres = ["highpass=f=70"] + (["afftdn=nr=10:nf=-45:tn=1"] if debruiter else [])
    cmd = shlex.split(ffmpeg) + ["-v", "error", "-i", str(chemin), "-ac", "1", "-ar", str(SR)]
    cmd += ["-af", ",".join(filtres), "-f", "f32le", "-"]
    brut = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(brut, dtype=np.float32).copy()


def zones_de_parole(x: np.ndarray, ecart_min: float, duree_min: float = 0.25) -> list[tuple[float, float]]:
    """Morceaux de parole séparés par au moins `ecart_min` secondes de silence."""
    pas, fenetre = int(SR * 0.01), int(SR * 0.03)
    cumul = np.concatenate([[0.0], np.cumsum(x.astype(np.float64) ** 2)])
    debuts = np.arange(len(x) // pas) * pas
    energie = (cumul[np.minimum(debuts + fenetre, len(x))] - cumul[debuts]) / fenetre
    db = 10 * np.log10(energie + 1e-12)
    seuil = max(np.percentile(db, 10) + 10, np.percentile(db, 99.5) - 38)
    zones: list[list[float]] = []
    for i in np.flatnonzero(db > seuil):
        t = i * 0.01
        if zones and t - zones[-1][1] < ecart_min:
            zones[-1][1] = t + 0.01
        else:
            zones.append([t, t + 0.01])
    return [(a, b) for a, b in zones if b - a >= duree_min]


def charger_asr(dossier: Path) -> sherpa_onnx.OfflineRecognizer:
    def trouver(motif: str) -> str:
        fichiers = sorted(dossier.glob(motif))
        if not fichiers:
            sys.exit(f"Fichier {motif} introuvable dans {dossier}")
        return str(fichiers[0])

    return sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=trouver("*-encoder.int8.onnx"),
        decoder=trouver("*-decoder.int8.onnx"),
        tokens=trouver("*-tokens.txt"),
        language="fr",
        task="transcribe",
        num_threads=4,
    )


def transcrire(asr: sherpa_onnx.OfflineRecognizer, x: np.ndarray) -> str:
    # un peu de silence autour : sans lui, Whisper avale souvent le dernier mot
    marge = np.zeros(int(0.4 * SR), dtype=np.float32)
    flux = asr.create_stream()
    flux.accept_waveform(SR, np.concatenate([marge, x, marge]))
    asr.decode_stream(flux)
    return flux.result.text.strip()


def simplifier(texte: str) -> str:
    texte = unicodedata.normalize("NFKD", texte.replace("*", "").lower())
    texte = "".join(c for c in texte if not unicodedata.combining(c)).replace("trente", "30")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", texte)).strip()


def ressemblance(entendu: str, attendu: str) -> float:
    return difflib.SequenceMatcher(None, simplifier(entendu), simplifier(attendu)).ratio()


def aligner(entendus: list[str], attendus: list[str], ecarts: list[float], groupe_max: int = 4):
    """Associe dans l'ordre chaque phrase attendue à 1-4 morceaux consécutifs ; les autres morceaux sont ignorés.
    Seuls des morceaux séparés par une courte pause (virgule, respiration) peuvent former une même phrase.
    Ignorer un morceau coûte un peu plus cher quand il est tardif : à ressemblance égale, la dernière prise gagne."""
    n, p = len(entendus), len(attendus)
    infini = float("inf")
    cout = np.full((n + 1, p + 1), infini)
    retour: dict[tuple[int, int], tuple[int, int, int]] = {}
    cout[0, 0] = 0.0
    for u in range(n + 1):
        for j in range(p + 1):
            c = cout[u, j]
            if c == infini:
                continue
            if u < n and c + 0.35 + 0.001 * u < cout[u + 1, j]:
                cout[u + 1, j] = c + 0.35 + 0.001 * u
                retour[(u + 1, j)] = (u, j, 0)
            for longueur in range(1, groupe_max + 1):
                if j == p or u + longueur > n or (longueur > 1 and ecarts[u + longueur - 2] > ECART_DANS_PHRASE):
                    break
                nc = c + 1 - ressemblance(" ".join(entendus[u : u + longueur]), attendus[j])
                if nc < cout[u + longueur, j + 1]:
                    cout[u + longueur, j + 1] = nc
                    retour[(u + longueur, j + 1)] = (u, j, longueur)
    if cout[n, p] == infini:
        return None, infini
    groupes: list[tuple[int, int]] = [(-1, 0)] * p
    u, j = n, p
    while (u, j) != (0, 0):
        pu, pj, longueur = retour[(u, j)]
        if longueur:
            groupes[pj] = (pu, longueur)
        u, j = pu, pj
    return groupes, float(cout[n, p])


def main() -> None:
    a = argparse.ArgumentParser()
    a.add_argument("prise", type=Path, help="enregistrement (m4a, mp3, wav, ogg…)")
    a.add_argument("--whisper", required=True, type=Path, help="dossier sherpa-onnx-whisper-small")
    a.add_argument("--ffmpeg", default="ffmpeg")
    a.add_argument("--sans-debruitage", action="store_true")
    a.add_argument("--sortie", type=Path, default=SORTIE)
    a.add_argument("--credit", default="", help="petite ligne de crédit sur l'écran final (vide pour votre propre voix)")
    args = a.parse_args()

    segments = json.loads(SEGMENTS.read_text(encoding="utf-8"))
    attendus = [s["texte"] for s in segments]
    x = decoder(args.prise, args.ffmpeg, not args.sans_debruitage)
    asr = charger_asr(args.whisper)
    print(f"Prise : {len(x) / SR:.1f} s")

    # silence de séparation trop court ? on redécoupe plus finement et on garde le meilleur alignement
    meilleur = None
    for ecart in (0.7, 0.5, 0.35):
        zones = zones_de_parole(x, ecart)
        entendus = [transcrire(asr, x[int(d * SR) : int(f * SR)]) for d, f in zones]
        ecarts = [zones[i + 1][0] - zones[i][1] for i in range(len(zones) - 1)]
        groupes, cout = aligner(entendus, attendus, ecarts)
        if groupes is not None and (meilleur is None or cout < meilleur[0]):
            meilleur = (cout, zones, entendus, groupes)
    if meilleur is None:
        sys.exit("Pas assez de morceaux de parole : laissez ~2 s de silence entre les phrases et réessayez.")
    _, zones, entendus, groupes = meilleur

    args.sortie.mkdir(parents=True, exist_ok=True)
    alertes = 0
    for j, (seg, (u, longueur)) in enumerate(zip(segments, groupes)):
        debut, fin = zones[u][0], zones[u + longueur - 1][1]
        avant = zones[u - 1][1] if u > 0 else 0.0
        apres = zones[u + longueur][0] if u + longueur < len(zones) else len(x) / SR
        debut = max(avant + (debut - avant) / 2, debut - 0.15)
        fin = min(fin + (apres - fin) / 2, fin + 0.25)
        morceau = x[int(debut * SR) : int(fin * SR)].copy()
        fondu = int(0.01 * SR)
        morceau[:fondu] *= np.linspace(0, 1, fondu)
        morceau[-fondu:] *= np.linspace(1, 0, fondu)
        sf.write(args.sortie / f"{seg['id']}.wav", _gv.normaliser(morceau, SR), SR, subtype="PCM_16")
        entendu = " ".join(entendus[u : u + longueur])
        score = ressemblance(entendu, attendus[j])
        alerte = score < SEUIL_ALERTE
        alertes += alerte
        print(f"{seg['id']}  {fin - debut:4.1f} s  {score:4.0%}  {'⚠️ ' if alerte else ''}« {entendu} »")

    if args.sortie.resolve() == SORTIE.resolve():
        SOURCE.write_text(json.dumps({"credit": args.credit}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ignores = len(zones) - sum(longueur for _, longueur in groupes)
    print(f"\n{len(segments)} phrases écrites dans {args.sortie} ({ignores} morceau(x) ignoré(s) : ratés, hésitations, prises refaites).")
    if alertes:
        print(f"⚠️  {alertes} phrase(s) mal reconnue(s) : réécoutez-les avant de rendre la vidéo.")
    print("Étape suivante : npm run voix")


if __name__ == "__main__":
    main()
