package com.taskmanager.api.controller;

import com.taskmanager.domain.entity.Task;
import com.taskmanager.domain.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/project/{projectId}")
    @PreAuthorize("@projectSecurity.isMember(#projectId)")
    public ResponseEntity<List<Task>> getTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @GetMapping("/project/{projectId}/all")
    @PreAuthorize("@projectSecurity.isMember(#projectId)")
    public ResponseEntity<List<Task>> getAllTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getAllTasksByProject(projectId));
    }

    @PostMapping("/project/{projectId}")
    @PreAuthorize("@projectSecurity.hasRole(#projectId, 'CONTRIBUTOR') or @projectSecurity.isOwner(#projectId)")
    public ResponseEntity<Task> createTask(@PathVariable Long projectId, @RequestBody Task task) {
        return ResponseEntity.ok(taskService.createTask(projectId, task));
    }

    @PatchMapping("/{taskId}/status")
    @PreAuthorize("@projectSecurity.canModifyTask(#taskId)")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long taskId,
            @RequestParam Task.TaskStatus status
    ) {
        try {
            return ResponseEntity.ok(taskService.updateTaskStatus(taskId, status));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{taskId}/phase")
    @PreAuthorize("@projectSecurity.canModifyTask(#taskId)")
    public ResponseEntity<?> updatePhase(
            @PathVariable Long taskId,
            @RequestParam Task.TaskPhase phase
    ) {
        try {
            return ResponseEntity.ok(taskService.updateTaskPhase(taskId, phase));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Subtask Endpoints ──────────────────────────────────────

    @GetMapping("/{taskId}/subtasks")
    @PreAuthorize("@projectSecurity.canViewTask(#taskId)")
    public ResponseEntity<List<Task>> getSubTasks(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getSubTasks(taskId));
    }

    @PostMapping("/{taskId}/subtasks")
    @PreAuthorize("@projectSecurity.canModifyTask(#taskId)")
    public ResponseEntity<Task> createSubTask(
            @PathVariable Long taskId,
            @RequestBody Task subtask
    ) {
        return ResponseEntity.ok(taskService.createSubTask(taskId, subtask));
    }

    @PostMapping("/{taskId}/assign")
    @PreAuthorize("@projectSecurity.canModifyTask(#taskId)")
    public ResponseEntity<Void> assignTask(
            @PathVariable Long taskId,
            @RequestParam Long userId
    ) {
        taskService.assignTask(taskId, userId);
        return ResponseEntity.ok().build();
    }
}
