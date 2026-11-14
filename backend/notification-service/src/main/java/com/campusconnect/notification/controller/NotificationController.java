package com.campusconnect.notification.controller;

import com.campusconnect.notification.dto.CreateNotificationDto;
import com.campusconnect.notification.dto.NotificationDto;
import com.campusconnect.notification.security.UserContext;
import com.campusconnect.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for user alerts, system updates, and unread badges")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get current user notifications with unread badge count")
    public ResponseEntity<Map<String, Object>> getMyNotifications(@AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @PostMapping
    @Operation(summary = "Create an in-app notification")
    public ResponseEntity<NotificationDto> createNotification(@Valid @RequestBody CreateNotificationDto dto) {
        return new ResponseEntity<>(notificationService.createNotification(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<Map<String, String>> markAllAsRead(@AuthenticationPrincipal UserContext user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
