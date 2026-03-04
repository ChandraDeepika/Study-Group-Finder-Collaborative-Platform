import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./courses.css";

export default function ExploreCourses() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {

      const response = await api.get("/courses");

      setCourses(response.data);

    } catch (error) {

      console.error("Error fetching courses:", error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchCourses();

  }, []);

  const enrollCourse = async (courseId) => {

    try {

      await api.post(`/user-courses/enroll/${courseId}`);

      alert("Successfully enrolled!");

      // refresh course list
      fetchCourses();

    } catch (error) {

      console.error("Enrollment failed:", error);
      alert("Enrollment failed or you may already be enrolled.");

    }

  };

  return (
    <Layout>

      <div className="courses-wrapper">

        <div className="page-header">
          <h1>Explore Courses</h1>
          <p>Browse available courses and enroll</p>
        </div>

        <div className="courses-grid">

          {loading ? (

            <div className="empty-state">Loading courses...</div>

          ) : courses.length === 0 ? (

            <div className="empty-state">
              No courses available right now.
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

                  <button
                    className="primary-btn"
                    onClick={() => enrollCourse(course.id)}
                  >
                    Enroll
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