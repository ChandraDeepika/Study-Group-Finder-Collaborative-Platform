package com.studygroup.backend.dto;

public class GroupSearchRequest {

    private Long courseId;
    private String privacy;
    private String keyword;

    // Sorting
    private String sortBy  = "id";   // name | memberCount | createdAt
    private String sortDir = "desc";         // asc | desc

    // Pagination
    private int page = 0;
    private int size = 20;

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getPrivacy() { return privacy; }
    public void setPrivacy(String privacy) { this.privacy = privacy; }

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortDir() { return sortDir; }
    public void setSortDir(String sortDir) { this.sortDir = sortDir; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}