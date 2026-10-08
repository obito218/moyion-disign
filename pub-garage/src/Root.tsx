import { Composition } from "remotion";
import { PubGarage, PROPS_PAR_DEFAUT } from "./PubGarage";
import { DUREE, FPS } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PubGarage"
    component={PubGarage}
    durationInFrames={DUREE}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={PROPS_PAR_DEFAUT}
  />
);
