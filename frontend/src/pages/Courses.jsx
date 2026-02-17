import Navbar from "../components/Navbar";

function Courses() {
  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">All Courses</h1>

        <div className="course-card">
          <p>Data Structures</p>
          <p>Signals & Systems</p>
          <p>Computer Networks</p>
          <p>Operating Systems</p>
        </div>
      </div>
    </>
  );
}

export default Courses;
