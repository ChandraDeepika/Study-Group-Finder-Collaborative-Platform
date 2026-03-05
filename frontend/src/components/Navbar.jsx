import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="nav-logo">StudyConnect</div>

      {/* Links */}
      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
<NavLink to="/explore-courses">Explore Courses</NavLink>
<NavLink to="/my-courses">My Courses</NavLink>
<NavLink to="/groups">Groups</NavLink>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>

        {/* Profile avatar + dropdown */}
        {user && (
          <div
            className="profile-wrapper"
            onClick={() => setShowProfile((prev) => !prev)}
          >
            <div className="profile-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <span className="profile-name">{user.name}</span>

            {showProfile && (
              <div className="profile-dropdown">
                <h4>Profile Summary</h4>
                <p><strong>Name:</strong> {user.name || "Not set"}</p>
                <p><strong>Email:</strong> {user.email || "Not set"}</p>
                <p><strong>Location:</strong> {user.location || "Not set"}</p>
                <p><strong>Education:</strong> {user.education || "Not set"}</p>
                <p><strong>Field:</strong> {user.field || "Not set"}</p>
                <p><strong>Skills:</strong> {user.skills || "Not set"}</p>
                <p><strong>Bio:</strong> {user.bio || "Not set"}</p>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </nav>
  );
}

export default Navbar;
