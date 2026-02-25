import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

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

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}
