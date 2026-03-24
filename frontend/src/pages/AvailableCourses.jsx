/*
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./courses.css";


export default function AvailableCourses() {

  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(null);

  const navigate = useNavigate();

  // Load all courses
  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error loading courses", error);
    }
  };

  // Load enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      const response = await api.get("/user-courses/my");

      const ids = response.data.map(enrollment => enrollment.course.id);

      setEnrolledIds(ids);

    } catch (error) {
      console.error("Error loading enrolled courses", error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  // Enroll course
  const handleEnroll = async (courseId) => {

    try {

      setLoadingCourse(courseId);

      await api.post(`/user-courses/enroll/${courseId}`);

      // update UI instantly
      setEnrolledIds(prev => [...prev, courseId]);

    } catch (error) {
        console.error("Enrollment failed", error);
      alert("Enrollment failed or you may already be enrolled.");

    } finally {

      setLoadingCourse(null);

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

          {courses.map(course => {

            const isEnrolled = enrolledIds.includes(course.id);
            const isLoading = loadingCourse === course.id;

            return (

              <div className="course-card" key={course.id}>

                <div className="course-card-top">

                  <span className="course-tag">
                    {course.courseCode}
                  </span>

                  <h3>{course.courseName}</h3>

                </div>

                <div className="course-card-bottom">

                  {isLoading ? (

                    <button className="primary-btn" disabled>
                      Enrolling...
                    </button>

                  ) : isEnrolled ? (

                    <>
                      <button className="enrolled-btn" disabled>
                        ✓ Enrolled
                      </button>

                      <button
                        className="view-btn"
                        onClick={() => navigate("/my-courses")}
                      >
                        View Course
                      </button>
                    </>

                  ) : (

                    <button
                      className="primary-btn"
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll
                    </button>

                  )}

                </div>

              </div>

            );

          })}

        </div>

      </div>

    </Layout>

  );

}
*/