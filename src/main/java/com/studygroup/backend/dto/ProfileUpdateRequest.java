package com.studygroup.backend.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Getter
@Setter
public class ProfileUpdateRequest {
    @NotBlank
    private String universityName;

    @Min(2000)
    @Max(2100)
    private Integer universityPassingYear;

    @DecimalMin("0.0")
    @DecimalMax("10.0")
    private Float universityPassingGPA;
}
