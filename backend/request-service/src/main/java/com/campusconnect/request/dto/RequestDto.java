package com.campusconnect.request.dto;

import com.campusconnect.request.entity.RequestCategory;
import com.campusconnect.request.entity.RequestPriority;
import com.campusconnect.request.entity.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String requestNumber;
    private String title;
    private String description;
    private RequestCategory category;
    private RequestPriority priority;
    private RequestStatus status;
    private String location;
    private Long studentId;
    private String studentName;
    private Long assignedStaffId;
    private String assignedStaffName;
    private Long departmentId;
    private String departmentName;
    private String resolutionNotes;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    private List<RequestHistoryDto> history;
    private List<CommentDto> comments;
}
