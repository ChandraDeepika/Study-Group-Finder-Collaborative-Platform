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
        fetch("http://localhost:8080/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8080/api/courses/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8080/api/groups/my-groups", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8080/api/groups/my-pending-ids", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profileRes.status === 401 || profileRes.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setUserName(data.name || "");
      }

      if (coursesRes.ok) {
        const courses = await coursesRes.json();
        setCourseCount(courses.length);
      }

      if (groupsRes.ok) {
        const groups = await groupsRes.json();
        setGroupCount(groups.length);
      }

      if (pendingRes.ok) {
        const pending = await pendingRes.json();
        setPendingCount(pending.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchStats();
  }, [token, navigate]);

  return (
    <Layout>
      <div className="dash-wrapper">

        {/* Welcome Banner */}
        <div className="dash-banner">
          <h1>Welcome back{userName ? `, ${userName}` : ""} 👋</h1>
          <p>Here's what's happening with your studies today.</p>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: "#eff6ff" }}>📚</div>
            <div className="dash-stat-num" style={{ color: "#2563eb" }}>{courseCount}</div>
            <div className="dash-stat-label">Enrolled Courses</div>
            <div className="dash-stat-sub">Courses you're part of</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: "#f0fdf4" }}>👥</div>
            <div className="dash-stat-num" style={{ color: "#16a34a" }}>{groupCount}</div>
            <div className="dash-stat-label">Study Groups</div>
            <div className="dash-stat-sub">Groups you've joined</div>
          </div>
          <div className="dash-stat-card">
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