package com.taskmanager.domain.service;

import com.taskmanager.api.dto.DashboardStats;
import com.taskmanager.domain.entity.Project;
import com.taskmanager.domain.entity.Task;
import com.taskmanager.domain.entity.User;
import com.taskmanager.domain.repository.ProjectRepository;
import com.taskmanager.domain.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public DashboardStats getStats() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Project> myProjects = projectRepository.findProjectsByUserMembership(user);
        
        long totalProjects = myProjects.size();
        List<Task> allTasks = myProjects.stream()
                .flatMap(p -> taskRepository.findByProject(p).stream())
                .toList();

        long totalTasks = allTasks.size();
        Map<String, Long> tasksByStatus = allTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
        
        Map<String, Long> tasksByPriority = allTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting()));

        return DashboardStats.builder()
                .totalProjects(totalProjects)
                .totalTasks(totalTasks)
                .tasksByStatus(tasksByStatus)
                .tasksByPriority(tasksByPriority)
                .build();
    }
}
