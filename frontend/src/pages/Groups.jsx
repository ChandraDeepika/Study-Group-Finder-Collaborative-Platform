import Layout from "../components/Layout";
import "../styles/courses.css";

export default function Groups() {
  const groups = [
    { id: 1, title: "DSA Evening Batch", members: 24, topic: "Algorithms", active: true },
    { id: 2, title: "OS Interview Prep", members: 18, topic: "Systems", active: true },
    { id: 3, title: "Signals Crash Group", members: 12, topic: "Electronics", active: false },
    { id: 4, title: "Networks Discussion", members: 30, topic: "Networking", active: true },
  ];

  return (
    <Layout>
      <div className="courses-wrapper">
        <div className="page-header">
          <h1>Study Groups</h1>
          <p>Join and collaborate with other students</p>
        </div>

        <div className="courses-grid">
          {groups.map((group) => (
            <div className="course-card" key={group.id}>
              <div className="course-card-top">
                <span className="course-tag">{group.topic}</span>
                <h3>{group.title}</h3>
                <div className="group-meta">
                  <span className="member-count">👥 {group.members} members</span>
                  {group.active && <span className="active-badge">Active</span>}
                </div>
              </div>
              <div className="course-card-bottom">
                <button className="primary-btn">Join Group</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
