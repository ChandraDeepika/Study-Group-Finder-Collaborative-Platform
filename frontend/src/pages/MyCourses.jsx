import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./courses.css";

export default function MyCourses() {

  const [courses, setCourses] = useState([]);

  // Fetch enrolled courses
  useEffect(() => {

    const fetchMyCourses = async () => {

      try {

        const response = await api.get("/user-courses/my");

        // API returns Course objects directly
        setCourses(response.data || []);

      } catch (error) {

        console.error("Error fetching enrolled courses:", error);

      }

    };

    fetchMyCourses();

  }, []);

  // Leave course
  const leaveCourse = async (courseId) => {

    try {

      await api.delete(`/user-courses/${courseId}`);

      // remove course from UI immediately
      setCourses(prev =>
        prev.filter(course => course.id !== courseId)
      );

      alert("You left the course");

    } catch (error) {

      console.error("Error leaving course:", error);

    }

  };

  return (

    <Layout>

      <div className="courses-wrapper">

        <div className="page-header">
          <h1>My Courses</h1>
          <p>Your enrolled courses</p>
        </div>

        <div className="courses-grid">

          {courses.length === 0 ? (

            <div className="empty-state">
              You are not enrolled in any courses yet.
            </div>

          ) : (

            courses.map((course) => (

              <div className="course-card" key={course.id}>

                <div className="course-card-top">

                  <span className="course-tag">
                    {course.courseCode}
                  </span>

                  <h3>{course.courseName}</h3>

                </div>

                <div className="course-card-bottom">

                  {/* Placeholder progress since API returns only course */}
                  <div className="progress-wrap">

                    <div className="progress-label">
                      <span>Progress</span>
                      <span>0%</span>
                    </div>

                    <div className="progress-bar">

                      <div
                        className="progress-fill"
                        style={{ width: "0%" }}
                      />

                    </div>

                  </div>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      alert("Learning module will be added later.")
                    }
                  >
                    Continue
                  </button>

                  <button
                    className="leave-btn"
                    onClick={() => leaveCourse(course.id)}
                  >
                    Leave Course
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </Layout>

  );

}