import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">

      {/* NAVBAR */}
      <div className="dashboard-navbar">
        <h2>📚 Study Group Finder</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* WELCOME */}
      <div className="dashboard-welcome">
        <h1>Welcome Back 👋</h1>
        <p>Connect. Collaborate. Succeed.</p>
      </div>

      {/* FEATURE CARDS */}
      <div className="dashboard-cards">

        <div
          className="dashboard-card"
          onClick={() => navigate("/profile")}
        >
          <h3>👤 My Profile</h3>
          <p>View or edit your academic profile</p>
        </div>

        <div className="dashboard-card">
          <h3>👥 Study Groups</h3>
          <p>Create or join study groups</p>
        </div>

        <div className="dashboard-card">
          <h3>🔍 Find Students</h3>
          <p>Search students by field & skills</p>
        </div>

        <div className="dashboard-card">
          <h3>📅 My Groups</h3>
          <p>See your joined study groups</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;