import { useEffect, useRef, useState } from "react";
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
  const refCodeTitle = useRef(null);
  const refCodeBody = useRef(null);
  const refDesign = useRef(null);
  const refScope = useRef(null);

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


      console.log(data);
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
    console.log("reffing");
    if (refCodeTitle.current) {
      Prism.highlightElement(refCodeTitle.current);
    }
    if (refCodeBody.current) {
      Prism.highlightElement(refCodeBody.current);
    }
    if (refDesign.current) {
      refDesign.current.innerHTML = marked.parse(post?.design || "");
    }
    if (refScope.current) {
      refScope.current.innerHTML = marked.parse(post?.scope || "");
    }
  }, [post?.code, "language-javascript", tabNo]);

  function setTab(arg) {
    setTabNo(arg);
    console.log(arg);
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
    ];

    return lets[Math.floor(Math.random() * lets.length)];
  }

  if (loading) return <p>Loading…</p>;
  if (err) return <p style={{ color: "crimson" }}>Error: {err}</p>;
  if (!post) return <p>Not found.</p>;

  return (
    <div id="challenge-detail">
      <div className="snippet hero-img">
        <pre><code ref={refCodeTitle} className="language-javascript">{toOpenCurl(post.code)}</code></pre>
      </div>

      <Tabs defaultValue="scope" setTab={setTab}>
        <Tab value="scope" label="Scope">
          <div className="challenge-scope">
            <h2>Scope</h2>
            <div ref={refScope}>{post.scope}</div>
          </div>
        </Tab>
        <Tab value="design" label="Design">
          <article className="challenge-design">
            <h2>Design</h2>
            <div ref={refDesign}>{post.design}</div>
          </article>
        </Tab>
        <Tab value="code" label="Code">
          <div className="challenge-code">
            <h2>Function</h2>
            <div className="snippet hero-img">
              <pre>
                <code ref={refCodeBody} className="language-javascript">{post.code}</code>
              </pre>
            </div>
          </div>
        </Tab>
      </Tabs>



      


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