import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import CourseList from "../components/CourseList";
import AvailableGroups from "../components/AvailableGroups";

import "../styles/dashboard.css";

function Dashboard() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userId"); // ✅ only remove auth
    navigate("/login");
  };

  return (
    <>
      <Navbar onLogout={handleLogout} />

      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard Overview</h1>

        <ProfileCard />

        <div className="dashboard-sections">
          <CourseList />
          <AvailableGroups />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
