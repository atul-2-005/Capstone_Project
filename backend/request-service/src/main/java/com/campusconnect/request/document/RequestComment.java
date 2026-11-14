package com.campusconnect.request.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.time.LocalDateTime;

@Document(collection = "request_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestComment implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;
    private Long requestId;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String comment;

    @CreatedDate
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
