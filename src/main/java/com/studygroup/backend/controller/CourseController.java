package com.studygroup.backend.controller;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.service.CourseService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // GET all courses
    @GetMapping
    public List<Course> getCourses() {
        return courseService.getAllCourses();
    }

    // GET courses the logged-in user is enrolled in
    @GetMapping("/my")
    public List<Course> getMyCourses(Authentication authentication) {
        return courseService.getMyCourses(authentication.getName());
    }

    // POST — join a course
    @PostMapping("/{courseId}")
    public void addCourse(@PathVariable Long courseId,
                          Authentication authentication) {
        courseService.addCourse(authentication.getName(), courseId);
    }

    // DELETE — leave a course
    @DeleteMapping("/{courseId}")
    public void removeCourse(@PathVariable Long courseId,
                             Authentication authentication) {
        courseService.removeCourse(authentication.getName(), courseId);
    }
}
