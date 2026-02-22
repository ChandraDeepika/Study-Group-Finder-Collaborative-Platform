package com.studygroup.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studygroup.backend.dto.CreateGroupRequest;
import com.studygroup.backend.dto.GroupResponse;
import com.studygroup.backend.service.StudyGroupService;

@RestController
@RequestMapping("/api/groups")
public class StudyGroupController {

    private final StudyGroupService service;

    public StudyGroupController(StudyGroupService service) {
        this.service = service;
    }

    @PostMapping
    public GroupResponse createGroup(@RequestBody CreateGroupRequest request) {
        return service.createGroup(request);
    }
}