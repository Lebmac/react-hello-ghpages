import { useEffect, useMemo, useRef, useState } from "react";
import GalleryItem from "../components/GalleryItem.jsx";

export default function GalleryColumn(props) {
  const sensor = useRef(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver((sensors) => {
      const tripSensor = sensors[0];
      if (tripSensor.isIntersecting) {
        const newItem = props.getImage();
        if (newItem == null) { return; }
        setItems((collection) => [
          ...collection, 
          <GalleryItem key={collection.length} 
                      src={newItem.url} 
                      alt={newItem.name} 
          />]
        );
      }
    },
    {
      root: null,
      delay: 200,
      trackVisibility: true,
      scrollMargin: "200px 0px"
    });
    
    observer.observe(sensor.current);

    return () => observer.disconnect();
  }, [sensor.current]);

  return (
    <div className="column">
      {items.map((item) => {return item})}
      <div ref={sensor} className="sensor"></div>
    </div>
  );
}
