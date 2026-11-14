package com.campusconnect.request.dto;

import com.campusconnect.request.entity.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestHistoryDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long requestId;
    private String action;
    private RequestStatus statusFrom;
    private RequestStatus statusTo;
    private Long performedBy;
    private String performedByName;
    private String comments;
    private LocalDateTime timestamp;
}
