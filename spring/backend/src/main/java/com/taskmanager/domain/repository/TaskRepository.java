package com.taskmanager.domain.repository;

import com.taskmanager.domain.entity.Project;
import com.taskmanager.domain.entity.Task;
import com.taskmanager.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    // Only return top-level tasks (no parent) for the board view
    List<Task> findByProjectAndParentTaskIsNull(Project project);

    List<Task> findByProject(Project project);
    List<Task> findByAssignee(User assignee);
    List<Task> findByParentTask(Task parentTask);
}
