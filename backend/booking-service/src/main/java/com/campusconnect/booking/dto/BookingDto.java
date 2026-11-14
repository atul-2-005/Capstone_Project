package com.campusconnect.booking.dto;

import com.campusconnect.booking.entity.BookingStatus;
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
public class BookingDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long facilityId;
    private String facilityName;
    private Long studentId;
    private String studentName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private BookingStatus status;
    private LocalDateTime createdAt;
}
