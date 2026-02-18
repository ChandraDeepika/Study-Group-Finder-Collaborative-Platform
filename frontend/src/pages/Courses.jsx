import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

function Courses() {

  const courses = [
    "Data Structures",
    "Signals & Systems",
    "Computer Networks",
    "Operating Systems"
  ];

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h1 className="dashboard-title">All Courses</h1>

        <div className="courses-grid">
          {courses.map((course, index) => (
            <div key={index} className="course-card-modern">
              <h3>{course}</h3>
              <p>Click to explore study groups</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Courses;
