import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "./courses.css";

export default function Courses() {

  const [courses, setCourses] = useState([]);

  useEffect(() => {

    const fetchCourses = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:8080/api/user-courses/my",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        setCourses(data);

      } catch (error) {

        console.error("Error fetching courses", error);

      }

    };

    fetchCourses();

  }, []);

  return (
    <Layout>
      <div className="courses-wrapper">

        <div className="page-header">
          <h1>Courses</h1>
          <p>Browse and manage your enrolled courses</p>
        </div>

        <div className="courses-grid">

          {courses.map((enrollment) => (

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

                <button className="primary-btn">
                  Continue
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>
    </Layout>
  );
}