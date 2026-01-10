import cjLogo from "../assets/logo.svg";
import cjLogoInvert from "../assets/logoInvert.svg";

export default function Logo({invert=false}) {
  return <img src={invert?cjLogoInvert:cjLogo} alt="Campbell Jamieson Logo" />;
}