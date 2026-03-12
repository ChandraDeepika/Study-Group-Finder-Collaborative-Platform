import api from "./api";

/*
==================================
GET ALL COURSES (Explore Page)
==================================
*/
export const getAllCourses = async () => {
  const response = await api.get("/courses");
  return response.data;
};

/*
==================================
ENROLL IN COURSE
==================================
*/
export const enrollCourse = async (courseId) => {
  const response = await api.post(`/user-courses/enroll/${courseId}`);
  return response.data;
};

/*
==================================
GET ENROLLED COURSES
==================================
*/
export const getEnrolledCourses = async () => {
  const response = await api.get("/user-courses/enrolled");
  return response.data;
};

/*
==================================
GET MY COURSES PAGE
==================================
*/
export const getMyCourses = async () => {
  const response = await api.get("/user-courses/my");
  return response.data;
};

/*
==================================
REMOVE COURSE
==================================
*/
export const removeCourse = async (courseId) => {
  const response = await api.delete(`/user-courses/${courseId}`);
  return response.data;
};
