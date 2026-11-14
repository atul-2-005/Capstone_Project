package com.campusconnect.notification.data;

import com.campusconnect.notification.document.ActivityLog;
import com.campusconnect.notification.document.Notification;
import com.campusconnect.notification.document.NotificationType;
import com.campusconnect.notification.repository.ActivityLogRepository;
import com.campusconnect.notification.repository.NotificationRepository;
import com.campusconnect.notification.service.ActivityLogService;
import com.campusconnect.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationSeedData implements CommandLineRunner {

    private final NotificationRepository notificationRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    @Override
    public void run(String... args) {
        seedNotifications();
        seedActivityLogs();
    }

    private void seedNotifications() {
        log.info("Seeding realistic notifications...");

        Notification n1 = Notification.builder()
                .id(UUID.randomUUID().toString())
                .recipientId(5L) // Alex Rivera
                .title("Service Request In Progress")
                .message("Your request REQ-2026-0001 (WiFi Access Point Down) has been accepted by Marcus Chen.")
                .type(NotificationType.REQUEST_UPDATE)
                .referenceId(1L)
                .referenceType("REQUEST")
                .isRead(false)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        Notification n2 = Notification.builder()
                .id(UUID.randomUUID().toString())
                .recipientId(5L)
                .title("Facility Booking Confirmed")
                .message("Your reservation for Advanced Computing & AI Research Lab on tomorrow at 14:00 is confirmed.")
                .type(NotificationType.BOOKING_CONFIRMED)
                .referenceId(1L)
                .referenceType("BOOKING")
                .isRead(false)
                .createdAt(LocalDateTime.now().minusHours(5))
                .build();

        Notification n3 = Notification.builder()
                .id(UUID.randomUUID().toString())
                .recipientId(6L) // Sophia Martinez
                .title("Complaint Resolved")
                .message("REQ-2026-0002 (Ceiling AC Water Leakage) was resolved by Robert Miller: 'Drainage pipe unblocked'.")
                .type(NotificationType.REQUEST_UPDATE)
                .referenceId(2L)
                .referenceType("REQUEST")
                .isRead(true)
                .createdAt(LocalDateTime.now().minusHours(4))
                .build();

        try {
            if (notificationRepository.count() == 0) {
                notificationRepository.save(n1);
                notificationRepository.save(n2);
                notificationRepository.save(n3);
            }
        } catch (Exception ex) {
            log.warn("Mongo notification seed saved to fallback store: {}", ex.getMessage());
            notificationService.addFallbackSeed(n1);
            notificationService.addFallbackSeed(n2);
            notificationService.addFallbackSeed(n3);
        }
    }

    private void seedActivityLogs() {
        log.info("Seeding audit activity logs...");

        ActivityLog a1 = ActivityLog.builder()
                .id(UUID.randomUUID().toString())
                .userId(1L)
                .userName("Dr. Eleanor Vance (System Admin)")
                .userRole("ADMIN")
                .action("ASSIGN_STAFF")
                .entityType("SERVICE_REQUEST")
                .entityId(1L)
                .details("Assigned REQ-2026-0001 to Marcus Chen (IT Lead)")
                .timestamp(LocalDateTime.now().minusHours(3))
                .build();

        ActivityLog a2 = ActivityLog.builder()
                .id(UUID.randomUUID().toString())
                .userId(5L)
                .userName("Alex Rivera")
                .userRole("STUDENT")
                .action("CREATE_BOOKING")
                .entityType("FACILITY_BOOKING")
                .entityId(1L)
                .details("Booked Advanced Computing & AI Research Lab for 3 hours")
                .timestamp(LocalDateTime.now().minusHours(5))
                .build();

        ActivityLog a3 = ActivityLog.builder()
                .id(UUID.randomUUID().toString())
                .userId(3L)
                .userName("Robert Miller (Facilities Supervisor)")
                .userRole("STAFF")
                .action("STATUS_RESOLVED")
                .entityType("SERVICE_REQUEST")
                .entityId(2L)
                .details("Resolved REQ-2026-0002 (Ceiling AC Water Leakage)")
                .timestamp(LocalDateTime.now().minusHours(4))
                .build();

        try {
            if (activityLogRepository.count() == 0) {
                activityLogRepository.save(a1);
                activityLogRepository.save(a2);
                activityLogRepository.save(a3);
            }
        } catch (Exception ex) {
            log.warn("Mongo activity log seed saved to fallback store: {}", ex.getMessage());
            activityLogService.addFallbackSeed(a1);
            activityLogService.addFallbackSeed(a2);
            activityLogService.addFallbackSeed(a3);
        }
    }
}
