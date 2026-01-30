import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Loader from "../components/Loader";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("posts")
        .select("title,slug,content,published,published_at,updated_at")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (cancelled) return;

      if (error) setErr(error.message);
      else setPost(data);

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <Loader />;
  if (err) return <p style={{ color: "crimson" }}>Error: {err}</p>;
  if (!post) return <p>Not found.</p>;

  return (
    <main>
      <p><Link to="/">← Back</Link></p>
      <h1>{post.title}</h1>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>
        {post.published_at ? new Date(post.published_at).toLocaleString() : ""}
      </div>

      <article style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
        {post.content}
      </article>
    </main>
  );
}
