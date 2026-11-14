package com.campusconnect.request.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "request_history", indexes = {
    @Index(name = "idx_history_request", columnList = "requestId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long requestId;

    @Column(nullable = false, length = 50)
    private String action; // CREATED, ASSIGNED, STATUS_CHANGED, PRIORITY_CHANGED, COMMENT_ADDED

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RequestStatus statusFrom;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RequestStatus statusTo;

    @Column(nullable = false)
    private Long performedBy;

    @Column(nullable = false, length = 100)
    private String performedByName;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
