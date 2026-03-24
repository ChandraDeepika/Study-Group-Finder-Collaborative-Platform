package com.studygroup.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@ToString
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SessionResponse {

    @Schema(description = "Unique ID of the session", example = "101")
    private final Long id;

    @Schema(description = "Group ID to which session belongs", example = "1")
    private final Long groupId;

    @Schema(description = "Session title", example = "DSA Revision")
    private final String title;

    @Schema(description = "Session description", example = "Arrays and recursion discussion")
    private final String description;

    @Schema(description = "Scheduled date and time", example = "2026-03-25T18:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime dateTime;

    @Schema(description = "User ID of session creator", example = "2")
    private final Long createdBy;

    // 🔥 Optional fields (good for real-world APIs)
    
    @Schema(description = "Indicates if session is upcoming", example = "true")
    private final Boolean isUpcoming;

    @Schema(description = "Timestamp when session was created", example = "2026-03-20T10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime createdAt;
}
