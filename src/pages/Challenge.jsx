import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import CardChallenge from "../components/CardChallenge.jsx";
import Hero from "../components/Hero.jsx";

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
    <>
      <Hero 
        title="Daily Code Challenges"
        description={[
          `These posts document my approach to daily coding challenges. They capture how I interpret a problem and reason my way to a solution, then reflect on its application to real-world contexts.`,
          `Browse the entries below.`]}
      />
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
    </>
  );
}
