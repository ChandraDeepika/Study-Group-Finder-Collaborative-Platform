import { Link } from "react-router-dom";

function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2>StudyGroup</h2>
      </div>

      <div className="navbar-right">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/courses" className="nav-link">Courses</Link>

        <button
          className="nav-btn logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
