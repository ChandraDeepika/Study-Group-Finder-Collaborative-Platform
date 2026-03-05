import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./courses.css";

export default function MyCourses() {

  const [courses, setCourses] = useState([]);

  useEffect(() => {

    const fetchMyCourses = async () => {

      try {

        const response = await api.get("/user-courses/my");
        setCourses(response.data);

      } catch (error) {

        console.error("Error fetching enrolled courses:", error);

      }

    };

    fetchMyCourses();

  }, []);

  // ✅ Leave course
  const leaveCourse = async (courseId) => {

    try {

      await api.delete(`/user-courses/${courseId}`);

      // remove from UI
      setCourses(prev =>
        prev.filter(enrollment => enrollment.course.id !== courseId)
      );

      alert("You left the course");

    } catch (error) {

      console.error("Error leaving course", error);

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

            courses.map((enrollment) => (

              <div className="course-card" key={enrollment.id}>

                <div className="course-card-top">

                  <span className="course-tag">
                    {enrollment.course.courseCode}
                  </span>

                  <h3>{enrollment.course.courseName}</h3>

                </div>

                <div className="course-card-bottom">

                  <div className="progress-wrap">

                    <div className="progress-label">
                      <span>Progress</span>
                      <span>{enrollment.progress}%</span>
                    </div>

                    <div className="progress-bar">

                      <div
                        className="progress-fill"
                        style={{ width: `${enrollment.progress}%` }}
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

                  {/* ✅ Leave course */}
                  <button
                    className="leave-btn"
                    onClick={() => leaveCourse(enrollment.course.id)}
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