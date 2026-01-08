import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import cjLogo from "../assets/logo.svg";

export default function Title() {
 return (
 <div id="title">
  <img src={cjLogo} alt="Campbell Jamieson Logo" />
  <h1><span>C</span>AMPBELL <span>J</span>AMIESON</h1>
 </div>);
}