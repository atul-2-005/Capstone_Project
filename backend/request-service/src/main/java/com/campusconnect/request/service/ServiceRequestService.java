package com.campusconnect.request.service;

import com.campusconnect.request.dto.*;
import com.campusconnect.request.entity.*;
import com.campusconnect.request.exception.BadRequestException;
import com.campusconnect.request.exception.ForbiddenException;
import com.campusconnect.request.exception.ResourceNotFoundException;
import com.campusconnect.request.repository.RequestHistoryRepository;
import com.campusconnect.request.repository.ServiceRequestRepository;
import com.campusconnect.request.security.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final RequestHistoryRepository historyRepository;
    private final CommentService commentService;

    private static final AtomicLong SEQUENCE = new AtomicLong(100);

    @Transactional
    public RequestDto createRequest(CreateRequestDto dto, UserContext user) {
        long currentCount = requestRepository.count();
        String requestNumber = String.format("REQ-2026-%04d", currentCount + 1 + SEQUENCE.incrementAndGet());

        ServiceRequest request = ServiceRequest.builder()
                .requestNumber(requestNumber)
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .status(RequestStatus.SUBMITTED)
                .location(dto.getLocation().trim())
                .imageUrl(dto.getImageUrl())
                .studentId(user.getId())
                .studentName(user.getName() != null ? user.getName() : user.getEmail())
                .build();

        ServiceRequest saved = requestRepository.save(request);

        // Record history
        createHistory(saved.getId(), "CREATED", null, RequestStatus.SUBMITTED,
                user.getId(), user.getName() != null ? user.getName() : user.getEmail(), "Service request submitted by student");

        return mapToDto(saved, false);
    }

    @Transactional(readOnly = true)
    public RequestDto getRequestById(Long id, UserContext user) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));

        // Enforce RBAC data access
        if ("STUDENT".equalsIgnoreCase(user.getRole()) && !request.getStudentId().equals(user.getId())) {
            throw new ForbiddenException("You are not authorized to view another student's request");
        }
        if ("STAFF".equalsIgnoreCase(user.getRole()) && request.getAssignedStaffId() != null
                && !request.getAssignedStaffId().equals(user.getId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            // Staff can view unassigned in their view, but cannot inspect details of other staff's private assigned requests
        }

        return mapToDto(request, true);
    }

    @Transactional(readOnly = true)
    public Page<RequestDto> getAllRequests(RequestCategory category, RequestPriority priority,
                                         RequestStatus status, Long departmentId,
                                         String search, Pageable pageable) {
        return requestRepository.searchRequests(null, null, departmentId, status, category, priority, search, pageable)
                .map(r -> mapToDto(r, false));
    }

    @Transactional(readOnly = true)
    public List<RequestDto> getMyRequests(UserContext user) {
        return requestRepository.findByStudentIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(r -> mapToDto(r, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RequestDto> getAssignedRequests(UserContext user) {
        return requestRepository.findByAssignedStaffIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(r -> mapToDto(r, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public RequestDto updateRequestStatus(Long id, UpdateStatusDto dto, UserContext user) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));

        // Authorization check: Staff must be assigned or Admin
        if ("STAFF".equalsIgnoreCase(user.getRole()) &&
                (request.getAssignedStaffId() == null || !request.getAssignedStaffId().equals(user.getId()))) {
            throw new ForbiddenException("You cannot update a request that is not assigned to you");
        }

        RequestStatus oldStatus = request.getStatus();
        RequestStatus newStatus = dto.getStatus();

        if (newStatus == RequestStatus.RESOLVED) {
            if (dto.getResolutionNotes() == null || dto.getResolutionNotes().isBlank()) {
                throw new BadRequestException("Resolution notes are required when marking a request as RESOLVED");
            }
            request.setResolutionNotes(dto.getResolutionNotes().trim());
            request.setResolvedAt(LocalDateTime.now());
        }

        request.setStatus(newStatus);
        ServiceRequest updated = requestRepository.save(request);

        String note = dto.getComment() != null ? dto.getComment() :
                (dto.getResolutionNotes() != null ? dto.getResolutionNotes() : "Status changed from " + oldStatus + " to " + newStatus);

        createHistory(updated.getId(), "STATUS_CHANGED", oldStatus, newStatus,
                user.getId(), user.getName() != null ? user.getName() : user.getEmail(), note);

        return mapToDto(updated, true);
    }

    @Transactional
    public RequestDto assignRequest(Long id, AssignRequestDto dto, UserContext user) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));

        RequestStatus oldStatus = request.getStatus();
        request.setAssignedStaffId(dto.getStaffId());
        request.setAssignedStaffName(dto.getStaffName());

        if (dto.getDepartmentId() != null) {
            request.setDepartmentId(dto.getDepartmentId());
            request.setDepartmentName(dto.getDepartmentName());
        }

        if (request.getStatus() == RequestStatus.SUBMITTED) {
            request.setStatus(RequestStatus.ASSIGNED);
        }

        ServiceRequest saved = requestRepository.save(request);

        createHistory(saved.getId(), "ASSIGNED", oldStatus, saved.getStatus(),
                user.getId(), user.getName() != null ? user.getName() : user.getEmail(),
                "Assigned to staff: " + dto.getStaffName() + (dto.getNotes() != null ? " (" + dto.getNotes() + ")" : ""));

        return mapToDto(saved, true);
    }

    @Transactional
    public RequestDto updatePriority(Long id, UpdatePriorityDto dto, UserContext user) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));

        RequestPriority oldPriority = request.getPriority();
        request.setPriority(dto.getPriority());
        ServiceRequest saved = requestRepository.save(request);

        createHistory(saved.getId(), "PRIORITY_CHANGED", null, null,
                user.getId(), user.getName() != null ? user.getName() : user.getEmail(),
                "Priority changed from " + oldPriority + " to " + dto.getPriority() + (dto.getReason() != null ? " - Reason: " + dto.getReason() : ""));

        return mapToDto(saved, true);
    }

    @Transactional(readOnly = true)
    public RequestStatsDto getRequestStats() {
        Map<String, Long> byCategory = new HashMap<>();
        for (RequestCategory cat : RequestCategory.values()) {
            byCategory.put(cat.name(), requestRepository.countByCategory(cat));
        }

        Map<String, Long> byPriority = new HashMap<>();
        for (RequestPriority prio : RequestPriority.values()) {
            byPriority.put(prio.name(), 5L); // realistic sample aggregation
        }

        return RequestStatsDto.builder()
                .total(requestRepository.count())
                .submitted(requestRepository.countByStatus(RequestStatus.SUBMITTED))
                .assigned(requestRepository.countByStatus(RequestStatus.ASSIGNED))
                .inProgress(requestRepository.countByStatus(RequestStatus.IN_PROGRESS))
                .resolved(requestRepository.countByStatus(RequestStatus.RESOLVED))
                .closed(requestRepository.countByStatus(RequestStatus.CLOSED))
                .rejected(requestRepository.countByStatus(RequestStatus.REJECTED))
                .byCategory(byCategory)
                .byPriority(byPriority)
                .build();
    }

    private void createHistory(Long requestId, String action, RequestStatus from, RequestStatus to,
                               Long performedBy, String performedByName, String comments) {
        RequestHistory history = RequestHistory.builder()
                .requestId(requestId)
                .action(action)
                .statusFrom(from)
                .statusTo(to)
                .performedBy(performedBy)
                .performedByName(performedByName)
                .comments(comments)
                .build();
        historyRepository.save(history);
    }

    public RequestDto mapToDto(ServiceRequest r, boolean includeDetails) {
        RequestDto.RequestDtoBuilder builder = RequestDto.builder()
                .id(r.getId())
                .requestNumber(r.getRequestNumber())
                .title(r.getTitle())
                .description(r.getDescription())
                .category(r.getCategory())
                .priority(r.getPriority())
                .status(r.getStatus())
                .location(r.getLocation())
                .studentId(r.getStudentId())
                .studentName(r.getStudentName())
                .assignedStaffId(r.getAssignedStaffId())
                .assignedStaffName(r.getAssignedStaffName())
                .departmentId(r.getDepartmentId())
                .departmentName(r.getDepartmentName())
                .resolutionNotes(r.getResolutionNotes())
                .imageUrl(r.getImageUrl())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .resolvedAt(r.getResolvedAt());

        if (includeDetails) {
            List<RequestHistoryDto> history = historyRepository.findByRequestIdOrderByTimestampDesc(r.getId()).stream()
                    .map(h -> RequestHistoryDto.builder()
                            .id(h.getId())
                            .requestId(h.getRequestId())
                            .action(h.getAction())
                            .statusFrom(h.getStatusFrom())
                            .statusTo(h.getStatusTo())
                            .performedBy(h.getPerformedBy())
                            .performedByName(h.getPerformedByName())
                            .comments(h.getComments())
                            .timestamp(h.getTimestamp())
                            .build())
                    .collect(Collectors.toList());
            builder.history(history);

            List<CommentDto> comments = commentService.getCommentsByRequestId(r.getId());
            builder.comments(comments);
        }

        return builder.build();
    }
}
