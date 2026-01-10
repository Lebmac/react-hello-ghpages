import { useIsMobile } from '../hooks/useIsMobile';

export default function Canvas({ children }) {
  const { isMobile, isLoading } = useIsMobile();

  return (
    <div id={isMobile ? "canvas-mobile" : "canvas"}>
      { children }
    </div>
  );
}