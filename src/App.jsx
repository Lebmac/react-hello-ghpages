import { Routes, Route } from "react-router-dom";
import Canvas from "./components/Canvas.jsx";
import Gallery from "./pages/Gallery.jsx";
import Project from "./pages/Project.jsx";
import Challenge from "./pages/Challenge.jsx";
import PostChallenge from "./pages/PostChallenge.jsx";
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
          <Route path="/projects" element={<Project />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/challenge/:slug" element={<PostChallenge />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      <Footer />
    </ Canvas>
  );
}