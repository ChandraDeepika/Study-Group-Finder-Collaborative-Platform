package com.studygroup.backend.controller;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.model.UserCourse;
import com.studygroup.backend.service.UserCourseService;
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
    public String enrollCourse(Authentication authentication,
                               @PathVariable Long courseId) {

        userCourseService.enrollCourse(authentication.getName(), courseId);
        return "Successfully enrolled in course";
    }

    // ==========================================
    // REMOVE ENROLLMENT
    // ==========================================
    @DeleteMapping("/{courseId}")
    public String removeEnrollment(Authentication authentication,
                                   @PathVariable Long courseId) {

        userCourseService.removeEnrollment(authentication.getName(), courseId);
        return "Course removed successfully";
    }

    // ==========================================
    // GET MY ENROLLED COURSES
    // ==========================================
    @GetMapping("/my")
    public List<Course> getMyCourses(Authentication authentication) {

        return userCourseService
                .getMyEnrollments(authentication.getName())
                .stream()
                .map(UserCourse::getCourse)
                .toList();
    }

    // ==========================================
    // UPDATE COURSE PROGRESS
    // ==========================================
    @PutMapping("/{courseId}/progress")
    public String updateProgress(Authentication authentication,
                                 @PathVariable Long courseId,
                                 @RequestParam int progress) {

        userCourseService.updateProgress(authentication.getName(), courseId, progress);
        return "Progress updated successfully";
    }

    // ==========================================
    // GET SINGLE ENROLLMENT DETAILS
    // ==========================================
    @GetMapping("/{courseId}")
    public UserCourse getEnrollment(Authentication authentication,
                                    @PathVariable Long courseId) {

        return userCourseService.getEnrollment(authentication.getName(), courseId);
    }
}