import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Prism from "prismjs";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import "prismjs/themes/prism-funky.min.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import { Tabs, Tab } from "../components/Tabs";

export default function PostChallenge() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [tabNo, setTabNo] = useState(true);
/*   const [markdown, setMarkdown] = useState();
  const [contents, setContents] = useState(); */
  const refCodeTitle = useRef(null);
  const refCodeBody = useRef(null);
  const refDesign = useRef(null);
  const refScope = useRef(null);


  const renderer = new marked.Renderer();

  renderer.heading = function (text) {
    const id = slugify(text.text);
    return `<h${text.depth} id="${id}">${text.text}</h${text.depth}>`;
  };

  const markdown = useMemo(() => {
    if (!post) return "";
    if (tabNo === "design") return post.design || "";
    if (tabNo === "scope") return post.scope || "";
    return "";
  }, [post, tabNo]);

  const contents = useMemo(() => extractHeadings(markdown), [markdown]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("challenge")
        .select("id,title,slug,source,scope,code,design,featured,published,published_at,updated_at,author_id:profiles_public ( id, display_name )")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (cancelled) return;

      if (error) setErr(error.message);
      else {
        setPost(data);
      }  

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

useEffect(() => {
  marked.setOptions({ renderer });

  if (tabNo === "design" && refDesign.current) {
    refDesign.current.innerHTML = marked.parse(markdown);
  }
  if (tabNo === "scope" && refScope.current) {
    refScope.current.innerHTML = marked.parse(markdown);
  }
}, [markdown, tabNo]);

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (refCodeTitle.current) Prism.highlightElement(refCodeTitle.current);
      if (tabNo === "code" && refCodeBody.current) Prism.highlightElement(refCodeBody.current);
    });

    return () => cancelAnimationFrame(raf);
  }, [post?.code, tabNo]);

  // callback for Tabs to pass current tab to parent
  function setTab(arg) {
    setTabNo(arg);
  }

  function toOpenCurl(code) {
    const curl = code.indexOf("{") + 1;
    return code.slice(0, curl).trim() + 
      `\n    //-- PROVIDER:  freeCodeCamp(🔥) daily_coding_challenge   
    //-- HEADER:    ${post.title}
    //-- DEPLOYED:  ${post.published_at}
    //-- AUTHOR:    ${post.author_id?.display_name} \n
    ${post?.slang || randomLet()}\n}`;
  }

  function randomLet() {
    const lets = [
      "let pleaseWork = true;",
      "let notSureWhyBut = \"THIS WORKS!\";",
      "let definitelyOptimal = \"not a chance...\";",
      "let hackyButWorks = true;",
      "let worksOnMyMachine = true;",
      "let evidenceBasedGuess = true;",
      "let validatedInProd = true;",
      "let edgeCasesHandled = true;",
      "let answerToEverything = 42;",
      "let trustMeImAnEngineer = true;",
      "let explanation = \"it just does\";",
      "let config = { mode: \"probablySafe\" };",
      "let input = \"aab\";",
      "let expected = \"trust the algorithm\";",
      "let output = \"close enough\";",
      "let score = 100; // emotionally",
      "let isEven = Math.round(Math.random()) === 0;",
      "let map = splines.reticulate();"
    ];

    return lets[Math.floor(Math.random() * lets.length)];
  }

  function extractHeadings(markdown) {
    if(!markdown) return [];
    const tokens = marked.lexer(markdown);
    return tokens
      .filter(t => t.type === "heading")
      .map(t => ({
        level: t.depth,
        text: t.text,
        id: slugify(t.text),
      }));
  }


  function slugify(text) {
    if (!text) return;
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  if (loading) return <p>Loading…</p>;
  if (err) return <p style={{ color: "crimson" }}>Error: {err}</p>;
  if (!post) return <p>Not found.</p>;

  return (
    <div id="challenge-detail">
      <div className="snippet hero-img">
        <pre>
          <code ref={refCodeTitle} className="language-javascript">{toOpenCurl(post.code)}</code>
        </pre>
      </div>

      <Tabs defaultValue="scope" setTab={setTab}>
        <Tab value="scope" label="Scope">
          <div className="challenge-scope">
            <div ref={refScope}>{post.scope}</div>
          </div>
        </Tab>
        <Tab value="design" label="Design">
          <article className="challenge-design">
            <div ref={refDesign}>{post.design}</div>
          </article>
        </Tab>
        <Tab value="code" label="Code">
          <div className="challenge-code">
            <div className="snippet hero-img">
              <pre>
                <code ref={refCodeBody} className="language-javascript">{post.code}</code>
              </pre>
            </div>
          </div>
        </Tab>
      </Tabs>

      <div className="challenge-rail">
        <h2>Contents</h2>
          <ul>
            {Array.isArray(contents) && contents.map(h => (
              <li key={h.id} className={`level-${h.level}`}>
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
}


/*     <main>
      <p><Link to="/challenge">← Back</Link></p>
      <h1>{post.title}</h1>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>
        {post.published_at ? new Date(post.published_at).toLocaleString() : ""}
      </div>

      <article style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
        {post.code}
      </article>
    </main> */