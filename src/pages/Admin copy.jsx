import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Admin() {
  const [session, setSession] = useState(null);

  // auth form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // posts
  const [posts, setPosts] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // editor
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(false);

  const isEditing = useMemo(() => Boolean(activeId), [activeId]);

  useEffect(() => {
    // initial session + listener
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
      setMsg("");
      setErr("");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    loadPosts();
  }, [session]);

  async function loadPosts() {
    setLoadingPosts(true);
    setErr("");
    setMsg("");

    const { data, error } = await supabase
      .from("posts")
      .select("id,title,slug,published,published_at,updated_at,author_id")
      .order("updated_at", { ascending: false });

    if (error) setErr(error.message);
    else setPosts(data ?? []);

    setLoadingPosts(false);
  }

  function resetEditor() {
    setActiveId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setPublished(false);
  }

  function startNew() {
    resetEditor();
    setMsg("New post");
  }

  function startEdit(p) {
    setActiveId(p.id);
    setTitle(p.title ?? "");
    setSlug(p.slug ?? "");
    setPublished(Boolean(p.published));
    // fetch full content
    fetchContent(p.id);
  }

  async function fetchContent(id) {
    setErr("");
    const { data, error } = await supabase
      .from("posts")
      .select("content")
      .eq("id", id)
      .maybeSingle();

    if (error) setErr(error.message);
    else setContent(data?.content ?? "");
  }

  async function signIn(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
  }

  async function signOut() {
    setErr("");
    setMsg("");
    const { error } = await supabase.auth.signOut();
    if (error) setErr(error.message);
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
      content: content ?? "",
      published: Boolean(published),
      published_at: published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
      // author_id handled by default auth.uid() if you set it that way
    };

    if (!isEditing) {
      const { error } = await supabase.from("posts").insert([payload]);
      if (error) return setErr(error.message);
      setMsg("Created.");
    } else {
      const { error } = await supabase.from("posts").update(payload).eq("id", activeId);
      if (error) return setErr(error.message);
      setMsg("Saved.");
    }

    await loadPosts();
    resetEditor();
  }

  async function deletePost(id) {
    if (!confirm("Delete this post?")) return;
    setErr("");
    setMsg("");

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return setErr(error.message);

    setMsg("Deleted.");
    await loadPosts();
    if (activeId === id) resetEditor();
  }

  async function togglePublished(p) {
    setErr("");
    setMsg("");

    const next = !p.published;
    const { error } = await supabase
      .from("posts")
      .update({
        published: next,
        published_at: next ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id);

    if (error) return setErr(error.message);

    setMsg(next ? "Published." : "Unpublished.");
    await loadPosts();
  }

  // --- UI: if not logged in, show login ---
  if (!session) {
    return (
      <main>
        <h1>Admin</h1>
        <p>Login to manage posts.</p>

        <form onSubmit={signIn} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          <button type="submit" style={{ padding: 10 }}>Sign in</button>

          {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
        </form>
      </main>
    );
  }

  // --- UI: logged in, show dashboard ---
  return (
    <main>
      <h1>Admin</h1>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          Logged in as {session.user.email}
        </span>
        <button onClick={signOut}>Sign out</button>
      </div>

      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left: list */}
        <section>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Posts</h2>
            <button onClick={startNew}>+ New</button>
            <button onClick={loadPosts} disabled={loadingPosts}>
              {loadingPosts ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          <ul style={{ paddingLeft: 18 }}>
            {posts.map((p) => (
              <li key={p.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <button onClick={() => startEdit(p)}>Edit</button>
                  <button onClick={() => deletePost(p.id)} style={{ color: "crimson" }}>Delete</button>
                  <button onClick={() => togglePublished(p)}>
                    {p.published ? "Unpublish" : "Publish"}
                  </button>
                  <strong>{p.title}</strong>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  /post/{p.slug} — {p.published ? "Published" : "Draft"} — updated{" "}
                  {p.updated_at ? new Date(p.updated_at).toLocaleString() : ""}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Right: editor */}
        <section>
          <h2 style={{ marginTop: 0 }}>{isEditing ? "Edit post" : "New post"}</h2>

          <div style={{ display: "grid", gap: 10 }}>
            <label>
              Title
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slug.trim()) setSlug(slugify(e.target.value));
                }}
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label>
              Slug
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from title if blank"
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Published
            </label>

            <label>
              Content
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                style={{ width: "100%", padding: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
              />
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={savePost}>{isEditing ? "Save" : "Create"}</button>
              <button onClick={resetEditor} type="button">Clear</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
