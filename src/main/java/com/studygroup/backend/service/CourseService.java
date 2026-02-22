package com.studygroup.backend.service;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.UserCourse;
import com.studygroup.backend.repository.CourseRepository;
import com.studygroup.backend.repository.UserCourseRepository;
import com.studygroup.backend.repository.UserRepository;
import lombok.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    public List<Course> getAllCourses() {
        return courseRepo.findAll();
    }

    @Transactional
    public void addCourse(String email, @NonNull Long courseId) {
        User user = userRepo.findByEmail(email).orElseThrow();
        Course course = courseRepo.findById(courseId).orElseThrow();

        UserCourse uc = new UserCourse();
        uc.setUser(user);
        uc.setCourse(course);

        userCourseRepo.save(uc);
    }

    @Transactional
    public void removeCourse(String email, Long courseId) {
        User user = userRepo.findByEmail(email).orElseThrow();

        userCourseRepo.findByUser(user).stream()
                .filter(uc -> uc.getCourse().getId().equals(courseId))
                .forEach(userCourseRepo::delete);
    }
}
