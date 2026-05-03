package com.taskmanager.domain.repository;

import com.taskmanager.domain.entity.Project;
import com.taskmanager.domain.entity.ProjectMember;
import com.taskmanager.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
    java.util.List<ProjectMember> findByProject(Project project);
}
