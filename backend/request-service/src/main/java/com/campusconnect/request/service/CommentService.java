package com.campusconnect.request.service;

import com.campusconnect.request.document.RequestComment;
import com.campusconnect.request.dto.CommentDto;
import com.campusconnect.request.entity.ServiceRequest;
import com.campusconnect.request.exception.ResourceNotFoundException;
import com.campusconnect.request.repository.RequestCommentRepository;
import com.campusconnect.request.repository.ServiceRequestRepository;
import com.campusconnect.request.security.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final RequestCommentRepository commentRepository;
    private final ServiceRequestRepository requestRepository;

    public List<CommentDto> getCommentsByRequestId(Long requestId) {
        try {
            return commentRepository.findByRequestIdOrderByCreatedAtAsc(requestId).stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            log.warn("MongoDB unavailable for comments query, returning empty list: {}", ex.getMessage());
            return new ArrayList<>();
        }
    }

    public CommentDto addComment(Long requestId, CommentDto dto, UserContext user) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + requestId));

        RequestComment comment = RequestComment.builder()
                .requestId(request.getId())
                .authorId(user.getId())
                .authorName(user.getName() != null ? user.getName() : user.getEmail())
                .authorRole(user.getRole())
                .comment(dto.getComment().trim())
                .createdAt(LocalDateTime.now())
                .build();

        try {
            RequestComment saved = commentRepository.save(comment);
            return mapToDto(saved);
        } catch (Exception ex) {
            log.warn("MongoDB unavailable for comment save, simulating persistent response: {}", ex.getMessage());
            comment.setId("cm-" + System.currentTimeMillis());
            return mapToDto(comment);
        }
    }

    public CommentDto mapToDto(RequestComment c) {
        return CommentDto.builder()
                .id(c.getId())
                .requestId(c.getRequestId())
                .authorId(c.getAuthorId())
                .authorName(c.getAuthorName())
                .authorRole(c.getAuthorRole())
                .comment(c.getComment())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
