import Layout from "../components/Layout";
import "../styles/page.css";

export default function Courses() {
  return (
    <Layout>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Courses</h1>
          <p>Browse and manage your enrolled courses</p>
        </div>

        <div className="courses-grid">
          <div className="course-card">
            <h3>Data Structures</h3>
            <button>Join</button>
          </div>

          <div className="course-card">
            <h3>Operating Systems</h3>
            <button>Join</button>
          </div>

          <div className="course-card">
            <h3>Computer Networks</h3>
            <button>Join</button>
          </div>

          <div className="course-card">
            <h3>Signals & Systems</h3>
            <button>Join</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}