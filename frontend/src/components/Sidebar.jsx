import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div>
        <h2 className="logo">StudyConnect</h2>

        <nav className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/groups">Groups</NavLink>
        </nav>
      </div>

      <button className="logout-btn">Logout</button>
    </div>
  );
}