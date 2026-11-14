package com.campusconnect.request.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_requests", indexes = {
    @Index(name = "idx_req_student", columnList = "studentId"),
    @Index(name = "idx_req_staff", columnList = "assignedStaffId"),
    @Index(name = "idx_req_status", columnList = "status"),
    @Index(name = "idx_req_dept", columnList = "departmentId"),
    @Index(name = "idx_req_number", columnList = "requestNumber", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String requestNumber; // e.g. REQ-2026-0001

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RequestCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestPriority priority = RequestPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.SUBMITTED;

    @Column(nullable = false, length = 100)
    private String location;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false, length = 100)
    private String studentName;

    private Long assignedStaffId;

    @Column(length = 100)
    private String assignedStaffName;

    private Long departmentId;

    @Column(length = 100)
    private String departmentName;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;
}
