package com.studygroup.backend.repository;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.UserCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCourseRepository extends JpaRepository<UserCourse, Long> {

    // ============================
    // BASIC FETCHING
    // ============================

    List<UserCourse> findByUser(User user);

    List<UserCourse> findByCourse(Course course);

    // ============================
    // OPTIMIZED ID-BASED FETCHING
    // ============================

    List<UserCourse> findByUserId(Long userId);

    List<UserCourse> findByCourseId(Long courseId);

    Optional<UserCourse> findByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    long countByUserId(Long userId);
}