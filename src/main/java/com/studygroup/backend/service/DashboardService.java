package com.studygroup.backend.service;

import com.studygroup.backend.dto.DashboardResponse;
import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.UserCourseRepository;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.repository.UserStudyGroupRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepo;
    private final UserCourseRepository userCourseRepo;
    private final UserStudyGroupRepository userStudyGroupRepo;

    public DashboardService(UserRepository userRepo,
                            UserCourseRepository userCourseRepo,
                            UserStudyGroupRepository userStudyGroupRepo) {
        this.userRepo = userRepo;
        this.userCourseRepo = userCourseRepo;
        this.userStudyGroupRepo = userStudyGroupRepo;
    }

    public DashboardResponse getDashboardData(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // =========================
        // 1️⃣ Count Enrolled Courses
        // =========================
        long enrolledCoursesCount =
                userCourseRepo.countByUserId(user.getId());

        // =========================
        // 2️⃣ Count Joined Groups
        // =========================
        long joinedGroupsCount =
                userStudyGroupRepo.countByUserId(user.getId());

        // =========================
        // 3️⃣ Suggested Peers
        // Logic: other users in same groups
        // =========================
        List<String> suggestedPeers =
                userStudyGroupRepo.findByUserId(user.getId())
                        .stream()
                        .flatMap(usg ->
                                userStudyGroupRepo
                                        .findByStudyGroupId(usg.getStudyGroup().getId())
                                        .stream()
                        )
                        .map(usg -> usg.getUser().getName())
                        .distinct()
                        .filter(name -> !name.equals(user.getName()))
                        .limit(5)
                        .collect(Collectors.toList());

        // =========================
        // 4️⃣ Recent Activity
        // =========================
        List<String> recentActivity =
                userCourseRepo.findByUserId(user.getId())
                        .stream()
                        .map(uc -> "Progress in " + uc.getCourse().getCourseName()
                                + ": " + uc.getProgress() + "%")
                        .limit(5)
                        .collect(Collectors.toList());

        return new DashboardResponse(
                enrolledCoursesCount,
                joinedGroupsCount,
                suggestedPeers,
                recentActivity
        );
    }
}