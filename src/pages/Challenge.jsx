import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import CardChallenge from "../components/CardChallenge.jsx";

export default function Challenge() {
  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("challenge")
        .select("id,title,slug,source,scope,code,design,featured,published_at,updated_at")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("featured", { ascending: false, nullsFirst: false });

      if (cancelled) return;

      if (error) setError(error.message);
      else setCards(data ?? []);

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "crimson" }}>Error: {error}</p>;

  return (
    <div id="challenge">
      {cards.length < 1 ? (
        <p>No published posts yet.</p>
      ) : (
        <ul className="list">
          {cards.map((card, i) => (
            <CardChallenge key={i} data={card} />
          ))}
        </ul>
      )}
    </div>
  );
}
