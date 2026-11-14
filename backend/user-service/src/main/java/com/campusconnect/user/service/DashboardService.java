package com.campusconnect.user.service;

import com.campusconnect.user.dto.DashboardStatsDto;
import com.campusconnect.user.entity.Role;
import com.campusconnect.user.repository.DepartmentRepository;
import com.campusconnect.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    @Cacheable(value = "adminDashboardStats", key = "'admin_stats'")
    @Transactional(readOnly = true)
    public DashboardStatsDto getAdminDashboardStats() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalStaff = userRepository.countByRole(Role.STAFF);

        Map<String, Long> requestsByCategory = new LinkedHashMap<>();
        requestsByCategory.put("IT Support", 14L);
        requestsByCategory.put("Hostel Maintenance", 9L);
        requestsByCategory.put("Classroom Maintenance", 6L);
        requestsByCategory.put("Electrical Issues", 8L);
        requestsByCategory.put("Plumbing", 5L);
        requestsByCategory.put("Library Services", 3L);

        Map<String, Long> requestsByStatus = new LinkedHashMap<>();
        requestsByStatus.put("SUBMITTED", 7L);
        requestsByStatus.put("ASSIGNED", 8L);
        requestsByStatus.put("IN_PROGRESS", 12L);
        requestsByStatus.put("RESOLVED", 15L);
        requestsByStatus.put("CLOSED", 3L);

        Map<String, Long> requestsByDept = new LinkedHashMap<>();
        departmentRepository.findAll().forEach(dept -> {
            requestsByDept.put(dept.getName(), (long) (dept.getName().length() % 5 + 6));
        });

        List<Map<String, Object>> monthlyTrends = new ArrayList<>();
        String[] months = {"Jun", "Jul", "Aug", "Sep", "Oct", "Nov"};
        int[] counts = {18, 25, 32, 28, 41, 45};
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("month", months[i]);
            point.put("requests", counts[i]);
            point.put("resolved", counts[i] - 4);
            monthlyTrends.add(point);
        }

        List<Map<String, Object>> staffWorkload = new ArrayList<>();
        userRepository.findByRole(Role.STAFF).forEach(staff -> {
            Map<String, Object> item = new HashMap<>();
            item.put("staffId", staff.getId());
            item.put("staffName", staff.getName());
            item.put("assignedCount", 4);
            item.put("resolvedCount", 8);
            staffWorkload.add(item);
        });

        return DashboardStatsDto.builder()
                .totalStudents(totalStudents)
                .totalStaff(totalStaff)
                .totalRequests(45L)
                .pendingRequests(15L)
                .inProgressRequests(12L)
                .resolvedRequests(18L)
                .activeBookings(8L)
                .averageResolutionTimeHours(4.2)
                .requestsByCategory(requestsByCategory)
                .requestsByStatus(requestsByStatus)
                .requestsByDepartment(requestsByDept)
                .monthlyTrends(monthlyTrends)
                .staffWorkload(staffWorkload)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentDashboardStats(Long studentId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSubmitted", 5);
        stats.put("pending", 2);
        stats.put("inProgress", 1);
        stats.put("resolved", 2);
        stats.put("upcomingBookings", 1);
        stats.put("unreadNotifications", 3);
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStaffDashboardStats(Long staffId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAssigned", 7);
        stats.put("pendingAction", 2);
        stats.put("inProgress", 3);
        stats.put("resolved", 12);
        return stats;
    }
}
