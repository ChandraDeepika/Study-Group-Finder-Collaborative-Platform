import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CourseList from "../components/CourseList";
import AvailableGroups from "../components/AvailableGroups";
import "../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
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
          setUserName(data.name || "");
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <Layout>
      <div className="dashboard-wrapper">

        {/* Welcome */}
        <div className="welcome-card">
          <h1>Welcome back{userName ? `, ${userName}` : ""} 👋</h1>
          <p>Here's what's happening with your studies today.</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-number">4</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">3</div>
            <div className="stat-label">Study Groups</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">75%</div>
            <div className="stat-label">Learning Progress</div>
          </div>
        </div>

        {/* Content */}
        <div className="content-grid">
          <div className="content-card">
            <h3>Enrolled Courses</h3>
            <CourseList />
          </div>
          <div className="content-card">
            <h3>Suggested Groups</h3>
            <AvailableGroups />
          </div>
        </div>

      </div>
    </Layout>
  );
}
