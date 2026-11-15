package com.campusconnect.controller;

import com.campusconnect.dto.DashboardStatsDto;
import com.campusconnect.entity.Complaint;
import com.campusconnect.entity.User;
import com.campusconnect.service.AuthService;
import com.campusconnect.service.ComplaintService;
import com.campusconnect.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
public class DashboardController {

    private final DashboardService dashboardService;
    private final ComplaintService complaintService;
    private final AuthService authService;

    public DashboardController(DashboardService dashboardService,
                               ComplaintService complaintService,
                               AuthService authService) {
        this.dashboardService = dashboardService;
        this.complaintService = complaintService;
        this.authService = authService;
    }

    @GetMapping({"/api/dashboard/admin", "/api/dashboard/admin-stats"})
    public ResponseEntity<DashboardStatsDto> getAdminStats() {
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }

    @GetMapping("/api/dashboard/student")
    public ResponseEntity<Map<String, Object>> getStudentStats(Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(complaintService.getStats(user));
    }

    @GetMapping("/api/dashboard/staff")
    public ResponseEntity<Map<String, Object>> getStaffStats(Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(complaintService.getStats(user));
    }

    // In-app notifications mapped to recent complaint updates
    @GetMapping("/api/notifications")
    public ResponseEntity<Map<String, Object>> getNotifications(Authentication auth) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> notifs = new ArrayList<>();

        if (auth != null && auth.isAuthenticated()) {
            User user = authService.getUserByEmail(auth.getName());
            List<Complaint> complaints = complaintService.getMyComplaints(user.getId());

            for (Complaint c : complaints) {
                if ("RESOLVED".equalsIgnoreCase(c.getStatus()) || "ASSIGNED".equalsIgnoreCase(c.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(c.getStatus())) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", "notif-" + c.getId());
                    item.put("title", "Complaint " + c.getRequestNumber() + " is " + c.getStatus());
                    item.put("message", c.getTitle() + (c.getAssignedStaff() != null ? " (Staff: " + c.getAssignedStaff() + ")" : ""));
                    item.put("isRead", false);
                    item.put("read", false);
                    item.put("createdAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : c.getCreatedAt().toString());
                    notifs.add(item);
                }
            }
        }

        result.put("notifications", notifs);
        result.put("unreadCount", notifs.size());
        return ResponseEntity.ok(result);
    }

    @PatchMapping({"/api/notifications/{id}/read", "/api/notifications/read-all"})
    public ResponseEntity<?> markNotificationsRead() {
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }
}
