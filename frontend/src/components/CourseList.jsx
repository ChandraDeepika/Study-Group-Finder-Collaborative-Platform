import { useState } from "react";

function CourseList() {
  const availableCourses = [
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

  const leaveCourse = (course) => {
    setEnrolledCourses(
      enrolledCourses.filter((c) => c !== course)
    );
  };

  return (
    <div className="course-card">
      <h2>My Enrolled Courses</h2>

      {enrolledCourses.length === 0 && <p>No courses joined yet.</p>}

      <ul>
        {enrolledCourses.map((course, index) => (
          <li key={index}>
            {course}
            <button onClick={() => leaveCourse(course)}>
              Leave
            </button>
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: "20px" }}>Available Courses</h3>

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
