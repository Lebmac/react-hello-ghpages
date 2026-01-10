import { Link } from "react-router-dom";

export default function NavLinks() {
  return (
    <>
      <Link to="/">Gallery</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/challenge">Code Challenge</Link>
      <Link to="/tools">Engineering Tools</Link>
      <Link to="/about">About</Link>
      <Link to="/about">Contact</Link>
      <hr/>
      <Link to="/admin">Admin</Link>
    </>
  );
}