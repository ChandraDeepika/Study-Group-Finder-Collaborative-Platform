package com.studygroup.backend.service;

import com.studygroup.backend.dto.DashboardResponse;
import com.studygroup.backend.model.Course;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.UserCourse;
import com.studygroup.backend.repository.UserCourseRepository;
import com.studygroup.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardService {

    private final UserRepository userRepo;
    private final UserCourseRepository userCourseRepo;

    public DashboardService(UserRepository userRepo,
                            UserCourseRepository userCourseRepo) {
        this.userRepo = userRepo;
        this.userCourseRepo = userCourseRepo;
    }

    public DashboardResponse getDashboardData(String email) {

        User user = userRepo.findByEmail(email).orElseThrow();

        List<UserCourse> userCourses = userCourseRepo.findByUser(user);
        List<Course> courses = userCourses.stream()
                .map(UserCourse::getCourse)
                .toList();

        Set<User> peers = new HashSet<>();
        for (UserCourse uc : userCourses) {
            userCourseRepo.findByCourse(uc.getCourse())
                    .forEach(x -> {
                        if (!x.getUser().getId().equals(user.getId())) {
                            peers.add(x.getUser());
                        }
                    });
        }

        DashboardResponse response = new DashboardResponse();
        response.setEnrolledCourses(courses);
        response.setSuggestedPeers(new ArrayList<>(peers));

        return response;
    }
}
