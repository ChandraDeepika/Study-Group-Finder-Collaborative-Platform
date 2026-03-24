package com.studygroup.backend.controller;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.service.CourseService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // ==========================
    // GET ALL COURSES
    // ==========================
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    // ==========================
    // GET COURSE BY ID
    // ==========================
    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id);
    }
  
    @GetMapping("/my")
    public List<Course> getMyCourses(Authentication authentication) {
        String email = authentication.getName();  // logged-in user email
        return courseService.getMyCourses(email);
    }
}