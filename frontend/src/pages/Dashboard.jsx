import "../styles/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome Back 👋</h1>
        <p>
          Manage your study groups, track meetings, and collaborate efficiently.
        </p>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>📚 Study Groups</h3>
          <p>Join and manage your active study groups.</p>
        </div>

        <div className="dashboard-card">
          <h3>📅 Meetings</h3>
          <p>Schedule and track upcoming group meetings.</p>
        </div>

        <div className="dashboard-card">
          <h3>👥 Collaboration</h3>
          <p>Connect and collaborate with peers easily.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
