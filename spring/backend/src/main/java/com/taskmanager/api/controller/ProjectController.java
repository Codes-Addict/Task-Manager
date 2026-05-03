package com.taskmanager.api.controller;

import com.taskmanager.domain.entity.Project;
import com.taskmanager.domain.entity.ProjectMember;
import com.taskmanager.domain.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> getMyProjects() {
        return ResponseEntity.ok(projectService.getMyProjects());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        return ResponseEntity.ok(projectService.createProject(project));
    }

    @PostMapping("/{projectId}/members")
    @PreAuthorize("@projectSecurity.isOwner(#projectId)")
    public ResponseEntity<Void> addMember(
            @PathVariable Long projectId,
            @RequestParam String email,
            @RequestParam ProjectMember.ProjectRole role
    ) {
        projectService.addMember(projectId, email, role);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{projectId}/members")
    @PreAuthorize("@projectSecurity.isMember(#projectId)")
    public ResponseEntity<List<com.taskmanager.domain.entity.User>> getMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectMembers(projectId));
    }
}
