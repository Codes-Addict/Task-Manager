package com.taskmanager.domain.repository;

import com.taskmanager.domain.entity.Task;
import com.taskmanager.domain.entity.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findByTask(Task task);
}
