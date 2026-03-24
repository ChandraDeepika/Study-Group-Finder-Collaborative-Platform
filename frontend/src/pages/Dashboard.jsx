import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CourseList from "../components/CourseList";
import AvailableGroups from "../components/AvailableGroups";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [userName, setUserName] = useState("");
  const [courseCount, setCourseCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchStats = async () => {
    try {
      const [profileRes, coursesRes, groupsRes, pendingRes] = await Promise.all([
        fetch("http://localhost:8080/api/profile/me", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/courses/my",  { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/groups/my-groups", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/groups/my-pending-ids", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (profileRes.status === 401 || profileRes.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (profileRes.ok) { const d = await profileRes.json(); setUserName(d.name || ""); }
      if (coursesRes.ok) { const d = await coursesRes.json(); setCourseCount(d.length); }
      if (groupsRes.ok)  { const d = await groupsRes.json();  setGroupCount(d.length); }
      if (pendingRes.ok) { const d = await pendingRes.json(); setPendingCount(d.length); }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchStats();
  }, [token, navigate]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const QUICK_LINKS = [
    { icon: "🔍", label: "Explore Courses", bg: "#eff6ff", path: "/explore-courses" },
    { icon: "👥", label: "Find Groups",     bg: "#f0fdf4", path: "/groups" },
    { icon: "📚", label: "My Courses",      bg: "#fdf4ff", path: "/my-courses" },
    { icon: "⚙️", label: "Admin Panel",     bg: "#fff7ed", path: "/admin/requests" },
  ];

  return (
    <Layout>
      <div className="dash-wrapper">

        {/* Welcome Banner */}
        <div className="dash-banner">
          <div className="dash-banner-content">
            <p className="dash-banner-greeting">{greeting} 👋</p>
            <h1>Welcome back{userName ? `, ${userName}` : ""}!</h1>
            <p className="dash-banner-sub">Here's what's happening with your studies today.</p>
            <div className="dash-banner-actions">
              <button className="dash-banner-btn" onClick={() => navigate("/explore-courses")}>
                📚 Explore Courses
              </button>
              <button className="dash-banner-btn dash-banner-btn-outline" onClick={() => navigate("/groups")}>
                👥 Find Groups
              </button>
            </div>
          </div>
          <div className="dash-banner-img-panel">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80"
              alt="Students studying together"
            />
            <div className="dash-banner-img-overlay" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="dash-quick-links">
          {QUICK_LINKS.map(q => (
            <div key={q.label} className="dash-quick-link" onClick={() => navigate(q.path)}>
              <div className="dash-quick-link-icon" style={{ background: q.bg }}>{q.icon}</div>
              <span className="dash-quick-link-label">{q.label}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat-card" onClick={() => navigate("/my-courses")}>
            <div className="dash-stat-icon" style={{ background: "#eff6ff" }}>📚</div>
            <div className="dash-stat-num" style={{ color: "#2563eb" }}>{courseCount}</div>
            <div className="dash-stat-label">Enrolled Courses</div>
            <div className="dash-stat-sub">Courses you're part of</div>
          </div>
          <div className="dash-stat-card" onClick={() => navigate("/groups")}>
            <div className="dash-stat-icon" style={{ background: "#f0fdf4" }}>👥</div>
            <div className="dash-stat-num" style={{ color: "#16a34a" }}>{groupCount}</div>
            <div className="dash-stat-label">Study Groups</div>
            <div className="dash-stat-sub">Groups you've joined</div>
          </div>
          <div className="dash-stat-card" onClick={() => navigate("/admin/requests")}>
            <div className="dash-stat-icon" style={{ background: "#fef3c7" }}>⏳</div>
            <div className="dash-stat-num" style={{ color: "#d97706" }}>{pendingCount}</div>
            <div className="dash-stat-label">Pending Requests</div>
            <div className="dash-stat-sub">Waiting for approval</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: "#fce7f3" }}>🔥</div>
            <div className="dash-stat-num" style={{ color: "#e11d48" }}>{courseCount + groupCount}</div>
            <div className="dash-stat-label">Total Activity</div>
            <div className="dash-stat-sub">Courses + Groups</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="dash-grid">
          <div className="dash-section-card">
            <img
              className="dash-section-img"
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"
              alt="Library books"
            />
            <div className="dash-section-header">
              <div className="dash-section-icon">📚</div>
              <div>
                <h3>Enrolled Courses</h3>
                <p>{courseCount} courses enrolled</p>
              </div>
            </div>
            <div className="dash-section-body">
              <CourseList onEnrol={fetchStats} />
              <button className="browse-btn" onClick={() => navigate("/explore-courses")}>
                Browse All Courses →
              </button>
            </div>
          </div>

          <div className="dash-section-card">
            <img
              className="dash-section-img"
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
              alt="Students in a group"
            />
            <div className="dash-section-header">
              <div className="dash-section-icon" style={{ background: "#f0fdf4" }}>👥</div>
              <div>
                <h3>My Study Groups</h3>
                <p>{groupCount} groups joined</p>
              </div>
            </div>
            <div className="dash-section-body">
              <AvailableGroups />
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
