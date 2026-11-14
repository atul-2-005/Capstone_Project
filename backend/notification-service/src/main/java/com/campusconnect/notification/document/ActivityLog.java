package com.campusconnect.notification.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.time.LocalDateTime;

@Document(collection = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;
    private Long userId;
    private String userName;
    private String userRole;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;

    @CreatedDate
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
