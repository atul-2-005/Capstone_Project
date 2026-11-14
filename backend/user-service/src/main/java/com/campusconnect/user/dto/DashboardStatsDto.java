package com.campusconnect.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto implements Serializable {
    private static final long serialVersionUID = 1L;

    // Admin Metrics
    private long totalStudents;
    private long totalStaff;
    private long totalRequests;
    private long pendingRequests;
    private long inProgressRequests;
    private long resolvedRequests;
    private long activeBookings;
    private double averageResolutionTimeHours;

    // Charts & breakdowns
    private Map<String, Long> requestsByCategory;
    private Map<String, Long> requestsByStatus;
    private Map<String, Long> requestsByDepartment;
    private List<Map<String, Object>> monthlyTrends;
    private List<Map<String, Object>> staffWorkload;
}
