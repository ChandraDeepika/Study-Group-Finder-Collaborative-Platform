package com.studygroup.backend.dto;

import com.studygroup.backend.model.Course;
import com.studygroup.backend.model.User;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DashboardResponse {
    private List<Course> enrolledCourses;
    private List<User> suggestedPeers;
}
