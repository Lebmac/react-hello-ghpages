import { useIsMobile } from '../hooks/useIsMobile';
import Logo from "./Logo";

export default function Title() {
  const { isMobile, isLoading } = useIsMobile();

  function responsiveTitle() {
    if (isMobile || isLoading) {
      return <></>;
    } else {
      return (
        <div id="title">
          <Logo />
          <h1><span>C</span>AMPBELL <span>J</span>AMIESON</h1>
        </div>
      );
    }
  }

  return responsiveTitle();
}