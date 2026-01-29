import { useEffect, useState } from "react";
import { useIsMobile } from '../hooks/useIsMobile';

export default function Hero({title, description}) {
  const { isMobile } = useIsMobile();
  const [desc, setDesc] = useState(null);
  const [mobile, setMobile] = useState(null);

  useEffect(() => {
    if (!Array.isArray(description)) {
      setDesc([description]);
    } else {
      setDesc(description);
    }
  },[description]);

  useEffect(() => {
    isMobile ? setMobile(" mobile") : setMobile("");
  },[isMobile])
  
  return <div id="hero">
    <h2 className={`hero-title${mobile}`}>
      {title}
    </h2>
    {desc && desc.map(d => 
      <p className={`hero-description${mobile}`}>
        {d}
      </p>
    )}
  </div>
}