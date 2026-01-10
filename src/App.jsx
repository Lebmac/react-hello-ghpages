import { Routes, Route, Link } from "react-router-dom";
import Canvas from "./components/Canvas.jsx";
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
    <Canvas>
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
    </ Canvas>
  );
}