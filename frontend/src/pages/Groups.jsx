import Layout from "../components/Layout";
import "../styles/page.css";

export default function Groups() {
  return (
    <Layout>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Study Groups</h1>
          <p>Join and collaborate with other students</p>
        </div>

        <div className="courses-grid">
          <div className="course-card">
            <h3>DSA Evening Batch</h3>
            <p>24 Members</p>
            <button>Join Group</button>
          </div>

          <div className="course-card">
            <h3>OS Interview Prep</h3>
            <p>18 Members</p>
            <button>Join Group</button>
          </div>

          <div className="course-card">
            <h3>Signals Crash Group</h3>
            <p>12 Members</p>
            <button>Join Group</button>
          </div>

          <div className="course-card">
            <h3>Networks Discussion</h3>
            <p>30 Members</p>
            <button>Join Group</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}