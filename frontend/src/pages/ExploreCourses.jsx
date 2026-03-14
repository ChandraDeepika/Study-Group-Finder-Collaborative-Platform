import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
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

export default function ExploreCourses() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await api.get("/user-courses/my");
      setEnrolledIds(response.data.map(course => course.id));
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      setLoadingCourse(courseId);
      await api.post(`/user-courses/enroll/${courseId}`);
      setEnrolledIds(prev => [...new Set([...prev, courseId])]);
    } catch (error) {
      console.error("Enrollment failed:", error);
      alert("Enrollment failed or you may already be enrolled.");
    } finally {
      setLoadingCourse(null);
    }
  };

  const filtered = courses.filter(c =>
    c.courseName?.toLowerCase().includes(search.toLowerCase()) ||
    c.courseCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="courses-wrapper">
        <div className="courses-page-hero">
          <div className="courses-page-hero-text">
            <h1>Explore Courses</h1>
            <p>Discover and enroll in courses to find your perfect study group</p>
          </div>
          <div className="courses-search-wrap">
            <span className="courses-search-icon">🔍</span>
            <input
              type="text"
              className="courses-search-input"
              placeholder="Search courses by name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="courses-count-bar">
          <span>{filtered.length} course{filtered.length !== 1 ? "s" : ""} available</span>
        </div>

        <div className="courses-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p>No courses found matching your search.</p>
            </div>
          ) : (
            filtered.map((course) => {
              const isEnrolled = enrolledIds.includes(course.id);
              const isLoading = loadingCourse === course.id;
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
                      {isLoading ? (
                        <button className="primary-btn" disabled>Enrolling...</button>
                      ) : isEnrolled ? (
                        <>
                          <button className="enrolled-btn" disabled>✓ Enrolled</button>
                          <button className="view-btn" onClick={() => navigate("/my-courses")}>
                            View Course
                          </button>
                        </>
                      ) : (
                        <button className="primary-btn" onClick={() => handleEnroll(course.id)}>
                          Enroll Now
                        </button>
                      )}
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
