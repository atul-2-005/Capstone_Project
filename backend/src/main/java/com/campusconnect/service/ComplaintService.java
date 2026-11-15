package com.campusconnect.service;

import com.campusconnect.dto.AssignRequest;
import com.campusconnect.dto.ComplaintRequest;
import com.campusconnect.dto.StatusUpdateRequest;
import com.campusconnect.entity.Complaint;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;

    public ComplaintService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public Complaint createComplaint(ComplaintRequest request, User student) {
        long count = complaintRepository.count() + 1;
        String requestNumber = String.format("REQ-2026-%04d", count);

        Complaint complaint = Complaint.builder()
                .requestNumber(requestNumber)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : "Other")
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .status("SUBMITTED")
                .location(request.getLocation())
                .studentId(student.getId())
                .studentName(student.getName())
                .build();

        return complaintRepository.save(complaint);
    }

    public List<Complaint> getMyComplaints(Long studentId) {
        return complaintRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with ID: " + id));
    }

    public Complaint updateStatus(Long id, StatusUpdateRequest request) {
        Complaint complaint = getComplaintById(id);
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            complaint.setStatus(request.getStatus().toUpperCase().trim());
        }
        if (request.getResolutionNotes() != null) {
            complaint.setResolutionNotes(request.getResolutionNotes());
        }
        return complaintRepository.save(complaint);
    }

    public Complaint assignStaff(Long id, AssignRequest request) {
        Complaint complaint = getComplaintById(id);
        String staff = request.getAssignedStaff();
        if (staff == null && request.getStaffName() != null) {
            staff = request.getStaffName();
        }
        if (staff != null && !staff.trim().isEmpty()) {
            complaint.setAssignedStaff(staff.trim());
            if ("SUBMITTED".equalsIgnoreCase(complaint.getStatus()) || "PENDING".equalsIgnoreCase(complaint.getStatus())) {
                complaint.setStatus("ASSIGNED");
            }
        }
        return complaintRepository.save(complaint);
    }

    public Complaint updatePriority(Long id, String priority) {
        Complaint complaint = getComplaintById(id);
        if (priority != null && !priority.trim().isEmpty()) {
            complaint.setPriority(priority.toUpperCase().trim());
        }
        return complaintRepository.save(complaint);
    }

    public Map<String, Object> getStats(User user) {
        Map<String, Object> stats = new HashMap<>();

        if (user.getRole() == Role.STUDENT) {
            long total = complaintRepository.countByStudentId(user.getId());
            long submitted = complaintRepository.countByStudentIdAndStatus(user.getId(), "SUBMITTED");
            long assigned = complaintRepository.countByStudentIdAndStatus(user.getId(), "ASSIGNED");
            long inProgress = complaintRepository.countByStudentIdAndStatus(user.getId(), "IN_PROGRESS");
            long resolved = complaintRepository.countByStudentIdAndStatus(user.getId(), "RESOLVED");

            stats.put("total", total);
            stats.put("pending", submitted + assigned);
            stats.put("inProgress", inProgress);
            stats.put("resolved", resolved);
        } else {
            long total = complaintRepository.count();
            long submitted = complaintRepository.countByStatus("SUBMITTED");
            long assigned = complaintRepository.countByStatus("ASSIGNED");
            long inProgress = complaintRepository.countByStatus("IN_PROGRESS");
            long resolved = complaintRepository.countByStatus("RESOLVED");

            stats.put("total", total);
            stats.put("pending", submitted + assigned);
            stats.put("inProgress", inProgress);
            stats.put("resolved", resolved);
        }

        return stats;
    }
}
