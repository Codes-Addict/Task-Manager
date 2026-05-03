package com.taskmanager.domain.repository;

import com.taskmanager.domain.entity.Project;
import com.taskmanager.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwner(User owner);
    
    @Query("SELECT pm.project FROM ProjectMember pm WHERE pm.user = :user")
    List<Project> findProjectsByUserMembership(User user);
}
