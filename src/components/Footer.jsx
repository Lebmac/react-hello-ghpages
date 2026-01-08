import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";


export default function Footer() {
  const date = new Date().getFullYear();

  return (
  <footer>
    <span>© {date > 2026 ? `2026–${date}` : 2026}{" "} Campbell Jamieson. All rights reserved.</span>
  </footer>
  );
}
