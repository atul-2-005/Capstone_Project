package com.campusconnect.request.service;

import com.campusconnect.request.dto.CreateRequestDto;
import com.campusconnect.request.dto.RequestDto;
import com.campusconnect.request.dto.UpdateStatusDto;
import com.campusconnect.request.entity.RequestCategory;
import com.campusconnect.request.entity.RequestPriority;
import com.campusconnect.request.entity.RequestStatus;
import com.campusconnect.request.entity.ServiceRequest;
import com.campusconnect.request.exception.BadRequestException;
import com.campusconnect.request.repository.RequestHistoryRepository;
import com.campusconnect.request.repository.ServiceRequestRepository;
import com.campusconnect.request.security.UserContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceRequestServiceTest {

    @Mock
    private ServiceRequestRepository requestRepository;

    @Mock
    private RequestHistoryRepository historyRepository;

    @Mock
    private CommentService commentService;

    @InjectMocks
    private ServiceRequestService requestService;

    private UserContext studentUser;
    private UserContext staffUser;

    @BeforeEach
    void setUp() {
        studentUser = UserContext.builder()
                .id(10L)
                .email("student1@campusconnect.edu")
                .role("STUDENT")
                .name("Alex Student")
                .build();

        staffUser = UserContext.builder()
                .id(2L)
                .email("staff.it@campusconnect.edu")
                .role("STAFF")
                .name("Marcus Chen")
                .build();
    }

    @Test
    @DisplayName("Should create service request with generated request number and SUBMITTED status")
    void createRequest_Success() {
        CreateRequestDto dto = CreateRequestDto.builder()
                .title("Broken lab chair")
                .description("Chair broken in lab 4")
                .category(RequestCategory.CLASSROOM_MAINTENANCE)
                .priority(RequestPriority.MEDIUM)
                .location("Lab 4")
                .build();

        when(requestRepository.count()).thenReturn(5L);

        ServiceRequest saved = ServiceRequest.builder()
                .id(1L)
                .requestNumber("REQ-2026-0106")
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .status(RequestStatus.SUBMITTED)
                .location(dto.getLocation())
                .studentId(studentUser.getId())
                .studentName(studentUser.getName())
                .build();

        when(requestRepository.save(any(ServiceRequest.class))).thenReturn(saved);

        RequestDto result = requestService.createRequest(dto, studentUser);

        assertNotNull(result);
        assertEquals(RequestStatus.SUBMITTED, result.getStatus());
        assertEquals("Broken lab chair", result.getTitle());
        verify(historyRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should require resolution notes when resolving a request")
    void updateStatus_RequireResolutionNotes() {
        ServiceRequest existing = ServiceRequest.builder()
                .id(1L)
                .status(RequestStatus.IN_PROGRESS)
                .assignedStaffId(2L)
                .build();

        when(requestRepository.findById(1L)).thenReturn(Optional.of(existing));

        UpdateStatusDto dto = UpdateStatusDto.builder()
                .status(RequestStatus.RESOLVED)
                .resolutionNotes(null) // Missing notes!
                .build();

        assertThrows(BadRequestException.class, () -> requestService.updateRequestStatus(1L, dto, staffUser));
    }
}
