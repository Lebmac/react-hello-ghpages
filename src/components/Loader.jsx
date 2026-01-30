import { useEffect, useState, useRef } from "react";

export default function Loader() {
  const [wave, setWave] = useState(null);
  const [opacity, setOpacity] = useState(0);
  const refWave = useRef(null);
  const phase = useRef(0);

  function sineWave() { 
    if (!refWave.current) return;

    const { width: x, height: y } = refWave.current.getBoundingClientRect();
    // Wave = Amp * sin(Freq*t + Phase) + Offset
    // Amp and Offset are equal.
    const amp = y / 2;
    const freq = 3;
    const phasor = 20 / x;
    // Each call, phase will be varied by phasor 
    // to cause wave movement effect.
    // the numerator determines how many scans of
    // sineWave cause a complete loop.

    // calc all (x,y) points for path
    let sine = [];
    for (let i = 0; i < x; i++) {
      // normalise i to pi 
      const t = 2 * i / x * Math.PI;
      const shape = 0.8 * Math.sin(t / 2) + 0.2;
      const modulator = 0.5 * Math.sin(t / 2 + phase.current / 5) + 0.5;
      const j = amp * shape * modulator * Math.sin(freq * t + phase.current) + amp;
      sine.push({x:i, y:j});
    }

    // build path
    let path = `M ${sine[0].x},${sine[0].y}`;
    for (let i = 1; i < sine.length; i++) {
      path += ` L ${sine[i].x},${sine[i].y}`;
    }

    setWave(path);
    setOpacity(0.45 * Math.sin(Math.PI + phase.current / 5 - Math.PI / 2) + 0.55);
    phase.current += phasor;
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      sineWave();
    }, 20);

    return () => clearInterval(intervalId);
  },[])

  return <div className="loader">
    <svg ref={refWave} width="50" height="75">
      {wave && <path d={`${wave}`} fillOpacity={0} strokeOpacity={opacity} strokeWidth={2} stroke='#000'/>}
      
    </svg>
    <span style={{ opacity }}>Loading</span>
  </div>
}