package com.studygroup.backend.repository;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.UserCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserCourseRepository extends JpaRepository<UserCourse, Long> {

    List<UserCourse> findByUser(User user);
    List<UserCourse> findByCourse(Course course);
}
