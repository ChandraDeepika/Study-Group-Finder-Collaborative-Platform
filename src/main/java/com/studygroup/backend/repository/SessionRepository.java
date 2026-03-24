package com.studygroup.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studygroup.backend.model.Session;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByStudyGroupId(Long groupId);
}