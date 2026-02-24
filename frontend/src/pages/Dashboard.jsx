import Layout from "../components/Layout";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <Layout>
      <div className="dashboard-wrapper">

        <div className="welcome-card">
          <div>
            <h1>Welcome back, Alex</h1>
            <p>Here's what's happening with your studies today.</p>
          </div>
        </div>

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

        <div className="content-grid">
          <div className="content-card">
            <h3>Enrolled Courses</h3>
            <ul>
              <li>Data Structures</li>
              <li>Operating Systems</li>
              <li>Computer Networks</li>
            </ul>
          </div>

          <div className="content-card">
            <h3>Suggested Groups</h3>
            <ul>
              <li>DSA Evening Batch</li>
              <li>OS Interview Prep</li>
              <li>Signals Crash Group</li>
            </ul>
          </div>
        </div>

      </div>
    </Layout>
  );
}