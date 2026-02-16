import React, { useEffect, useState } from "react";
import ProfileCard from "../components/ProfileCard";
import CoursesSection from "../components/CoursesSection";
import SuggestedPeers from "../components/SuggestedPeers";
import {
  fetchUserProfile,
  fetchCourses,
  fetchPeers
} from "../services/dashboardService";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const userData = await fetchUserProfile();
        const courseData = await fetchCourses();
        const peerData = await fetchPeers();

        setUser(userData);
        setCourses(courseData);
        setPeers(peerData);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <div className="dashboard-container">Loading...</div>;
  if (error) return <div className="dashboard-container">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <div className="dashboard-grid">
        {user && <ProfileCard user={user} />}
        <CoursesSection courses={courses} setCourses={setCourses} />
        <SuggestedPeers peers={peers} />
      </div>
    </div>
  );
};

export default Dashboard;
