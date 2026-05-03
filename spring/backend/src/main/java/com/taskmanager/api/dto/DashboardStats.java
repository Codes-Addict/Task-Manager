package com.taskmanager.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStats {
    private long totalProjects;
    private long totalTasks;
    private Map<String, Long> tasksByStatus;
    private Map<String, Long> tasksByPriority;
}
