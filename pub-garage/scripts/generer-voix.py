"""Génère la voix off (un WAV par segment) à partir de src/voix/segments.json.

Voix : Kokoro v1.0 (Apache-2.0), voix française « ff_siwis » (jeu de données SIWIS, CC BY 4.0),
exécutée en local avec sherpa-onnx. Optionnel : vous pouvez aussi enregistrer votre propre voix
(voir README) — ce script n'est alors pas nécessaire.

Installation (une fois) :
    python3 -m venv .venv && .venv/bin/pip install sherpa-onnx soundfile numpy
    curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_0.tar.bz2
    tar -xjf kokoro-multi-lang-v1_0.tar.bz2

Utilisation :
    .venv/bin/python scripts/generer-voix.py --modele kokoro-multi-lang-v1_0 [--vitesse 0.92] [--ids 05,06]
    npm run voix   # remesure les fichiers et met à jour src/voix/mesures.json
"""
import argparse
import json
from pathlib import Path

import numpy as np
import sherpa_onnx
import soundfile as sf

RACINE = Path(__file__).resolve().parent.parent
SEGMENTS = RACINE / "src" / "voix" / "segments.json"
SOURCE = RACINE / "src" / "voix" / "source.json"
SORTIE = RACINE / "public" / "voix"
CREDIT = "Voix de synthèse : Kokoro, voix ff_siwis (données SIWIS, CC BY 4.0)"
VOIX_FF_SIWIS = 30  # identifiant de « ff_siwis » dans voices.bin (Kokoro v1.0)
PAUSE_MORCEAUX = 0.3  # secondes de silence entre les morceaux séparés par « | »


def charger_tts(dossier: Path) -> sherpa_onnx.OfflineTts:
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=str(dossier / "model.onnx"),
                voices=str(dossier / "voices.bin"),
                tokens=str(dossier / "tokens.txt"),
                lexicon=str(dossier / "lexicon-us-en.txt"),
                data_dir=str(dossier / "espeak-ng-data"),
                dict_dir=str(dossier / "dict"),
                lang="fr",
            ),
            num_threads=4,
        ),
        max_num_sentences=1,
    )
    return sherpa_onnx.OfflineTts(cfg)


def couper_silences(x: np.ndarray, sr: int, seuil_db: float = -42, marge: float = 0.04) -> np.ndarray:
    fenetre = int(sr * 0.01)
    enveloppe = np.convolve(np.abs(x), np.ones(fenetre) / fenetre, mode="same")
    seuil = 10 ** (seuil_db / 20) * max(1e-9, float(np.abs(x).max()))
    idx = np.where(enveloppe > seuil)[0]
    if len(idx) == 0:
        return x
    debut = max(0, idx[0] - int(marge * sr))
    fin = min(len(x), idx[-1] + int(marge * sr))
    return x[debut:fin]


def limiter(x: np.ndarray, sr: int, plafond_db: float = -1.5, anticipation: float = 0.004, relache: float = 0.08) -> np.ndarray:
    """Limiteur à anticipation : aucune crête au-dessus du plafond, sans écrêtage audible."""
    plafond = 10 ** (plafond_db / 20)
    besoin = np.minimum(1.0, plafond / np.maximum(np.abs(x), 1e-9))
    la = max(1, int(anticipation * sr))
    bord = np.pad(besoin, (la, la), constant_values=1.0)
    minimum = np.lib.stride_tricks.sliding_window_view(bord, 2 * la + 1).min(axis=1)
    lisse = np.convolve(np.pad(minimum, (la // 2, la - la // 2), mode="edge"), np.ones(la + 1) / (la + 1), mode="valid")
    coef = float(np.exp(-1.0 / (relache * sr)))
    gain = np.empty_like(lisse)
    courant = 1.0
    for i, g in enumerate(lisse):
        courant = g if g < courant else courant + (1 - coef) * (g - courant)
        gain[i] = courant
    return x * gain


def normaliser(x: np.ndarray, sr: int, rms_db: float = -15.0) -> np.ndarray:
    """Niveau de parole homogène et assez fort pour un haut-parleur de téléphone (≈ -15 LUFS au mixage)."""
    fenetre = int(sr * 0.02)
    energie = np.convolve(x**2, np.ones(fenetre) / fenetre, mode="same")
    parle = energie > energie.max() * 10 ** (-35 / 10)
    rms = float(np.sqrt(np.mean(x[parle] ** 2))) or 1e-9
    return limiter(x * (10 ** (rms_db / 20) / rms), sr)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--modele", required=True, type=Path, help="dossier kokoro-multi-lang-v1_0")
    p.add_argument("--vitesse", type=float, default=0.92, help="< 1 = plus lent")
    p.add_argument("--ids", default="", help="ex. 05,06 (par défaut : tous)")
    args = p.parse_args()

    segments = json.loads(SEGMENTS.read_text(encoding="utf-8"))
    ids = set(filter(None, args.ids.split(",")))
    tts = charger_tts(args.modele)
    SORTIE.mkdir(parents=True, exist_ok=True)

    for seg in segments:
        if ids and seg["id"] not in ids:
            continue
        texte = seg.get("prononciation") or seg["texte"].replace("*", "")
        # « | » découpe la phrase en morceaux dits séparément, avec un vrai silence entre eux
        morceaux, sr = [], 24000
        for bout in texte.split("|"):
            audio = tts.generate(bout.strip(), sid=VOIX_FF_SIWIS, speed=args.vitesse)
            sr = audio.sample_rate
            if morceaux:
                morceaux.append(np.zeros(int(PAUSE_MORCEAUX * sr), dtype=np.float32))
            morceaux.append(couper_silences(np.asarray(audio.samples, dtype=np.float32), sr))
        x = normaliser(np.concatenate(morceaux), sr)
        sf.write(SORTIE / f"{seg['id']}.wav", x, sr, subtype="PCM_16")
        print(f"{seg['id']}  {len(x) / sr:5.2f} s  {texte}")

    # licence CC BY : le crédit s'affiche en petit sur l'écran final
    SOURCE.write_text(json.dumps({"credit": CREDIT}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
