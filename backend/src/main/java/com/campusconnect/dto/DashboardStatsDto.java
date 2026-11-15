package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalRequests;
    private long pendingRequests;
    private long inProgressRequests;
    private long resolvedRequests;
    private long totalFacilities;
    private long activeBookings;
    private long totalStudents;
    private List<Map<String, Object>> categoryStats;
    private List<Map<String, Object>> statusStats;
}
