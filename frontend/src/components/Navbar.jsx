import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h2 className="logo">Study Group Finder</h2>

      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/studygroups">Study Groups</Link>
      </div>
    </nav>
  );
};

export default Navbar;
