export default function GalleryItem(props) {
  return (
    <article
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.12)",
        background: "white",
      }}
    >
      <img
        src={props.src}
        alt={props.alt}
        loading="lazy"
        style={{ width: "100%", objectFit: "cover", display: "block" }}
      />
      <div style={{ padding: 10, fontSize: 12, opacity: 0.7 }}>{props.alt}</div>
    </article>
  );
}
