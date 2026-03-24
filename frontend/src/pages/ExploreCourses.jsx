import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Courses.css";

export default function ExploreCourses() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/courses").then(r => setCourses(r.data)).catch(console.error);
    api.get("/user-courses/my").then(r => setEnrolledIds(r.data.map(c => c.id))).catch(console.error);
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      setLoadingCourse(courseId);
      await api.post(`/user-courses/enroll/${courseId}`);
      setEnrolledIds(prev => [...new Set([...prev, courseId])]);
    } catch {
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
              placeholder="Search by name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="courses-count-bar">
          {filtered.length} course{filtered.length !== 1 ? "s" : ""} available
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
              return (
                <div className="course-card" key={course.id}>
                  <div className="course-card-banner">
                    <span className="course-card-banner-code">{course.courseCode}</span>
                    <span className="course-card-banner-name">{course.courseName}</span>
                  </div>
                  <div className="course-card-body">
                    <h3>{course.courseName}</h3>
                    <div className="course-card-bottom">
                      {isLoading ? (
                        <button className="primary-btn" disabled>Enrolling...</button>
                      ) : isEnrolled ? (
                        <>
                          <button className="enrolled-btn" disabled>✓ Enrolled</button>
                          <button className="view-btn" onClick={() => navigate("/my-courses")}>View Course</button>
                        </>
                      ) : (
                        <button className="primary-btn" onClick={() => handleEnroll(course.id)}>Enroll Now</button>
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
