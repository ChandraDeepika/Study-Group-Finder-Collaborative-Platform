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

  return (
    <Layout>
      <div className="dash-wrapper">

        {/* Welcome Banner */}
        <div className="dash-banner">
          <div className="dash-banner-content">
            <div className="dash-banner-text">
              <p className="dash-banner-greeting">{greeting} 👋</p>
              <h1>Welcome back{userName ? `, ${userName}` : ""}!</h1>
              <p className="dash-banner-sub">Here's what's happening with your studies today.</p>
            </div>
            <div className="dash-banner-actions">
              <button className="dash-banner-btn" onClick={() => navigate("/explore-courses")}>
                📚 Explore Courses
              </button>
              <button className="dash-banner-btn dash-banner-btn-outline" onClick={() => navigate("/groups")}>
                👥 Find Groups
              </button>
            </div>
          </div>
          <div className="dash-banner-illustration">
            <div className="dash-illus-circle c1">📚</div>
            <div className="dash-illus-circle c2">💬</div>
            <div className="dash-illus-circle c3">🚀</div>
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat-card" onClick={() => navigate("/my-courses")} style={{ cursor: "pointer" }}>
            <div className="dash-stat-icon" style={{ background: "#eff6ff" }}>📚</div>
            <div className="dash-stat-num" style={{ color: "#2563eb" }}>{courseCount}</div>
            <div className="dash-stat-label">Enrolled Courses</div>
            <div className="dash-stat-sub">Courses you're part of</div>
          </div>
          <div className="dash-stat-card" onClick={() => navigate("/groups")} style={{ cursor: "pointer" }}>
            <div className="dash-stat-icon" style={{ background: "#f0fdf4" }}>👥</div>
            <div className="dash-stat-num" style={{ color: "#16a34a" }}>{groupCount}</div>
            <div className="dash-stat-label">Study Groups</div>
            <div className="dash-stat-sub">Groups you've joined</div>
          </div>
          <div className="dash-stat-card" onClick={() => navigate("/admin/requests")} style={{ cursor: "pointer" }}>
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
            <div className="dash-section-header">
              <div className="dash-section-icon">📚</div>
              <div>
                <h3>Enrolled Courses</h3>
                <p>{courseCount} courses enrolled</p>
              </div>
            </div>
            <CourseList onEnrol={fetchStats} />
            <button className="browse-btn" onClick={() => navigate("/explore-courses")}>
              Browse All Courses →
            </button>
          </div>

          <div className="dash-section-card">
            <div className="dash-section-header">
              <div className="dash-section-icon" style={{ background: "#f0fdf4" }}>👥</div>
              <div>
                <h3>My Study Groups</h3>
                <p>{groupCount} groups joined</p>
              </div>
            </div>
            <AvailableGroups />
          </div>
        </div>

      </div>
    </Layout>
  );
}
