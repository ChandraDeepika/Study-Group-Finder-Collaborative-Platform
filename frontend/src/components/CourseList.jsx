import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  }, [token, navigate]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        fetch("http://localhost:8080/api/courses", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/courses/my", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (allRes.ok) setAllCourses(await allRes.json());
      if (myRes.ok) {
        const my = await myRes.json();
        setEnrolledIds(my.map(c => c.id));
      }
    } catch (e) {
      console.error("CourseList fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const enrolCourse = async (courseId) => {
    setActionId(courseId);
    try {
      const res = await fetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEnrolledIds((prev) => [...prev, courseId]);
        if (onEnrol) onEnrol();
      }
    } catch (e) {
      console.error("Enrol error:", e);
    } finally {
      setActionId(null);
    }
  };

  const leaveCourse = async (courseId) => {
    setActionId(courseId);
    try {
      const res = await fetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEnrolledIds((prev) => prev.filter(id => id !== courseId));
        if (onEnrol) onEnrol();
      }
    } catch (e) {
      console.error("Leave error:", e);
    } finally {
      setActionId(null);
    }
  };

  const enrolledCourses = allCourses.filter(c => enrolledIds.includes(c.id));
  const availableCourses = allCourses.filter(c => !enrolledIds.includes(c.id));

  if (loading) return <p className="dash-empty">Loading courses...</p>;

  return (
    <div className="dash-list">
      {/* Enrolled */}
      {enrolledCourses.length === 0 ? (
        <p className="dash-empty">No courses enrolled yet.</p>
      ) : (
        enrolledCourses.map((course) => (
          <div className="dash-list-item" key={course.id}>
            <div className="dash-list-left">
              <div className="dash-list-icon course-bg">📚</div>
              <div>
                <p className="dash-list-title">{course.courseName || course.name}</p>
                <p className="dash-list-sub">{course.courseCode || ""}</p>
              </div>
            </div>
            <div className="dash-list-right">
              <span className="dash-pill enrolled-pill">Enrolled</span>
              <button
                className="dash-btn-sm leave-btn"
                onClick={() => leaveCourse(course.id)}
                disabled={actionId === course.id}
              >
                {actionId === course.id ? "..." : "Leave"}
              </button>
            </div>
          </div>
        ))
      )}

      {/* Available */}
      {availableCourses.length > 0 && (
        <>
          <p className="dash-divider-label">Available to Enrol</p>
          {availableCourses.map((course) => (
            <div className="dash-list-item" key={course.id}>
              <div className="dash-list-left">
                <div className="dash-list-icon available-bg">🎓</div>
                <div>
                  <p className="dash-list-title">{course.courseName || course.name}</p>
                  <p className="dash-list-sub">{course.courseCode || ""}</p>
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
          ))}
        </>
      )}
    </div>
  );
}

export default CourseList;