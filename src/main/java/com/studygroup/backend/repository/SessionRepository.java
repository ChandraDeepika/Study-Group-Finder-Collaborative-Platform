package com.studygroup.backend.repository;

import com.studygroup.backend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {

    // All sessions for a group ordered by date
    @Query("SELECT s FROM Session s JOIN FETCH s.createdBy WHERE s.group.id = :groupId ORDER BY s.sessionDate ASC")
    List<Session> findByGroupIdOrderBySessionDateAsc(@Param("groupId") Long groupId);

    // Upcoming sessions only
    @Query("SELECT s FROM Session s JOIN FETCH s.createdBy WHERE s.group.id = :groupId AND s.sessionDate >= :now ORDER BY s.sessionDate ASC")
    List<Session> findUpcomingByGroupId(@Param("groupId") Long groupId, @Param("now") LocalDateTime now);
}