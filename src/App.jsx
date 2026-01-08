import { Routes, Route, Link } from "react-router-dom";
import BlogIndex from "./pages/BlogIndex.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import Admin from "./pages/Admin.jsx";
import Title from "./components/Title.jsx";
import Footer from "./components/Footer.jsx";
import CjLogo from './assets/logo.svg'
import './App.css'

export default function App() {
  return (
    <div id="canvas">
      <div id="title">
        <CjLogo />
      </div>
      <div id="nav">
        <header style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
          <Link to="/" style={{ textDecoration: "none" }}><strong>My Blog</strong></Link>
          <Link to="/admin">Admin</Link>
        </header>
      </div>
      <div id="page">
        <Routes>
          <Route path="/" element={<BlogIndex />} />
          <Route path="/post/:slug" element={<BlogPost />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      <div id="foot">
        <Footer />
      </div>
    </div>
  );
}


/*     <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
        <Link to="/" style={{ textDecoration: "none" }}><strong>My Blog</strong></Link>
        <Link to="/admin">Admin</Link>
      </header>

      <Routes>
        <Route path="/" element={<BlogIndex />} />
        <Route path="/post/:slug" element={<BlogPost />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div> */