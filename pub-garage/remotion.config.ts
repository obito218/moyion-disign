// Réglages de rendu par défaut (s'appliquent à `npx remotion render`).
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png"); // aplats et textes nets, couleurs exactes
Config.setCodec("h264");
Config.setPixelFormat("yuv420p"); // lisible partout (iPhone, Android, WhatsApp)
Config.setColorSpace("bt709");
Config.setCrf(18);
Config.setOverwriteOutput(true);
