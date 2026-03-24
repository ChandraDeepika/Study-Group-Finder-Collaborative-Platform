package com.studygroup.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "sessions",
        indexes = {
                @Index(name = "idx_group_id", columnList = "group_id"),
                @Index(name = "idx_date_time", columnList = "date_time")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    @NotNull(message = "Group ID is required")
    private Long groupId;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Title cannot be empty")
    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "date_time", nullable = false)
    @NotNull(message = "Session date and time is required")
    private LocalDateTime dateTime;

    @Column(name = "created_by", nullable = false)
    @NotNull(message = "CreatedBy is required")
    private Long createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isUpcoming() {
        return this.dateTime != null && this.dateTime.isAfter(LocalDateTime.now());
    }

    public boolean isPast() {
        return this.dateTime != null && this.dateTime.isBefore(LocalDateTime.now());
    }
}
