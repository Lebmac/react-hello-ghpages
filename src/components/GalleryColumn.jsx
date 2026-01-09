import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, useEffect } from "react";
import GalleryItem from "./GalleryItem";

export default function GalleryColumn({id, items, updateParent}) {
  const colRef = useRef(null);
  const [colHeight, setColHeight] = useState(0);
  const colID = id;

  useEffect(() => {
    itemAdded(colID);
  },[]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const height = colRef.current?.offsetHeight || colHeight;
      
      setColHeight(height);
    });
    observer.observe(colRef.current);
    return () => observer.disconnect();
  }, []);

  function itemAdded(id) {
    setTimeout(() => {
      const height = colRef.current.offsetHeight;
      //console.log("itemAdded:", colID, height);
      updateParent(colID, height);
    }, 50);
  }

  return (
    <div className="column" ref={colRef}>
      {items.map((item, index) => (
        <GalleryItem
          key={index}
          id={index}
          item={item}
          itemAdded={itemAdded}
        />
      ))}
    </div>
  );
};
