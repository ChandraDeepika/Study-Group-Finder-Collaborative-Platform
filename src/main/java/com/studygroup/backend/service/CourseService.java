package com.studygroup.backend.service;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.repository.CourseRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepo;

    public CourseService(CourseRepository courseRepo) {
        this.courseRepo = courseRepo;
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
        return courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }
    public List<Course> getMyCourses() {
    String email = SecurityContextHolder.getContext().getAuthentication().getName();
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return enrollmentRepository.findCoursesByUserId(user.getId());
}
}