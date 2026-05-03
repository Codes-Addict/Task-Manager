package com.taskmanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    private TaskPriority priority;

    @Enumerated(EnumType.STRING)
    private TaskPhase phase;

    @Enumerated(EnumType.STRING)
    private TaskPhase blockedAtPhase;

    private LocalDateTime dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_task_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Task parentTask;

    @OneToMany(mappedBy = "parentTask", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Task> subTasks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Transient field to expose parent task ID in JSON
    @Transient
    public Long getParentTaskId() {
        return parentTask != null ? parentTask.getId() : null;
    }

    // Transient field to expose subtask count in JSON
    @Transient
    public int getSubTaskCount() {
        return subTasks != null ? subTasks.size() : 0;
    }

    // Transient field to expose completed subtask count in JSON
    @Transient
    public long getSubTaskDoneCount() {
        if (subTasks == null || subTasks.isEmpty()) return 0;
        return subTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = TaskStatus.TODO;
        if (priority == null) priority = TaskPriority.MEDIUM;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TaskStatus {
        TODO, IN_PROGRESS, DONE, BLOCKED
    }

    public enum TaskPriority {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum TaskPhase {
        PLANNING, DESIGNING, EXECUTION, COMPLETED
    }
}
