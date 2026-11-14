package com.campusconnect.notification.service;

import com.campusconnect.notification.document.ActivityLog;
import com.campusconnect.notification.dto.ActivityLogDto;
import com.campusconnect.notification.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final List<ActivityLog> fallbackStore = new CopyOnWriteArrayList<>();

    public List<ActivityLogDto> getRecentActivities() {
        try {
            return activityLogRepository.findTop50ByOrderByTimestampDesc().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            log.warn("MongoDB unavailable for activity logs, returning in-memory events: {}", ex.getMessage());
            return fallbackStore.stream()
                    .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                    .limit(50)
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
    }

    public ActivityLogDto logActivity(ActivityLogDto dto) {
        ActivityLog logEntry = ActivityLog.builder()
                .userId(dto.getUserId())
                .userName(dto.getUserName())
                .userRole(dto.getUserRole())
                .action(dto.getAction())
                .entityType(dto.getEntityType())
                .entityId(dto.getEntityId())
                .details(dto.getDetails())
                .timestamp(LocalDateTime.now())
                .build();

        try {
            ActivityLog saved = activityLogRepository.save(logEntry);
            return mapToDto(saved);
        } catch (Exception ex) {
            logEntry.setId(UUID.randomUUID().toString());
            fallbackStore.add(logEntry);
            return mapToDto(logEntry);
        }
    }

    public void addFallbackSeed(ActivityLog logEntry) {
        fallbackStore.add(logEntry);
    }

    public ActivityLogDto mapToDto(ActivityLog a) {
        return ActivityLogDto.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .userName(a.getUserName())
                .userRole(a.getUserRole())
                .action(a.getAction())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .details(a.getDetails())
                .timestamp(a.getTimestamp())
                .build();
    }
}
