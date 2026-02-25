import Layout from "../components/Layout";
import "../styles/courses.css";

export default function Courses() {
  const courses = [
    { id: 1, title: "Data Structures", tag: "CS Core", progress: 68 },
    { id: 2, title: "Operating Systems", tag: "CS Core", progress: 45 },
    { id: 3, title: "Computer Networks", tag: "Networking", progress: 80 },
    { id: 4, title: "Signals & Systems", tag: "Electronics", progress: 30 },
  ];

  return (
    <Layout>
      <div className="courses-wrapper">
        <div className="page-header">
          <h1>Courses</h1>
          <p>Browse and manage your enrolled courses</p>
        </div>

        <div className="courses-grid">
          {courses.map((course) => (
            <div className="course-card" key={course.id}>
              <div className="course-card-top">
                <span className="course-tag">{course.tag}</span>
                <h3>{course.title}</h3>
              </div>
              <div className="course-card-bottom">
                <div className="progress-wrap">
                  <div className="progress-label">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                <button className="primary-btn">Continue</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
