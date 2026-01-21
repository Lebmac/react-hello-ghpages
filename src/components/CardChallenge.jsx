import { Link } from "react-router-dom";
import htmr from 'htmr';
import Prism from "prismjs";
import "prismjs/themes/prism.css";
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
  
  function getSnippet() {
    let snippet = data.code;

    snippet = classifyMethods(snippet,"span-cream");
    snippet = classifyMethods(snippet,"span-cream",".",";");
    snippet = classifyMethods(snippet,"span-turq"," ");
    snippet = classifyText(snippet, "new", "span-blue", {leftSpace: true, rightSpace: true});
    snippet = classifyText(snippet, "function", "span-blue", {rightSpace: true});
    snippet = classifyText(snippet, "in", "span-blue", {leftSpace: true, rightSpace: true});
    snippet = classifyText(snippet, "of", "span-blue", {leftSpace: true, rightSpace: true});
    snippet = classifyText(snippet, "let", "span-blue", {rightSpace: true});
    snippet = classifyText(snippet, "var", "span-blue", {rightSpace: true});
    snippet = classifyText(snippet, "const", "span-blue", {rightSpace: true});
    snippet = classifyText(snippet, "return", "span-purple", {rightSpace: true});
    snippet = classifyText(snippet, "for", "span-purple", {rightSpace: true});
    snippet = classifyText(snippet, "while", "span-purple", {rightSpace: true});
    snippet = classifyText(snippet, "if", "span-purple", {rightSpace: true});
    snippet = classifyText(snippet, "(", "span-yellow");
    snippet = classifyText(snippet, ")", "span-yellow");
    snippet = classifyText(snippet, "[", "span-yellow");
    snippet = classifyText(snippet, "]", "span-yellow");
    snippet = classifyText(snippet, "{", "span-yellow");
    snippet = classifyText(snippet, "}", "span-yellow");
    return htmr(snippet);
  }

  function classifyMethods(snippet, htmlClass, leftChar=".", rightChar="(") {
    let lC = leftChar;
    let rC = rightChar;
    let ch = /[0-9a-zA-Z_]/;

    for (let i = 0; i < snippet.length; i++) {
      if (snippet[i] != lC) continue;

      for (let j = i+1; j < snippet.length; j++) {

        if (snippet[j] == rC) {
          snippet = snippet.substring(0, i+1) +
                    `<span className=\"${htmlClass}\">` +
                    snippet.substring(i+1,j) +
                    `</span>`+
                    snippet.substring(j,snippet.length);

        } else if (ch.test(snippet[j])) {
          continue;
        } 
        i = j;
        break;
      }
    }
    return(snippet);
  }

  function classifyText(snippet, subStr, htmlClass, config={}) {
    let leftSpace = config?.leftSpace ? " " : "";
    let rightSpace = config?.rightSpace ? " " : "";

    let snips = snippet.split(leftSpace + subStr + rightSpace);

    if (snips.length <= 1) return snippet;
    let tags = snips[0];
    
    for (let i = 1; i < snips.length; i++) {
      tags = [ ...tags,
               leftSpace,
               `<span className=\"${htmlClass}\">${subStr}</span>`,
               rightSpace,
               snips[i]
            ];
    }

    return(tags.join(""));
  }

  function getDesign() {

    return data.design;
  }

  function getPublishDate() {
    let date = new Date(data.published_at);

    return data.published_at ? date.toLocaleString().split(",")[0] : "";
  }


  return (
    <li className="card-challenge">
      <span className="date">Published: {getPublishDate()}</span>
      <div className="snippet">
        <pre className="snippet-text"><code ref={ref} className="language-javascript">{data.code}</code></pre>
      </div>
      <div> 
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