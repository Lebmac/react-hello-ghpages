import { useEffect, useMemo, useRef, useState } from "react";
import GalleryColumn from "../components/GalleryColumn.jsx";

// pull images from repo to glob
const imageURLs = import.meta.glob("../assets/gallery/*.{png,jpg,jpeg,webp,gif,svg}", {
  eager: true,
  as: "url",
});

export default function Gallery({numCols = 3}) {

  const columns = Array.from({length: numCols}, (_, index) => {
    return <GalleryColumn key={index} getImage={getImage} />;
  });

  let images = [];

  function getImage() {
    if (images.length < 1) {
      images = Object.entries(imageURLs).map(([path, url]) => {
        const name = path.split("/").pop();
        return { url, name };
      });
    };
    return images.pop();
  }

  return (
    <div id="gallery">
      {columns.map((column) => {return column;})}
    </div>
  );
}
