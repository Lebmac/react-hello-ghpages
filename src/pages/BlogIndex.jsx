import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("posts")
        .select("id,title,slug,published_at,updated_at")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false });

      if (cancelled) return;

      if (error) setErr(error.message);
      else setPosts(data ?? []);

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (err) return <p style={{ color: "crimson" }}>Error: {err}</p>;

  return (
    <main>
      <h1>Posts</h1>

      {posts.length === 0 ? (
        <p>No published posts yet.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {posts.map((p) => (
            <li key={p.id} style={{ marginBottom: 10 }}>
              <Link to={`/post/${p.slug}`}>{p.title}</Link>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {p.published_at ? new Date(p.published_at).toLocaleString() : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
