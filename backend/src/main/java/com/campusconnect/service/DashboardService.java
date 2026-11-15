package com.campusconnect.service;

import com.campusconnect.dto.DashboardStatsDto;
import com.campusconnect.entity.Role;
import com.campusconnect.repository.BookingRepository;
import com.campusconnect.repository.ComplaintRepository;
import com.campusconnect.repository.FacilityRepository;
import com.campusconnect.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final ComplaintRepository complaintRepository;
    private final FacilityRepository facilityRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public DashboardService(ComplaintRepository complaintRepository,
                            FacilityRepository facilityRepository,
                            BookingRepository bookingRepository,
                            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.facilityRepository = facilityRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public DashboardStatsDto getAdminStats() {
        long totalComplaints = complaintRepository.count();
        long submitted = complaintRepository.countByStatus("SUBMITTED");
        long assigned = complaintRepository.countByStatus("ASSIGNED");
        long inProgress = complaintRepository.countByStatus("IN_PROGRESS");
        long resolved = complaintRepository.countByStatus("RESOLVED");

        long totalFacilities = facilityRepository.count();
        long totalBookings = bookingRepository.count();
        long totalStudents = userRepository.countByRole(Role.STUDENT);

        List<Map<String, Object>> categoryStats = complaintRepository.countByCategory();
        List<Map<String, Object>> statusStats = complaintRepository.countByStatusGroup();

        return DashboardStatsDto.builder()
                .totalRequests(totalComplaints)
                .pendingRequests(submitted + assigned)
                .inProgressRequests(inProgress)
                .resolvedRequests(resolved)
                .totalFacilities(totalFacilities)
                .activeBookings(totalBookings)
                .totalStudents(totalStudents)
                .categoryStats(categoryStats)
                .statusStats(statusStats)
                .build();
    }
}
