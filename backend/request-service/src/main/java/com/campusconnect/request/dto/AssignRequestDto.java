package com.campusconnect.request.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignRequestDto {

    @NotNull(message = "Assigned staff ID is required")
    private Long staffId;

    private String staffName;

    private Long departmentId;

    private String departmentName;

    private String notes;
}
