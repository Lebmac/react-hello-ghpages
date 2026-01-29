import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Comments({postId}) {
  const [loading, setLoading] = useState(null);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [comments, setComments] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [editVsbl, setEditVsbl] = useState(true);


  // get blog comments from supabase
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("blog_comments")
        .select()
        .eq("challenge_id", postId);

      if (cancelled) return;

      if (error) setErr(error.message);
      else {
        setComments(data);
      }  
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  async function saveComment() {
    setErr("");
    setMsg("");

    const trimTitle = title.trim();
    const trimBody = body.trim();
    const trimName = name.trim();

    if (!trimBody) return setErr("Comment is required.");
    if (!trimName) return setErr("Name is required.");

    const payload = {
      challenge_id: postId, 
      title: trimTitle ?? "",
      content: trimBody,
      name: trimName,
    };

    const { error } = await supabase.from("blog_comments").insert([payload]);
    if (error) return setErr(error.message);
    setMsg("Comment received! We'll approve it soon.");

    resetEditor();
    setEditVsbl(false);
  }

  function resetEditor() {
    setTitle("");
    setBody("");
    setName("");
  }

  if (loading) return <p>Loading comments.</p>

  return (
    <>
      <ul id="comment-list">
        {comments && comments.map((c) => (
          <>
          <li key={c.id}>
            {c.title && <h3>{c.title}</h3>}
            <p className="content">{c.content}</p>
            <p className="meta">By: {c.name}</p>
            <p className="meta">Date: {new Date(c.created_at).toLocaleString()}</p>
          </li>
          </>
        ))}
      </ul>

      <div className="editor">
        {editVsbl && <><label>
          Email*
          <input
            type="email"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </label>

        <label>
          Title
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
        </label>

        <label>
          Comment*
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
          />
        </label>
        <span style={{textAlign:"right"}}>Character limit: {body.length} / 60-400</span>

        <div className="editor-controls">
          <button onClick={saveComment}>Submit</button>
        </div></>}
        {err && <span className="err">Error: {err}</span>}
        {msg && <span className="msg">{msg}</span>}
      </div>
    </>
  )
}