import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import GalleryColumn from "../components/GalleryColumn";

// Sequence 
// 1) Send image URL to the column Gallery believes is shortest (colSizes)
// 2) Column creates card
// 3) Card loads and calls callback to column
// 4) Column checks new size and calls callback to gallery
// 5) Gallery stores new size.


// Build-time discovery of images
// `query: '?url', import: 'default'`
const imageURLs = await import.meta.glob("../assets/gallery/*.{png,jpg,jpeg,webp,gif,svg}", {
  eager: true,
  query: '?url', 
  import: 'default',
});

export default function Gallery({columns = 3}) {
  const sensorRef = useRef(null);
  const sensorActRef = useRef(null);
  const imgQueueRef = useRef([]);
  const imgAllRef = useRef([]);

  const [colCount, setColCount] = useState(columns);
  const [colShort, setColShort] = useState(0);
  const [colSizes, setColSizes] = useState(Array(colCount).fill(0));
  const [colItems, setColItems] = useState(Array(colCount).fill([]));
  const [seqStepN, setSeqStepN] = useState(0);
  const [imgObjs, setImgObjs] = useState([]);
  const [initBtch, setInitBtch] = useState(false);
  
  // Init gallery full and gallery current cycle.
  // queue will be popped until empty, then refilled from all.
  useEffect(() => {
    if (imgAllRef.current.length) return;

    const all = Object.entries(imageURLs).map(([path, url]) => ({
      url,
      name: path.split("/").pop(),
    }));

    imgAllRef.current = all;
    imgQueueRef.current = all.slice(); 
    setInitBtch(true);
  }, []);

  // S00: Wait for sensor in or above viewport -> S01
  useEffect(() => {
    const senseView = sensorRef.current;
    if (!senseView) { return; }
    if (seqStepN != 0) { return; }
    if (!initBtch) { return; }
    //console.log("step 0: monitoring sensor");

    const observer = new IntersectionObserver(([entry]) => {
      const inViewport = entry.isIntersecting;
      const aboveViewport = entry.boundingClientRect.top < 0;
      const sensorActive = inViewport || aboveViewport;
      //sensorActRef.current = sensorActive;
      if (sensorActive) { setSeqStepN(1); }
    },
    {
      rootMargin: "400px 0px"
    });

    observer.observe(senseView);
    return () => observer.disconnect();
  },[seqStepN==0, initBtch]);

  // S01: Set smallest column -> S02
  useEffect(() => {
    if (seqStepN != 1) { return; }
    //console.log("step 1: find shortest column");
    let smallest = 0;
    colSizes.forEach((size, index) => {
      if (size < colSizes[smallest]) {
        smallest = index;
      }
    });
    setColShort(smallest);
    setSeqStepN(2);

  },[seqStepN==1])

  // S02: Add item to column -> S03
  useEffect(() => {
    if (seqStepN !== 2) return;

    // refill queue from all if empty
    if (imgQueueRef.current.length === 0) {
      imgQueueRef.current = imgAllRef.current.slice();
    }


    const imageObj = imgQueueRef.current.pop();
    if (!imageObj) {
      setSeqStepN(0);
      return;
    }

    setColItems((oldCols) => {
      const nextCols = oldCols.map((col) => col.slice());
      nextCols[colShort].push(imageObj);
      return nextCols;
    });

    setSeqStepN(3);
  }, [seqStepN, colShort]);


  // S03: Wait for card load complete -> COMPLETE
  useEffect(() => {
    if (seqStepN != 3) { return; }
    //console.log(`step 3: wait for card load completed`);    
  },[seqStepN==3]);

  function updateChildStates(id, size) {   
    setColSizes((old) => {
      let update = [];
      old.forEach((item, i) => {
        if (id == i) { update = [...update, size]; }
        else { update = [...update, item];  }
      });
      //console.log("update:", update);
      return update;
    });
    setSeqStepN(0);
  }


  return (
    <div id="gallery">
      <div id="gallery-flex">
        {Array.from({ length: colCount }).map((_, i) => (
          <GalleryColumn
            key={i}
            id={i}
            items={colItems[i]}
            updateParent={updateChildStates}
          />
        ))}
      </div>
      <div ref={sensorRef} style={{ height: 1 }} />
    </div>
  );
}
