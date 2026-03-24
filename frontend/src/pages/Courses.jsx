import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./courses.css";

export default function Courses() {

  const [courses, setCourses] = useState([]);

  useEffect(() => {

    const fetchCourses = async () => {

      try {

        const response = await api.get("/user-courses/my");

        console.log("API Response:", response.data);

        setCourses(response.data);

      } catch (error) {

        console.error("Error fetching courses", error);

      }

    };

    fetchCourses();

  }, []);

  // Leave course function
  const leaveCourse = async (courseId) => {

    try {

      await api.delete(`/user-courses/${courseId}`);

      // remove course from UI
      setCourses(prev =>
        prev.filter(enrollment => enrollment.course.id !== courseId)
      );

      alert("Course removed successfully");

    } catch (error) {

      console.error("Error leaving course", error);

    }

  };

  return (
    <Layout>
      <div className="courses-wrapper">

        <div className="page-header">
          <h1>My Courses</h1>
          <p>Browse and manage your enrolled courses</p>
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
                      alert("You are enrolled in this course. Learning module will be added later.")
                    }
                  >
                    Continue
                  </button>

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