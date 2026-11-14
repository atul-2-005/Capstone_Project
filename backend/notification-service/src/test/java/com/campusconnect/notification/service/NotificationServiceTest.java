package com.campusconnect.notification.service;

import com.campusconnect.notification.document.Notification;
import com.campusconnect.notification.document.NotificationType;
import com.campusconnect.notification.dto.CreateNotificationDto;
import com.campusconnect.notification.dto.NotificationDto;
import com.campusconnect.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification notification;

    @BeforeEach
    void setUp() {
        notification = Notification.builder()
                .id("notif-1")
                .recipientId(5L)
                .title("Test Alert")
                .message("Request assigned")
                .type(NotificationType.REQUEST_UPDATE)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should return user notifications with unread count")
    void getUserNotifications_Success() {
        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(5L)).thenReturn(List.of(notification));
        when(notificationRepository.countByRecipientIdAndIsReadFalse(5L)).thenReturn(1L);

        Map<String, Object> result = notificationService.getUserNotifications(5L);

        assertNotNull(result);
        assertEquals(1L, result.get("unreadCount"));
        List<?> list = (List<?>) result.get("notifications");
        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("Should create notification successfully")
    void createNotification_Success() {
        CreateNotificationDto dto = CreateNotificationDto.builder()
                .recipientId(5L)
                .title("New Message")
                .message("Staff commented")
                .type(NotificationType.REQUEST_UPDATE)
                .build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationDto result = notificationService.createNotification(dto);

        assertNotNull(result);
        assertEquals("Test Alert", result.getTitle());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }
}
