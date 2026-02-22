package com.studygroup.backend.repository;

import com.studygroup.backend.model.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
}
