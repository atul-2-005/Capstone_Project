package com.campusconnect.notification.controller;

import com.campusconnect.notification.dto.ActivityLogDto;
import com.campusconnect.notification.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
@Tag(name = "Activity Logs", description = "Endpoints for platform activity auditing and security event streams")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get recent system activity events (Admin only)")
    public ResponseEntity<List<ActivityLogDto>> getRecentActivities() {
        return ResponseEntity.ok(activityLogService.getRecentActivities());
    }

    @PostMapping
    @Operation(summary = "Log an activity event")
    public ResponseEntity<ActivityLogDto> logActivity(@RequestBody ActivityLogDto dto) {
        return new ResponseEntity<>(activityLogService.logActivity(dto), HttpStatus.CREATED);
    }
}
