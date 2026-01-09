import { Routes, Route, Link } from "react-router-dom";
import Gallery from "./pages/Gallery.jsx";
import BlogIndex from "./pages/BlogIndex.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import Admin from "./pages/Admin.jsx";
import Title from "./components/Title.jsx";
import Nav from "./components/Nav.jsx"
import Footer from "./components/Footer.jsx";
import './App.css';

export default function App() {
  return (
    <div id="canvas">
      <Title />
      <Nav />
      <div id="page">
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/post/:slug" element={<BlogPost />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      <Footer />
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