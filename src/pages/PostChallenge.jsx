import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useIsMobile } from '../hooks/useIsMobile';
import Prism from "prismjs";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import "prismjs/themes/prism-funky.min.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import { Tabs, Tab } from "../components/Tabs"; 
import Comments from "../components/Comments"


export default function PostChallenge() {
  const { slug } = useParams();
  const { isMobile } = useIsMobile();
  const [post, setPost] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [prevPost, setPrev] = useState(null);
  const [nextPost, setNext] = useState(null);
  const [codeView, setCodeView] = useState(false);
  const [headHeight, setHeadHeight] = useState(null);
  const [headContent, setHeadContent] = useState(null);
  const [tabNo, setTabNo] = useState("scope");
  const refCodeTitle = useRef(null);
  const refCodeBody = useRef(null);
  const refDesign = useRef(null);
  const refScope = useRef(null);
  const renderer = new marked.Renderer();

  // define headers with id for markdown rendering
  renderer.heading = function (text) {
    const id = slugify(text.text);
    return `<h${text.depth} id="${id}">${text.text}</h${text.depth}>`;
  };

  // add div for background colour styling on code blocks
  renderer.code = function (text) {
    return `<div class="code-block"><code>${text.text}</code></div>`;
  }

  // design and scope body content stored for marked parsing
  const markdown = useMemo(() => {
    if (!post) return "";
    if (tabNo === "design") return post.design || "";
    if (tabNo === "scope") return post.scope || "";
    return "";
  }, [post?.scope, tabNo]);

  // parsed marked content
  const contents = useMemo(() => extractHeadings(markdown), [markdown]);

  // select blog post from supabase table
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setTabNo("scope");
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

  // render markdown to html
  useEffect(() => {
    marked.setOptions({ renderer });

    if (tabNo === "design" && refDesign.current) {
      refDesign.current.innerHTML = marked.parse(markdown);
    }
    if (tabNo === "scope" && refScope.current) {
      refScope.current.innerHTML = marked.parse(markdown);
    }
  }, [markdown, tabNo, refScope.current, prevPost, nextPost]);

  // render code blocks
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (refCodeTitle.current) Prism.highlightElement(refCodeTitle.current);
      if (tabNo === "code" && refCodeBody.current) Prism.highlightElement(refCodeBody.current);
    });
    return () => cancelAnimationFrame(raf);
  }, [post, tabNo, prevPost, nextPost]);

  // set next and previous links
  useEffect(() => {
    getNeighbouringPosts();
  },[post])

  // callback for Tabs to pass current tab to parent
  function setTab(arg) {
    setTabNo(arg);
    if (arg === "code") { 
      setCodeView(true);
    } else {
      setCodeView(false);
    }
  }

  // reset page when next or prev link is selected
  function resetPage() {
    setTabNo("scope");
    setCodeView(false);
    setHeadContent(null);
  }

  // Get height of the hero code block for height animations
  function setHeight(ref) {
    setHeadHeight(ref.current.getBoundingClientRect().height + 40);
  }

  // Writes pseudo code for hero content
  function toOpenCurl(code) {
    const curl = code.indexOf("{") + 1;
    const head = code.slice(0, curl).trim() + 
      `
    //-- PROVIDER:  freeCodeCamp(🔥) daily_coding_challenge   
    //-- HEADER:    ${post.title}
    //-- DEPLOYED:  ${post.published_at}
    //-- AUTHOR:    ${post.author_id?.display_name}\n
    ${post?.slang || randomLet()}\n}`;

    setHeadContent(head);
    return head;
  }

  // Get random "let something = something funny" for hero content
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

  // extract headings from markdown for conversion into contents page
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

  // convert header text into valid id string for markdown headings
  // contents page uses heading id's for navigation
  function slugify(text) {
    if (!text) return;
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  // setup navigation links, get next and prev post slug.
  // Nice to have, tool tip to say post name when hovering over link.
  // do later.
  async function getNeighbouringPosts() {
    const { data: next } = await supabase
      .from("challenge")
      .select("id, slug, title")
      .eq("published", true)
      .gt("published_at", post.published_at)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: prev } = await supabase
      .from("challenge")
      .select("id, slug, title")
      .eq("published", true)
      .lt("published_at", post.published_at)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setNext(next);
    setPrev(prev);
  }

  if (loading) return <p>Loading…</p>;
  if (err) return <p style={{ color: "crimson" }}>Error: {err}</p>;
  if (!post) return <p>Not found.</p>;

  return (
    <div id={isMobile ? "challenge-detail-mobile" : "challenge-detail"}>
      <div className="snippet hero-img" style={{maxHeight: headHeight, minHeight: headHeight}}>
        {!codeView && <pre onAnimationStart={() => setHeight(refCodeTitle)}>
          <code ref={refCodeTitle} className="language-javascript">{headContent ?? toOpenCurl(post.code)}</code>
        </pre> }
        {codeView && <pre onAnimationStart={() => setHeight(refCodeBody)}>
          <code ref={refCodeBody} className="language-javascript">{post.code}</code>
        </pre>}
      </div>

      <Tabs defaultValue="scope" setTab={setTab}>
        <Tab value="scope" label="Scope">
          <div className="challenge-scope">
            <div ref={refScope}>{post.scope}</div>
            <h2>Source</h2>
            <a href={post.source}>{post.source}</a>
          </div>
        </Tab>

        <Tab value="design" label="Design">
          <div className="challenge-design">
            <h2>Design Approach</h2>
            <div ref={refDesign}>{post.design}</div>
          </div>
        </Tab>

        <Tab value="code" label="Code">
          <h2>The Final Commit</h2>
          <p>See a better solution? Join the discussion below.</p>
          <Comments postId={post.id}></Comments>
        </Tab>
      </Tabs>

      <div className="challenge-rail-top">
        {!codeView && <h2>This Page</h2>}
        {(contents?.length > 0 && <ol>
          {Array.isArray(contents) && contents.map(h => (
            <li key={h.id} className={`level-${h.level}`}>
              <Link to={`/challenge/${slug}`} state={{ scrollTo: h.id }}>{h.text}</Link>
            </li>
          ))}
        </ol>) || !codeView && <ol>empty</ol> }
      </div>

      <div className="challenge-rail-btm">
        <p>See more posts</p>
        <div className="rail-controls">
          {prevPost && (<Link to={`/challenge/${prevPost?.slug}`} onClick={resetPage}>
            <p>← prev</p>
          </Link>) || <p>⨯ prev</p>}
          <Link to="/challenge">
            <p>main</p>
          </Link>
          {nextPost && (<Link to={`/challenge/${nextPost?.slug}`} onClick={resetPage}>
            <p>next →</p>
          </Link>) || <p>next ⨯</p>}
        </div>
      </div>
    </div>
  );
}