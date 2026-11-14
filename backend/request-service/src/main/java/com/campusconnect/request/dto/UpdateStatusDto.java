package com.campusconnect.request.dto;

import com.campusconnect.request.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusDto {

    @NotNull(message = "New status is required")
    private RequestStatus status;

    private String resolutionNotes;

    private String comment;
}
