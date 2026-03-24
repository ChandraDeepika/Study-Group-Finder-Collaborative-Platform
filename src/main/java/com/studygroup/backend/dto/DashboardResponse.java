package com.studygroup.backend.dto;

import java.util.List;

public class DashboardResponse {

    private long enrolledCoursesCount;
    private long joinedGroupsCount;
    private List<String> suggestedPeers;
    private List<String> recentActivity;

    public DashboardResponse() {}

    public DashboardResponse(long enrolledCoursesCount, long joinedGroupsCount, List<String> suggestedPeers, List<String> recentActivity) {
        this.enrolledCoursesCount = enrolledCoursesCount;
        this.joinedGroupsCount = joinedGroupsCount;
        this.suggestedPeers = suggestedPeers;
        this.recentActivity = recentActivity;
    }

    public long getEnrolledCoursesCount() {
        return enrolledCoursesCount;
    }

    public void setEnrolledCoursesCount(long enrolledCoursesCount) {
        this.enrolledCoursesCount = enrolledCoursesCount;
    }

    public long getJoinedGroupsCount() {
        return joinedGroupsCount;
    }

    public void setJoinedGroupsCount(long joinedGroupsCount) {
        this.joinedGroupsCount = joinedGroupsCount;
    }

    public List<String> getSuggestedPeers() {
        return suggestedPeers;
    }

    public void setSuggestedPeers(List<String> suggestedPeers) {
        this.suggestedPeers = suggestedPeers;
    }

    public List<String> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<String> recentActivity) {
        this.recentActivity = recentActivity;
    }
}