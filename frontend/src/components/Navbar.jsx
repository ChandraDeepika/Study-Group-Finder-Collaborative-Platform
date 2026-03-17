import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import ProfileDropdown from "./ProfileDropdown";
import NotificationBell from "./NotificationBell";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/dashboard",       label: "Dashboard" },
  { to: "/explore-courses", label: "Explore Courses" },
  { to: "/my-courses",      label: "My Courses" },
  { to: "/groups",          label: "Groups" },
  { to: "/admin/requests",  label: "Admin" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo" onClick={() => navigate("/dashboard")}>
          <span className="navbar-logo-icon">📚</span>
          <span className="navbar-logo-text">StudyConnect</span>
        </div>

        <nav className="navbar-links">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-right">
          <button className="navbar-theme-btn" onClick={toggle} title={dark ? "Light mode" : "Dark mode"}>
            {dark ? "☀️" : "🌙"}
          </button>
          <NotificationBell />
          <ProfileDropdown />
          <button className="navbar-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
}
