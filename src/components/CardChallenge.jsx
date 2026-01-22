import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-funky.min.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";

export default function CardChallenge({data}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      Prism.highlightElement(ref.current);
    }
  }, [data.code, "language-javascript"]);

  function getPublishDate() {
    let date = new Date(data.published_at);

    return data.published_at ? date.toLocaleString().split(",")[0] : "";
  }

  return (
    <li className="card-challenge">
      <span className="date">Published: {getPublishDate()}</span>
      <div className="snippet">
        <pre><code ref={ref} className="language-javascript">{data.code}</code></pre>
      </div>
      <div className="details"> 
        <h2>{data.title}</h2>
        <p>{data.design}</p>
      </div>
      <Link to={`/challenge/${data.slug}`}>
        <div className="action">
          <span>READ MORE</span>
          <span>🞂</span>
        </div>
      </Link>
    </li>
  );
}