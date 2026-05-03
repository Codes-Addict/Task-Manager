package com.taskmanager.domain.service;

import com.taskmanager.domain.entity.Project;
import com.taskmanager.domain.entity.Task;
import com.taskmanager.domain.entity.User;
import com.taskmanager.domain.repository.ProjectRepository;
import com.taskmanager.domain.repository.TaskRepository;
import com.taskmanager.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Task> getTasksByProject(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        // Only return top-level tasks (not subtasks)
        return taskRepository.findByProjectAndParentTaskIsNull(project);
    }

    @Transactional(readOnly = true)
    public List<Task> getAllTasksByProject(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        return taskRepository.findByProject(project);
    }

    @Transactional
    public Task createTask(Long projectId, Task task) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        task.setProject(project);
        return taskRepository.save(task);
    }

    // ─── Subtask Operations ─────────────────────────────────────

    public List<Task> getSubTasks(Long parentTaskId) {
        Task parentTask = taskRepository.findById(parentTaskId).orElseThrow();
        return taskRepository.findByParentTask(parentTask);
    }

    @Transactional
    public Task createSubTask(Long parentTaskId, Task subtask) {
        Task parentTask = taskRepository.findById(parentTaskId).orElseThrow();
        subtask.setProject(parentTask.getProject());
        subtask.setParentTask(parentTask);
        return taskRepository.save(subtask);
    }

    // ─── Status Updates ─────────────────────────────────────────

    @Transactional
    public Task updateTaskStatus(Long taskId, Task.TaskStatus status) {
        Task task = taskRepository.findById(taskId).orElseThrow();

        // When moving to IN_PROGRESS, set phase to PLANNING if no phase exists
        if (status == Task.TaskStatus.IN_PROGRESS) {
            if (task.getPhase() == null) {
                task.setPhase(Task.TaskPhase.PLANNING);
            }
            
            // Auto-start parent task if subtask is started
            if (task.getParentTask() != null) {
                Task parent = task.getParentTask();
                if (parent.getStatus() == Task.TaskStatus.TODO) {
                    parent.setStatus(Task.TaskStatus.IN_PROGRESS);
                    if (parent.getPhase() == null) {
                        parent.setPhase(Task.TaskPhase.PLANNING);
                    }
                    taskRepository.save(parent);
                }
            }
        }

        // When blocking, remember the current phase
        if (status == Task.TaskStatus.BLOCKED) {
            task.setBlockedAtPhase(task.getPhase());
        }

        // When unblocking (BLOCKED → IN_PROGRESS), restore the phase
        if (task.getStatus() == Task.TaskStatus.BLOCKED && status == Task.TaskStatus.IN_PROGRESS) {
            if (task.getBlockedAtPhase() != null) {
                task.setPhase(task.getBlockedAtPhase());
            }
            task.setBlockedAtPhase(null);
        }

        // When marking as DONE, verify all subtasks are done
        if (status == Task.TaskStatus.DONE) {
            List<Task> subTasks = taskRepository.findByParentTask(task);
            if (!subTasks.isEmpty()) {
                boolean allDone = subTasks.stream()
                        .allMatch(st -> st.getStatus() == Task.TaskStatus.DONE);
                if (!allDone) {
                    throw new IllegalStateException("Cannot mark task as done: not all subtasks are completed");
                }
            }
        }

        task.setStatus(status);
        return taskRepository.save(task);
    }

    // ─── Phase Updates ──────────────────────────────────────────

    @Transactional
    public Task updateTaskPhase(Long taskId, Task.TaskPhase phase) {
        Task task = taskRepository.findById(taskId).orElseThrow();

        // If phase is COMPLETED, also mark task as DONE
        if (phase == Task.TaskPhase.COMPLETED) {
            // Check subtasks first
            List<Task> subTasks = taskRepository.findByParentTask(task);
            if (!subTasks.isEmpty()) {
                boolean allDone = subTasks.stream()
                        .allMatch(st -> st.getStatus() == Task.TaskStatus.DONE);
                if (!allDone) {
                    throw new IllegalStateException("Cannot complete task: not all subtasks are done");
                }
            }
            task.setPhase(phase);
            task.setStatus(Task.TaskStatus.DONE);
        } else {
            task.setPhase(phase);
            
            // Auto-advance parent task to EXECUTION if a subtask reaches EXECUTION
            if (phase == Task.TaskPhase.EXECUTION && task.getParentTask() != null) {
                Task parent = task.getParentTask();
                if (parent.getPhase() != Task.TaskPhase.EXECUTION && parent.getPhase() != Task.TaskPhase.COMPLETED) {
                    parent.setPhase(Task.TaskPhase.EXECUTION);
                    if (parent.getStatus() == Task.TaskStatus.TODO) {
                        parent.setStatus(Task.TaskStatus.IN_PROGRESS);
                    }
                    taskRepository.save(parent);
                }
            }
        }

        return taskRepository.save(task);
    }

    @Transactional
    public void assignTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        task.setAssignee(user);
        taskRepository.save(task);
    }
}
