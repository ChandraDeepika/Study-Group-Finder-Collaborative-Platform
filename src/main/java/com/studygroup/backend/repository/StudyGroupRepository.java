package com.studygroup.backend.repository;

import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.enums.GroupPrivacy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {

    List<StudyGroup> findByPrivacy(GroupPrivacy privacy);

    List<StudyGroup> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String nameKeyword, String descriptionKeyword);

    List<StudyGroup> findByCourse_Id(Long courseId);

    // Optimized: combined filter + keyword (single DB query, avoids N+1)
    @Query("SELECT g FROM StudyGroup g " +
           "JOIN FETCH g.createdBy " +
           "JOIN FETCH g.course " +
           "WHERE (:privacy IS NULL OR g.privacy = :privacy) " +
           "AND (:courseId IS NULL OR g.course.id = :courseId) " +
           "AND (:keyword IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(g.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<StudyGroup> filterGroups(
            @Param("privacy") GroupPrivacy privacy,
            @Param("courseId") Long courseId,
            @Param("keyword") String keyword);

    // Optimized: with pagination + sorting
    @Query("SELECT g FROM StudyGroup g " +
           "JOIN FETCH g.createdBy " +
           "JOIN FETCH g.course " +
           "WHERE (:privacy IS NULL OR g.privacy = :privacy) " +
           "AND (:courseId IS NULL OR g.course.id = :courseId) " +
           "AND (:keyword IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(g.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<StudyGroup> filterGroupsPaged(
            @Param("privacy") GroupPrivacy privacy,
            @Param("courseId") Long courseId,
            @Param("keyword") String keyword,
            Pageable pageable);
}