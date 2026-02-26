import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile-dropdown.css";

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-dropdown-btn">
        <div className="profile-dropdown-avatar placeholder" />
        <span className="profile-dropdown-name">Loading...</span>
      </div>
    );
  }

  const displayName = profile?.name || "Profile";
  const initial = displayName.charAt(0).toUpperCase();
  const hasImage = !!profile?.profileImageBase64;

  return (
    <div
      className={`profile-dropdown-wrap ${open ? "is-open" : ""}`}
      ref={dropdownRef}
    >
      {/* Trigger button */}
      <button
        type="button"
        className="profile-dropdown-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {hasImage ? (
          <img
            src={profile.profileImageBase64}
            alt="Profile"
            className="profile-dropdown-avatar img"
          />
        ) : (
          <div className="profile-dropdown-avatar placeholder">
            <span>{initial}</span>
          </div>
        )}
        <span className="profile-dropdown-name">{displayName}</span>
        <span className="profile-dropdown-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="profile-dropdown-panel">
          <div className="profile-dropdown-card">
            <h3>Profile Summary</h3>

            <div className="profile-dropdown-image-wrap">
              {hasImage ? (
                <img
                  src={profile.profileImageBase64}
                  alt="Profile"
                  className="profile-dropdown-image"
                />
              ) : (
                <div className="profile-dropdown-image-placeholder">
                  <span>{initial}</span>
                </div>
              )}
            </div>

            <p><strong>Name:</strong> {profile?.name || "Not set"}</p>
            <p><strong>Email:</strong> {profile?.email || "Not set"}</p>
            <p><strong>Location:</strong> {profile?.location || "Not set"}</p>
            <p><strong>Education:</strong> {profile?.educationLevel || "Not set"}</p>
            <p><strong>Field:</strong> {profile?.field || "Not set"}</p>
            <p><strong>Skills:</strong> {profile?.skills || "Not set"}</p>
            <p><strong>Bio:</strong> {profile?.bio || "Not set"}</p>

            <button className="profile-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
