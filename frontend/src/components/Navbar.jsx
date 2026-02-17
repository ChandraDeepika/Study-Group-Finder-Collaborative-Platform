import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2>StudyGroup</h2>
      </div>

      <div className="navbar-right">
        <Link to="/" className="nav-link">Dashboard</Link>
        <Link to="/courses" className="nav-link">Courses</Link>
        <button className="nav-btn logout">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
