package com.studygroup.backend.repository;

import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.enums.GroupPrivacy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {

    // 🔍 Filter by group privacy (PUBLIC / PRIVATE)
    List<StudyGroup> findByPrivacy(GroupPrivacy privacy);

    // 🔍 Search by name or description (case-insensitive)
    List<StudyGroup> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String nameKeyword,
            String descriptionKeyword
    );

    /*
     * 🔍 Filter by course
     * ⚠️ ENABLE THIS ONLY IF StudyGroup HAS:
     * private Course course;
     */
    List<StudyGroup> findByCourseId(Long courseId);
}