import React, { useState } from "react";

const CoursesSection = ({ courses, setCourses }) => {
  const [newCourse, setNewCourse] = useState("");

  const handleAddCourse = () => {
    if (!newCourse.trim()) return;
    setCourses([...courses, newCourse]);
    setNewCourse("");
  };

  const handleRemoveCourse = (index) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    setCourses(updatedCourses);
  };

  return (
    <div className="card">
      <h2>Enrolled Courses</h2>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Enter course name"
          value={newCourse}
          onChange={(e) => setNewCourse(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={handleAddCourse}>Add</button>
      </div>

      {courses.length === 0 ? (
        <p style={{ marginTop: "10px" }}>No courses added yet.</p>
      ) : (
        <ul style={{ marginTop: "10px" }}>
          {courses.map((course, index) => (
            <li key={index} style={{ marginBottom: "8px" }}>
              {course}
              <button
                onClick={() => handleRemoveCourse(index)}
                style={{ marginLeft: "10px" }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CoursesSection;
