package com.campusconnect.request.dto;

import com.campusconnect.request.entity.ItemType;
import com.campusconnect.request.entity.LostFoundStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class LostFoundDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Item type (LOST or FOUND) is required")
    private ItemType itemType;

    @NotBlank(message = "Location is required")
    private String location;

    private String imageUrl;
    private Long ownerId;
    private String ownerName;
    private String contactInfo;
    private LostFoundStatus status;
    private LocalDateTime createdAt;
}
