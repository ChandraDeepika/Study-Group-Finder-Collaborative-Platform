import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CourseList from "../components/CourseList";
import AvailableGroups from "../components/AvailableGroups";
import "../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="dashboard-wrapper">

        {/* Welcome Section */}
        <div className="welcome-card">
          <div>
            <h1>Welcome back 👋</h1>
            <p>Here's what's happening with your studies today.</p>
          </div>
        </div>

        {/* Stats Section */}
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

        {/* Dynamic Components Section */}
        <div className="content-grid">
          <div className="content-card">
            <h3>Enrolled Courses</h3>
            <CourseList />
          </div>
          <div className="content-card">
            <h3>Available Groups</h3>
            <AvailableGroups />
          </div>
        </div>

      </div>
    </Layout>
  );
}
