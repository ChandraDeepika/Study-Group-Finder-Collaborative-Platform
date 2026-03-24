import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Courses.css";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/user-courses/my")
      .then(r => setCourses(r.data || []))
      .catch(console.error);
  }, []);

  const leaveCourse = async (courseId) => {
    try {
      await api.delete(`/user-courses/${courseId}`);
      setCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (err) {
      console.error("Error leaving course:", err);
    }
  };

  return (
    <Layout>
      <div className="courses-wrapper">

        <div className="courses-page-hero">
          <div className="courses-page-hero-text">
            <h1>My Courses</h1>
            <p>Track your progress across all enrolled courses</p>
          </div>
          <div className="my-courses-badge">
            <span>📚</span>
            <span>{courses.length} Enrolled</span>
          </div>
        </div>

        <div className="courses-grid">
          {courses.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p>You are not enrolled in any courses yet.</p>
              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
                Go to Explore Courses to find and enroll in courses.
              </p>
            </div>
          ) : (
            courses.map((course) => {
              return (
                <div className="course-card" key={course.id}>
                  <div className="course-card-banner">
                    <span className="course-card-banner-code">{course.courseCode}</span>
                    <span className="course-card-banner-name">{course.courseName}</span>
                  </div>
                  <div className="course-card-body">
                    <h3>{course.courseName}</h3>
                    <div className="course-card-bottom">
                      <div className="progress-wrap">
                        <div className="progress-label">
                          <span>Progress</span><span>0%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: "0%" }} />
                        </div>
                      </div>
                      <button className="primary-btn" onClick={() => alert("Learning module will be added later.")}>
                        Continue Learning
                      </button>
                      <button className="leave-btn" onClick={() => leaveCourse(course.id)}>
                        Leave Course
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
