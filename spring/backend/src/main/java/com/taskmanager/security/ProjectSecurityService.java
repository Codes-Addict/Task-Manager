package com.taskmanager.security;

import com.taskmanager.domain.entity.ProjectMember;
import com.taskmanager.domain.entity.User;
import com.taskmanager.domain.repository.ProjectMemberRepository;
import com.taskmanager.domain.repository.ProjectRepository;
import com.taskmanager.domain.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service("projectSecurity")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectSecurityService {

    private static final Logger log = LoggerFactory.getLogger(ProjectSecurityService.class);

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;

    public boolean canModifyTask(Long taskId) {
        return taskRepository.findById(taskId)
                .map(task -> hasRole(task.getProject().getId(), "CONTRIBUTOR"))
                .orElse(false);
    }

    public boolean canViewTask(Long taskId) {
        return taskRepository.findById(taskId)
                .map(task -> isMember(task.getProject().getId()))
                .orElse(false);
    }

    public boolean isMember(Long projectId) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof User)) {
                log.warn("Principal is not a User object: {}", principal);
                return false;
            }
            User user = (User) principal;
            Long userId = user.getId();
            
            log.info("Checking isMember for projectId={}, userId={}", projectId, userId);
            
            return projectRepository.findById(projectId)
                    .map(project -> {
                        boolean isOwner = project.getOwner().getId().equals(userId);
                        boolean isMember = projectMemberRepository.findByProjectAndUser(project, user).isPresent();
                        log.info("Project found. isOwner={}, isMember={}", isOwner, isMember);
                        return isOwner || isMember;
                    })
                    .orElseGet(() -> {
                        log.warn("Project not found: {}", projectId);
                        return false;
                    });
        } catch (Exception e) {
            log.error("Error in isMember check", e);
            return false;
        }
    }

    public boolean isOwner(Long projectId) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof User)) return false;
            User user = (User) principal;
            Long userId = user.getId();
            
            return projectRepository.findById(projectId)
                    .map(project -> project.getOwner().getId().equals(userId))
                    .orElse(false);
        } catch (Exception e) {
            log.error("Error in isOwner check", e);
            return false;
        }
    }

    public boolean hasRole(Long projectId, String role) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return projectRepository.findById(projectId)
                .map(project -> {
                    if (project.getOwner().getId().equals(user.getId())) return true;
                    return projectMemberRepository.findByProjectAndUser(project, user)
                            .map(member -> member.getRole().name().equalsIgnoreCase(role))
                            .orElse(false);
                })
                .orElse(false);
    }
}
