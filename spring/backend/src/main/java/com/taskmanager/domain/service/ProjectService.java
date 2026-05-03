package com.taskmanager.domain.service;

import com.taskmanager.domain.entity.Project;
import com.taskmanager.domain.entity.ProjectMember;
import com.taskmanager.domain.entity.User;
import com.taskmanager.domain.repository.ProjectMemberRepository;
import com.taskmanager.domain.repository.ProjectRepository;
import com.taskmanager.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public List<Project> getMyProjects() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Project> projects = projectRepository.findProjectsByUserMembership(user);
        
        // Populate the transient currentUserRole for the frontend
        for (Project project : projects) {
            projectMemberRepository.findByProjectAndUser(project, user)
                    .ifPresent(member -> project.setCurrentUserRole(member.getRole().name()));
        }
        
        return projects;
    }

    @Transactional
    public Project createProject(Project project) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        project.setOwner(user);
        Project savedProject = projectRepository.save(project);
        
        // Add owner as a member with OWNER role
        ProjectMember ownerMember = ProjectMember.builder()
                .project(savedProject)
                .user(user)
                .role(ProjectMember.ProjectRole.OWNER)
                .build();
        projectMemberRepository.save(ownerMember);
        
        return savedProject;
    }

    @Transactional
    public void addMember(Long projectId, String email, ProjectMember.ProjectRole role) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        User userToAdd = userRepository.findByEmail(email).orElseThrow();
        
        if (projectMemberRepository.findByProjectAndUser(project, userToAdd).isPresent()) {
            return; // Already a member
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(userToAdd)
                .role(role)
                .build();
        projectMemberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public List<User> getProjectMembers(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        // Return owner + all project members
        List<User> members = projectMemberRepository.findByProject(project).stream()
                .map(ProjectMember::getUser)
                .collect(java.util.stream.Collectors.toList());
        
        // Owner might already be in members table based on createProject logic, but just in case:
        boolean hasOwner = members.stream().anyMatch(m -> m.getId().equals(project.getOwner().getId()));
        if (!hasOwner) {
            members.add(project.getOwner());
        }
        return members;
    }
}
