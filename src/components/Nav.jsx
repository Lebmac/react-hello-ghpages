import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Nav() {

  return (
    <div id="nav">
      <Link to="/">Gallery</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/challenge">Code Challenge</Link>
      <Link to="/tools">Engineering Tools</Link>
      <Link to="/about">About</Link>
      <Link to="/about">Contact</Link>
      <hr/>
      <Link to="/admin">Admin</Link>
    </div>
  );
}