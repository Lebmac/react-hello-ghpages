import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./Admin";

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminChallenge() {
  const { session, user, signOut } = useAuth();

  // posts
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // editor
  const [visible, setVisible] = useState(0);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [source, setSource] = useState("");
  const [scope, setScope] = useState("");
  const [code, setCode] = useState("");
  const [design, setDesign] = useState("");
  const [featured, setFeatured] = useState("");
  const [published, setPublished] = useState(false);

  // messages and loading
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const isEditing = useMemo(() => Boolean(activeId), [activeId]);


  useEffect(() => {
    if (!session) return;
    loadPosts();
  }, [session]);

  async function loadPosts() {
    setLoadingPosts(true);
    setErr("");
    setMsg("");

    const { data, error } = await supabase
      .from("challenge")
      .select("id,title,slug,source,scope,code,design,featured,published,published_at,updated_at,author_id")
      .order("updated_at", { ascending: false });

    if (error) setErr(error.message);
    else setPosts(data ?? []);

    setLoadingPosts(false);
  }

  async function loadComments() {
    if (visible === 2) {
      setVisible(0);
      return;
    }
    setVisible(2);
    setLoadingComments(true);
    setErr("");
    setMsg("");

    const { data, error } = await supabase
      .from("blog_comments")
      .select()
      .eq("approved", false)
      .order("created_at", { ascending: false });

    if (error) setErr(error.message);
    else setComments(data ?? []);

    setLoadingComments(false);
  }

  function resetEditor() {
    setActiveId(null);
    setTitle("");
    setSlug("");
    setSource("");
    setScope("");
    setCode("");
    setDesign("");
    setFeatured("");
    setPublished("");
  }

  function startNew() {
    resetEditor();
    setMsg("New post");
    setVisible(1);
  }

  function startEdit(post) {
    setActiveId(post.id);
    setTitle(post.title ?? "");
    setSlug(post.slug ?? "");
    setPublished(Boolean(post.published));
    fetchContent(post.id);
    setVisible(1);
  }

  async function fetchContent(id) {
    setErr("");
    const { data, error } = await supabase
      .from("challenge")
      .select("id,title,slug,source,scope,code,design,featured,published,published_at,updated_at,author_id")
      .eq("id", id)
      .maybeSingle();

    if (error) setErr(error.message);
    else {
      setSource(data?.source ?? "");
      setScope(data?.scope ?? "");
      setCode(data?.code ?? "");
      setDesign(data?.design ?? "");
      setFeatured(Boolean(data?.featured));
    }
  }


  async function savePost() {
    setErr("");
    setMsg("");

    const finalTitle = title.trim();
    const finalSlug = (slug.trim() || slugify(finalTitle)).slice(0, 120);

    if (!finalTitle) return setErr("Title is required.");
    if (!finalSlug) return setErr("Slug is required.");

    const payload = {
      title: finalTitle,
      slug: finalSlug,
      source: source ?? "",
      scope: scope ?? "",
      code: code ?? "",
      design: design ?? "",
      featured: Boolean(featured),
      published: Boolean(published),
      published_at: published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (!isEditing) {
      const { error } = await supabase.from("challenge").insert([payload]);
      if (error) return setErr(error.message);
      setMsg("Created.");
    } else {
      const { error } = await supabase.from("challenge").update(payload).eq("id", activeId);
      if (error) return setErr(error.message);
      setMsg("Saved.");
    }

    await loadPosts();
    resetEditor();
    setVisible(0);
  }

  async function deletePost(id) {
    if (!confirm("Delete this post?")) return;
    setErr("");
    setMsg("");

    const { error } = await supabase.from("challenge").delete().eq("id", id);
    if (error) return setErr(error.message);

    setMsg("Deleted.");
    await loadPosts();
    if (activeId === id) resetEditor();
  }

  async function togglePublished(post) {
    setErr("");
    setMsg("");

    const next = !post.published;
    const { error } = await supabase
      .from("challenge")
      .update({
        published: next,
        published_at: next ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    if (error) return setErr(error.message);

    await loadPosts();
  }

  async function approveComment(id) {
    console.log(id);
    setErr("");
    setMsg("");

    const { error } = await supabase
      .from("blog_comments")
      .update({ approved: true })
      .eq("uuid", id);

    if (error) return setErr(error.message);

    setComments(prev =>
      prev.map(c =>
        c.uuid === id ? { ...c, approved: true } : c
      )
    );
  }

  async function deleteComment(id) {
    if (!confirm("Delete this post?")) return;
    setErr("");
    setMsg("");

    const { error } = await supabase
      .from("blog_comments")
      .delete()
      .eq("uuid", id);
    if (error) return setErr(error.message);

    setMsg("Deleted.");

    setComments(prev => prev.filter(c => c.uuid !== id));
  }


  return (
    <>
      <div className="controls">
        {err && <p className="msg" style={{ color: "red" }}>Error: {err}</p>}
        <button className="newbtn" onClick={startNew}>＋</button>
        <button className="mailbtn" onClick={loadComments} disabled={loadingComments}>✉</button>
        <button className="refreshbtn" onClick={loadPosts} disabled={loadingPosts}>↺</button>
      </div>

      {/* list all challenge posts */}
      {visible===0 && (
      <ul className="challenge-list">
        {posts.map((p) => (
          <li key={p.id}>
            <h3 className="title">{p.title}</h3>
            <div className="controls">
              <button onClick={() => startEdit(p)}>✎<span className="tooltiptext">Some tooltip text</span></button>
              <button onClick={() => togglePublished(p)}>{p.published ? "⇏" : "⇒"}</button>
              <button onClick={() => deletePost(p.id)} className="danger">🗑</button>
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              /challenge/{p.slug} — {p.published ? "Published" : "Draft"} — updated{" "}
              {p.updated_at ? new Date(p.updated_at).toLocaleString() : ""}
            </div>
          </li>
        ))}
      </ul>
      )}

      {/* display editor */}
      {visible===1 && (
      <div className="editor">
        <h2>{isEditing ? "Edit post" : "New post"}</h2>

        <label>
          Title
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(slugify(e.target.value));
            }}
          />
        </label>

        <label>
          Source
          <input
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
            }}
          />
        </label>

        <label>
          Scope
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            rows={8}
          />
        </label>

        <label>
          Code
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={8}
          />
        </label>

        <label>
          Design
          <textarea
            value={design}
            onChange={(e) => setDesign(e.target.value)}
            rows={8}
          />
        </label>

        <label>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured Post
        </label>

        <label>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>

        <div className="editor-controls">
          <button onClick={savePost}>{isEditing ? "Save" : "Create"}</button>
          <button onClick={() => {resetEditor(); setVisible(0);}} type="button">Cancel</button>
        </div>
      </div>
      )}

      {visible===2 && (
      <ul className="challenge-list">
        {comments.map((c) => (
          <li key={c.id}>
            <h3 className="title">{c.title}</h3>
            <p className="body">{c.content}</p>
            <div className="controls">
              <button onClick={() => approveComment(c.uuid)} style={c.approved ? { backgroundColor: "lightgreen", borderColor:"lightgreen" } : {}}>✓</button>
              <button onClick={() => deleteComment(c.uuid)} className="danger">🗑</button>
            </div>
            <div className="details" style={{ fontSize: 12, opacity: 0.7 }}>
              Author {c.name} — created{" "}
              {c.created_at ? new Date(c.created_at).toLocaleString() : ""} — {" "}
              {c.approved ? "Approved" : "Pending Approval"}
            </div>
          </li>
        ))}
      </ul>
      )}
    </>
  );
}