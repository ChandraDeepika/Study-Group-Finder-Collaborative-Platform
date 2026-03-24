package com.studygroup.backend.repository;

import com.studygroup.backend.model.Session;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    // 🔹 BASIC QUERY (Derived)
    List<Session> findByGroupId(Long groupId);

    // 🔹 PAGINATION SUPPORT (Industry standard)
    Page<Session> findByGroupId(Long groupId, Pageable pageable);

    // 🔹 DATE RANGE QUERY
    List<Session> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);

    // 🔹 UPCOMING SESSIONS (JPQL - optimized)
    @Query("SELECT s FROM Session s WHERE s.dateTime > :now ORDER BY s.dateTime ASC")
    List<Session> findUpcomingSessions(@Param("now") LocalDateTime now);

    // 🔹 GROUP + UPCOMING (Real-world use case)
    @Query("SELECT s FROM Session s WHERE s.groupId = :groupId AND s.dateTime > :now ORDER BY s.dateTime ASC")
    List<Session> findUpcomingSessionsByGroup(
            @Param("groupId") Long groupId,
            @Param("now") LocalDateTime now
    );

    // 🔹 EXISTENCE CHECK (Optimization)
    boolean existsByIdAndGroupId(Long sessionId, Long groupId);

    // 🔹 FETCH SINGLE SESSION (Optional)
    Optional<Session> findByIdAndGroupId(Long id, Long groupId);

    // 🔹 DELETE WITH VALIDATION
    void deleteByIdAndGroupId(Long id, Long groupId);

    // 🔹 CUSTOM PROJECTION (LIGHTWEIGHT RESPONSE)
    @Query("SELECT s.id as id, s.title as title, s.dateTime as dateTime FROM Session s WHERE s.groupId = :groupId")
    List<SessionSummary> findSessionSummaries(@Param("groupId") Long groupId);

    // 🔹 NATIVE QUERY (FOR PERFORMANCE - OPTIONAL)
    @Query(value = "SELECT * FROM session WHERE date_time BETWEEN :start AND :end", nativeQuery = true)
    List<Session> findSessionsNative(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}