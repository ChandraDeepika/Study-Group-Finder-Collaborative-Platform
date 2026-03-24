package com.studygroup.backend.service;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.UserCourse;
import com.studygroup.backend.repository.CourseRepository;
import com.studygroup.backend.repository.UserCourseRepository;
import com.studygroup.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepo;
    private final UserRepository userRepo;
    private final UserCourseRepository userCourseRepo;

    public CourseService(CourseRepository courseRepo,
                         UserRepository userRepo,
                         UserCourseRepository userCourseRepo) {
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.userCourseRepo = userCourseRepo;
    }

    // =============================
    // GET ALL COURSES
    // =============================
    public List<Course> getAllCourses() {
        return courseRepo.findAll();
    }

    // =============================
    // GET COURSE BY ID
    // =============================
    public Course getCourseById(Long id) {
        return courseRepo.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    // =============================
    // GET MY ENROLLED COURSES
    // =============================
    public List<Course> getMyCourses(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserCourse> enrollments = userCourseRepo.findByUserId(user.getId());

        return enrollments
                .stream()
                .map(UserCourse::getCourse)
                .collect(Collectors.toList());
    }
}