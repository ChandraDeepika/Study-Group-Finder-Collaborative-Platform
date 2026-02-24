import { useState } from "react";

function CourseList() {
  const availableCoursesData = [
    "Data Structures",
    "Signals & Systems",
    "Operating Systems",
    "Computer Networks"
  ];

  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const joinCourse = (course) => {
    if (!enrolledCourses.includes(course)) {
      setEnrolledCourses([...enrolledCourses, course]);
    }
  };

  // 🔥 Filter available courses
  const availableCourses = availableCoursesData.filter(
    (course) => !enrolledCourses.includes(course)
  );

  return (
    <div className="course-card">
      <h2>📚 My Enrolled Courses</h2>

      {enrolledCourses.length === 0 && <p>No courses joined yet.</p>}

      <ul>
        {enrolledCourses.map((course, index) => (
          <li key={index}>
            {course}
            <span style={{ color: "#10b981", fontSize: "13px" }}>
              Enrolled
            </span>
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: "30px", fontWeight: "600" }}>
        🎓 Available Courses
      </h3>

      {availableCourses.length === 0 && (
        <p>All courses enrolled ✅</p>
      )}

      <ul>
        {availableCourses.map((course, index) => (
          <li key={index}>
            {course}
            <button onClick={() => joinCourse(course)}>
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseList;