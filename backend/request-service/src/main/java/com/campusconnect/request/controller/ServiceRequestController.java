package com.campusconnect.request.controller;

import com.campusconnect.request.dto.*;
import com.campusconnect.request.entity.RequestCategory;
import com.campusconnect.request.entity.RequestPriority;
import com.campusconnect.request.entity.RequestStatus;
import com.campusconnect.request.security.UserContext;
import com.campusconnect.request.service.ServiceRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@Tag(name = "Service Requests", description = "Endpoints for managing campus service complaints and requests")
public class ServiceRequestController {

    private final ServiceRequestService requestService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    @Operation(summary = "Submit a new service request / complaint")
    public ResponseEntity<RequestDto> createRequest(
            @Valid @RequestBody CreateRequestDto dto,
            @AuthenticationPrincipal UserContext user) {
        return new ResponseEntity<>(requestService.createRequest(dto, user), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all service requests with filters (Admin only)")
    public ResponseEntity<Page<RequestDto>> getAllRequests(
            @RequestParam(required = false) RequestCategory category,
            @RequestParam(required = false) RequestPriority priority,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

        return ResponseEntity.ok(requestService.getAllRequests(category, priority, status, departmentId, search, pageRequest));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current student's submitted requests")
    public ResponseEntity<List<RequestDto>> getMyRequests(@AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(requestService.getMyRequests(user));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    @Operation(summary = "Get requests assigned to the current staff member")
    public ResponseEntity<List<RequestDto>> getAssignedRequests(@AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(requestService.getAssignedRequests(user));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get aggregate statistics on service requests")
    public ResponseEntity<RequestStatsDto> getRequestStats() {
        return ResponseEntity.ok(requestService.getRequestStats());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed service request with history and comments")
    public ResponseEntity<RequestDto> getRequestById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(requestService.getRequestById(id, user));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    @Operation(summary = "Update request status (requires resolution notes if resolved)")
    public ResponseEntity<RequestDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusDto dto,
            @AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(requestService.updateRequestStatus(id, dto, user));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign service request to staff member and department (Admin only)")
    public ResponseEntity<RequestDto> assignRequest(
            @PathVariable Long id,
            @Valid @RequestBody AssignRequestDto dto,
            @AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(requestService.assignRequest(id, dto, user));
    }

    @PatchMapping("/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update request priority level (Admin only)")
    public ResponseEntity<RequestDto> updatePriority(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePriorityDto dto,
            @AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(requestService.updatePriority(id, dto, user));
    }
}
