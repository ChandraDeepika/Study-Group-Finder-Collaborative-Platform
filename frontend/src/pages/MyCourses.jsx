import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Courses.css";

const COURSE_VISUALS = {
  CS:   { gradient: "linear-gradient(135deg,#1e40af,#3b82f6)", icon: "💻" },
  MATH: { gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)", icon: "📐" },
  PHY:  { gradient: "linear-gradient(135deg,#0f766e,#2dd4bf)", icon: "⚛️" },
  BIO:  { gradient: "linear-gradient(135deg,#15803d,#4ade80)", icon: "🧬" },
  ENG:  { gradient: "linear-gradient(135deg,#b45309,#fbbf24)", icon: "📖" },
  DATA: { gradient: "linear-gradient(135deg,#be185d,#f472b6)", icon: "🤖" },
  CHEM: { gradient: "linear-gradient(135deg,#0369a1,#38bdf8)", icon: "🧪" },
  HIST: { gradient: "linear-gradient(135deg,#92400e,#d97706)", icon: "🏛️" },
  ART:  { gradient: "linear-gradient(135deg,#9d174d,#ec4899)", icon: "🎨" },
  MUS:  { gradient: "linear-gradient(135deg,#1d4ed8,#60a5fa)", icon: "🎵" },
  ECON: { gradient: "linear-gradient(135deg,#065f46,#34d399)", icon: "📊" },
  LAW:  { gradient: "linear-gradient(135deg,#1e3a5f,#3b82f6)", icon: "⚖️" },
  PSY:  { gradient: "linear-gradient(135deg,#6d28d9,#c4b5fd)", icon: "🧠" },
  GEO:  { gradient: "linear-gradient(135deg,#0c4a6e,#38bdf8)", icon: "🌍" },
  MED:  { gradient: "linear-gradient(135deg,#991b1b,#f87171)", icon: "🏥" },
  STAT: { gradient: "linear-gradient(135deg,#1e3a5f,#60a5fa)", icon: "📈" },
  IT:   { gradient: "linear-gradient(135deg,#1e40af,#818cf8)", icon: "🖥️" },
  SE:   { gradient: "linear-gradient(135deg,#1e40af,#3b82f6)", icon: "⚙️" },
};

const DEFAULT_VISUAL = { gradient: "linear-gradient(135deg,#374151,#6b7280)", icon: "📘" };

function getCourseVisual(code = "") {
  const upper = code.toUpperCase();
  for (const [key, val] of Object.entries(COURSE_VISUALS)) {
    if (upper.startsWith(key)) return val;
  }
  return DEFAULT_VISUAL;
}

export default function MyCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await api.get("/user-courses/my");
        setCourses(response.data || []);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      }
    };
    fetchMyCourses();
  }, []);

  const leaveCourse = async (courseId) => {
    try {
      await api.delete(`/user-courses/${courseId}`);
      setCourses(prev => prev.filter(course => course.id !== courseId));
      alert("You left the course");
    } catch (error) {
      console.error("Error leaving course:", error);
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
              const visual = getCourseVisual(course.courseCode);
              return (
                <div className="course-card" key={course.id}>
                  <div className="course-card-banner" style={{ background: visual.gradient }}>
                    <span className="course-card-banner-name">{course.courseName}</span>
                    <span className="course-card-banner-code">{course.courseCode}</span>
                  </div>
                  <div className="course-card-body">
                    <h3>{course.courseName}</h3>
                    <div className="course-card-bottom">
                      <div className="progress-wrap">
                        <div className="progress-label">
                          <span>Progress</span>
                          <span>0%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: "0%" }} />
                        </div>
                      </div>
                      <button
                        className="primary-btn"
                        onClick={() => alert("Learning module will be added later.")}
                      >
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
