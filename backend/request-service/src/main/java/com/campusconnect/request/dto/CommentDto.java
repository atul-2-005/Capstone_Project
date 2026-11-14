package com.campusconnect.request.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CommentDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private Long requestId;
    private Long authorId;
    private String authorName;
    private String authorRole;

    @NotBlank(message = "Comment cannot be blank")
    private String comment;

    private LocalDateTime createdAt;
}
