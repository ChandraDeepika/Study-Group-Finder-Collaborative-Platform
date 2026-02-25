package com.studygroup.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinRequestActionRequest {
    private Long userId;
    private boolean approve;
}
