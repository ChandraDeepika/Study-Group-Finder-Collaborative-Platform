import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Same visual map used in ExploreCourses/MyCourses
const COURSE_VISUALS = {
  CS:   { gradient: "linear-gradient(135deg,#1e40af,#3b82f6)", icon: "💻", bg: "#eff6ff", color: "#1e40af" },
  MATH: { gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)", icon: "📐", bg: "#fdf4ff", color: "#7c3aed" },
  PHY:  { gradient: "linear-gradient(135deg,#0f766e,#2dd4bf)", icon: "⚛️", bg: "#f0fdfa", color: "#0f766e" },
  BIO:  { gradient: "linear-gradient(135deg,#15803d,#4ade80)", icon: "🧬", bg: "#f0fdf4", color: "#15803d" },
  ENG:  { gradient: "linear-gradient(135deg,#b45309,#fbbf24)", icon: "📖", bg: "#fffbeb", color: "#b45309" },
  DATA: { gradient: "linear-gradient(135deg,#be185d,#f472b6)", icon: "🤖", bg: "#fdf2f8", color: "#be185d" },
  CHEM: { gradient: "linear-gradient(135deg,#0369a1,#38bdf8)", icon: "🧪", bg: "#f0f9ff", color: "#0369a1" },
  HIST: { gradient: "linear-gradient(135deg,#92400e,#d97706)", icon: "🏛️", bg: "#fffbeb", color: "#92400e" },
  ART:  { gradient: "linear-gradient(135deg,#9d174d,#ec4899)", icon: "🎨", bg: "#fdf2f8", color: "#9d174d" },
  MUS:  { gradient: "linear-gradient(135deg,#1d4ed8,#60a5fa)", icon: "🎵", bg: "#eff6ff", color: "#1d4ed8" },
  ECON: { gradient: "linear-gradient(135deg,#065f46,#34d399)", icon: "📊", bg: "#ecfdf5", color: "#065f46" },
  LAW:  { gradient: "linear-gradient(135deg,#1e3a5f,#3b82f6)", icon: "⚖️", bg: "#eff6ff", color: "#1e3a5f" },
};
const DEFAULT_VISUAL = { gradient: "linear-gradient(135deg,#374151,#6b7280)", icon: "📘", bg: "#f9fafb", color: "#374151" };

function getCourseVisual(code = "") {
  const upper = code.toUpperCase();
  for (const [key, val] of Object.entries(COURSE_VISUALS)) {
    if (upper.startsWith(key)) return val;
  }
  return DEFAULT_VISUAL;
}

function CourseList({ onEnrol }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [allCourses, setAllCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchCourses();
  }, [token]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        api.get("/courses"),
        api.get("/user-courses/my"),
      ]);
      setAllCourses(allRes.data || []);
      // /user-courses/my returns Course objects directly
      setEnrolledIds((myRes.data || []).map(c => c.id));
    } catch (e) {
      console.error("CourseList fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const enrolCourse = async (courseId) => {
    setActionId(courseId);
    try {
      await api.post(`/user-courses/enroll/${courseId}`);
      setEnrolledIds(prev => [...new Set([...prev, courseId])]);
      if (onEnrol) onEnrol();
    } catch (e) {
      console.error("Enrol error:", e);
      alert("Enrollment failed. You may already be enrolled.");
    } finally {
      setActionId(null);
    }
  };

  const leaveCourse = async (courseId) => {
    setActionId(courseId);
    try {
      await api.delete(`/user-courses/${courseId}`);
      setEnrolledIds(prev => prev.filter(id => id !== courseId));
      if (onEnrol) onEnrol();
    } catch (e) {
      console.error("Leave error:", e);
    } finally {
      setActionId(null);
    }
  };

  const enrolledCourses   = allCourses.filter(c => enrolledIds.includes(c.id));
  const availableCourses  = allCourses.filter(c => !enrolledIds.includes(c.id));

  if (loading) return <p className="dash-empty">Loading courses...</p>;

  return (
    <div className="dash-list">
      {enrolledCourses.length === 0 ? (
        <p className="dash-empty">No courses enrolled yet.</p>
      ) : (
        enrolledCourses.map((course) => {
          const v = getCourseVisual(course.courseCode);
          return (
            <div className="dash-list-item" key={course.id}>
              <div className="dash-list-left">
                <div className="dash-list-icon" style={{ background: v.bg, fontSize: 18 }}>{v.icon}</div>
                <div>
                  <p className="dash-list-title">{course.courseName || course.name}</p>
                  <p className="dash-list-sub" style={{ color: v.color, fontWeight: 600 }}>{course.courseCode}</p>
                </div>
              </div>
              <div className="dash-list-right">
                <span className="dash-pill enrolled-pill">✓ Enrolled</span>
                <button
                  className="dash-btn-sm leave-btn"
                  onClick={() => leaveCourse(course.id)}
                  disabled={actionId === course.id}
                >
                  {actionId === course.id ? "..." : "Leave"}
                </button>
              </div>
            </div>
          );
        })
      )}

      {availableCourses.length > 0 && (
        <>
          <p className="dash-divider-label">Available to Enrol</p>
          {availableCourses.map((course) => {
            const v = getCourseVisual(course.courseCode);
            return (
              <div className="dash-list-item" key={course.id}>
                <div className="dash-list-left">
                  <div className="dash-list-icon" style={{ background: v.bg, fontSize: 18 }}>{v.icon}</div>
                  <div>
                    <p className="dash-list-title">{course.courseName || course.name}</p>
                    <p className="dash-list-sub" style={{ color: v.color, fontWeight: 600 }}>{course.courseCode}</p>
                  </div>
                </div>
                <button
                  className="dash-btn-sm enrol-btn"
                  onClick={() => enrolCourse(course.id)}
                  disabled={actionId === course.id}
                >
                  {actionId === course.id ? "..." : "Enrol"}
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default CourseList;
