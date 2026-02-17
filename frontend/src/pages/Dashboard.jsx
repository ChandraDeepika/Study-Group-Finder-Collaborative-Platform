import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import CourseList from "../components/CourseList";
import SuggestedPeers from "../components/SuggestedPeers";
import "../styles/dashboard.css";
import AvailableGroups from "../components/AvailableGroups";    


function Dashboard() {
  return (
    <>
      <Navbar />

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
