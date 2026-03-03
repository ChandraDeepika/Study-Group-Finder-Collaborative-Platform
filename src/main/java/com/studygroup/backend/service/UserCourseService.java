package com.studygroup.backend.service;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.UserCourse;
import com.studygroup.backend.repository.CourseRepository;
import com.studygroup.backend.repository.UserCourseRepository;
import com.studygroup.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserCourseService {

    private final UserRepository userRepo;
    private final CourseRepository courseRepo;
    private final UserCourseRepository userCourseRepo;

    public UserCourseService(UserRepository userRepo,
                             CourseRepository courseRepo,
                             UserCourseRepository userCourseRepo) {
        this.userRepo = userRepo;
        this.courseRepo = courseRepo;
        this.userCourseRepo = userCourseRepo;
    }

    // =============================
    // ENROLL COURSE
    // =============================
    @Transactional
    public void enrollCourse(String email, Long courseId) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (userCourseRepo.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new RuntimeException("Already enrolled in this course");
        }

        UserCourse userCourse = new UserCourse();
        userCourse.setUser(user);
        userCourse.setCourse(course);
        userCourse.setProgress(0);
        userCourse.setStarted(false);
        userCourse.setCompleted(false);

        userCourseRepo.save(userCourse);
    }

    // =============================
    // REMOVE COURSE
    // =============================
    @Transactional
    public void removeEnrollment(String email, Long courseId) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserCourse userCourse = userCourseRepo
                .findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        userCourseRepo.delete(userCourse);
    }

    // =============================
    // GET MY ENROLLED COURSES
    // =============================
    public List<UserCourse> getMyEnrollments(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userCourseRepo.findByUserId(user.getId());
    }

    // =============================
    // UPDATE PROGRESS
    // =============================
    @Transactional
    public void updateProgress(String email, Long courseId, int progress) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserCourse userCourse = userCourseRepo
                .findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        userCourse.updateProgress(progress);

        userCourseRepo.save(userCourse);
    }

    // =============================
    // GET SINGLE ENROLLMENT
    // =============================
    public UserCourse getEnrollment(String email, Long courseId) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userCourseRepo
                .findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
    }
}