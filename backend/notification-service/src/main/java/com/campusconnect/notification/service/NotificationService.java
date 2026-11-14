package com.campusconnect.notification.service;

import com.campusconnect.notification.document.Notification;
import com.campusconnect.notification.document.NotificationType;
import com.campusconnect.notification.dto.CreateNotificationDto;
import com.campusconnect.notification.dto.NotificationDto;
import com.campusconnect.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // Fallback in-memory store for seamless standalone execution
    private final List<Notification> fallbackStore = new CopyOnWriteArrayList<>();

    public Map<String, Object> getUserNotifications(Long recipientId) {
        List<NotificationDto> dtoList;
        long unreadCount = 0;

        try {
            List<Notification> list = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
            unreadCount = notificationRepository.countByRecipientIdAndIsReadFalse(recipientId);
            dtoList = list.stream().map(this::mapToDto).collect(Collectors.toList());
        } catch (Exception ex) {
            log.warn("MongoDB unavailable, falling back to in-memory notification registry: {}", ex.getMessage());
            List<Notification> filtered = fallbackStore.stream()
                    .filter(n -> n.getRecipientId().equals(recipientId))
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .collect(Collectors.toList());
            unreadCount = filtered.stream().filter(n -> !n.isRead()).count();
            dtoList = filtered.stream().map(this::mapToDto).collect(Collectors.toList());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", dtoList);
        response.put("unreadCount", unreadCount);
        return response;
    }

    public NotificationDto createNotification(CreateNotificationDto dto) {
        Notification notification = Notification.builder()
                .recipientId(dto.getRecipientId())
                .title(dto.getTitle())
                .message(dto.getMessage())
                .type(dto.getType())
                .referenceId(dto.getReferenceId())
                .referenceType(dto.getReferenceType())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        try {
            Notification saved = notificationRepository.save(notification);
            return mapToDto(saved);
        } catch (Exception ex) {
            log.warn("MongoDB unavailable for saving notification, using fallback: {}", ex.getMessage());
            notification.setId(UUID.randomUUID().toString());
            fallbackStore.add(notification);
            return mapToDto(notification);
        }
    }

    public void markAsRead(String id) {
        try {
            notificationRepository.findById(id).ifPresent(n -> {
                n.setRead(true);
                notificationRepository.save(n);
            });
        } catch (Exception ex) {
            fallbackStore.stream()
                    .filter(n -> id.equals(n.getId()))
                    .findFirst()
                    .ifPresent(n -> n.setRead(true));
        }
    }

    public void markAllAsRead(Long recipientId) {
        try {
            List<Notification> list = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
            list.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(list);
        } catch (Exception ex) {
            fallbackStore.stream()
                    .filter(n -> n.getRecipientId().equals(recipientId))
                    .forEach(n -> n.setRead(true));
        }
    }

    public void addFallbackSeed(Notification n) {
        fallbackStore.add(n);
    }

    public NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .recipientId(n.getRecipientId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
