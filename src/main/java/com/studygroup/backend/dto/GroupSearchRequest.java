/*
package com.studygroup.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupSearchRequest {
    private Long courseId;
    private String privacy; // PUBLIC / PRIVATE
    private String keyword;
}
*/
package com.studygroup.backend.dto;

public class GroupSearchRequest {

    private Long courseId;
    private String privacy;
    private String keyword;

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getPrivacy() {
        return privacy;
    }

    public void setPrivacy(String privacy) {
        this.privacy = privacy;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
}