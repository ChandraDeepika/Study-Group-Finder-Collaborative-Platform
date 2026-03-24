package com.studygroup.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class SessionRequest {

    @Schema(description = "ID of the group where session belongs", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Group ID is required")
    @Positive(message = "Group ID must be a positive number")
    private Long groupId;

    @Schema(description = "Title of the session", example = "DSA Revision", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Title cannot be empty")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Schema(description = "Detailed description of the session", example = "Focus on arrays and recursion")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Schema(description = "Date and time of the session", example = "2026-03-25T18:00:00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Session date and time is required")
    @Future(message = "Session must be scheduled for a future time")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateTime;

    @Schema(description = "ID of the user creating the session", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be a positive number")
    private Long userId;
}