export default function GalleryItem(props) {
  return (
    <article>
      <img
        src={props.src}
        alt={props.alt}
        loading="lazy"
        style={{ width: "100%", objectFit: "cover" }}
      />
    </article>
  );
}
