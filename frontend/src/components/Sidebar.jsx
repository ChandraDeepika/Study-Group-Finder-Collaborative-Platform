import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard",       label: "Dashboard",       icon: "🏠" },
  { to: "/explore-courses", label: "Explore Courses", icon: "🔍" },
  { to: "/my-courses",      label: "My Courses",      icon: "📚" },
  { to: "/groups",          label: "Groups",          icon: "👥" },
  { to: "/admin/requests",  label: "Admin",           icon: "⚙️" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">📚</span>
          <span className="sidebar-logo-text">StudyConnect</span>
        </div>

        <div className="sidebar-nav-label">Main Menu</div>
        <nav className="nav-links">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink key={to} to={to}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-img-banner">
          <img
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80"
            alt="Study inspiration"
          />
          <div className="sidebar-img-banner-overlay">
            <div className="sidebar-img-banner-text">Ready to learn?</div>
            <div className="sidebar-img-banner-sub">Join a group today →</div>
          </div>
        </div>
      </div>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
