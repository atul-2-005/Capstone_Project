package com.campusconnect.request.controller;

import com.campusconnect.request.dto.CommentDto;
import com.campusconnect.request.security.UserContext;
import com.campusconnect.request.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests/{requestId}/comments")
@RequiredArgsConstructor
@Tag(name = "Request Comments", description = "Endpoints for communication on service requests (MongoDB)")
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    @Operation(summary = "Get all comments for a service request")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long requestId) {
        return ResponseEntity.ok(commentService.getCommentsByRequestId(requestId));
    }

    @PostMapping
    @Operation(summary = "Add a comment to a service request")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long requestId,
            @Valid @RequestBody CommentDto dto,
            @AuthenticationPrincipal UserContext user) {
        return new ResponseEntity<>(commentService.addComment(requestId, dto, user), HttpStatus.CREATED);
    }
}
