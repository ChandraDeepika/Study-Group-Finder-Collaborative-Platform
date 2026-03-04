
package com.studygroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class DashboardResponse {

    private long enrolledCoursesCount;
    private long joinedGroupsCount;
    private List<String> suggestedPeers;
    private List<String> recentActivity;
}