export default function GalleryItem({ id, item, itemAdded }) {
  return (
    <div className="item">
      <img src={item?.url} 
           alt={item?.name} 
           loading="lazy" 
           onLoad={() => {itemAdded(id)}}
           onError={() => {itemAdded(id)}} />
    </div>
  );
}
