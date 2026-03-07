package com.studygroup.backend.controller;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.model.UserCourse;
import com.studygroup.backend.service.UserCourseService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-courses")
public class UserCourseController {

    private final UserCourseService userCourseService;

    public UserCourseController(UserCourseService userCourseService) {
        this.userCourseService = userCourseService;
    }

    // ==========================================
    // ENROLL IN COURSE
    // ==========================================
    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<String> enrollCourse(Authentication authentication,
                                               @PathVariable Long courseId) {

        String email = authentication.getName();

        userCourseService.enrollCourse(email, courseId);

        return ResponseEntity.ok("Successfully enrolled in course");
    }

    // ==========================================
    // REMOVE ENROLLMENT
    // ==========================================
    @DeleteMapping("/{courseId}")
    public ResponseEntity<String> removeEnrollment(Authentication authentication,
                                                   @PathVariable Long courseId) {

        String email = authentication.getName();

        userCourseService.removeEnrollment(email, courseId);

        return ResponseEntity.ok("Course removed successfully");
    }

    // ==========================================
    // GET MY ENROLLED COURSES
    // ==========================================
    @GetMapping("/my")
    public ResponseEntity<List<Course>> getMyCourses(Authentication authentication) {

        String email = authentication.getName();

        List<Course> courses = userCourseService
                .getMyEnrollments(email)
                .stream()
                .map(UserCourse::getCourse)
                .toList();

        return ResponseEntity.ok(courses);
    }

    // ==========================================
    // GET ENROLLED COURSES (NEW ENDPOINT)
    // ==========================================
    @GetMapping("/enrolled")
    public ResponseEntity<List<Course>> getEnrolledCourses(Authentication authentication) {

        String email = authentication.getName();

        List<Course> courses = userCourseService
                .getMyEnrollments(email)
                .stream()
                .map(UserCourse::getCourse)
                .toList();

        return ResponseEntity.ok(courses);
    }

    // ==========================================
    // UPDATE COURSE PROGRESS
    // ==========================================
    @PutMapping("/{courseId}/progress")
    public ResponseEntity<String> updateProgress(Authentication authentication,
                                                 @PathVariable Long courseId,
                                                 @RequestParam int progress) {

        String email = authentication.getName();

        userCourseService.updateProgress(email, courseId, progress);

        return ResponseEntity.ok("Progress updated successfully");
    }

    // ==========================================
    // GET SINGLE ENROLLMENT DETAILS
    // ==========================================
    @GetMapping("/{courseId}")
    public ResponseEntity<UserCourse> getEnrollment(Authentication authentication,
                                                    @PathVariable Long courseId) {

        String email = authentication.getName();

        UserCourse enrollment = userCourseService.getEnrollment(email, courseId);

        return ResponseEntity.ok(enrollment);
    }
}
