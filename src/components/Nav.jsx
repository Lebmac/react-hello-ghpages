import { useEffect, useState, useStore } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useIsMobile } from '../hooks/useIsMobile';
import Logo from "./Logo";
import NavLinks from "./NavLinks";

export default function Nav() {
  const { isMobile, isLoading } = useIsMobile();
  const [open, setOpen] = useState(false);

  const invert = {
    backgroundColor: "black",
  }

  const hidden = {
    display: "none",
  }

  function getNav(shrink) {
    if (shrink) {
      return (
        <div id="nav-bar" style={open&&invert||{}}>
          <div id="permanent">
            <Logo invert={open}/>
            <button className={open?"open":"closed"}
              type="button"
              aria-expanded={open}
              aria-controls="nav-menu"
              aria-haspopup="menu"
              onClick={() => setOpen((toggle) => !toggle)}
            >
              ☰
            </button>
          </div>
          <nav id="nav-menu" style={!open?hidden:undefined}>
            <NavLinks />
          </nav>
        </div>);
    } else {
      return (
        <nav id="nav">
          <NavLinks />
        </nav>
      );
    }
  }

  return getNav(isMobile || isLoading);
}