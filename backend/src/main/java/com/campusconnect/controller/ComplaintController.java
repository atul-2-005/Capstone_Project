package com.campusconnect.controller;

import com.campusconnect.dto.AssignRequest;
import com.campusconnect.dto.ComplaintRequest;
import com.campusconnect.dto.StatusUpdateRequest;
import com.campusconnect.entity.Complaint;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.service.AuthService;
import com.campusconnect.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/requests")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AuthService authService;
    private final Map<Long, List<Map<String, Object>>> complaintComments = new ConcurrentHashMap<>();

    public ComplaintController(ComplaintService complaintService, AuthService authService) {
        this.complaintService = complaintService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody ComplaintRequest request, Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        Complaint created = complaintService.createComplaint(request, user);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints(Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        if (user.getRole() == Role.STUDENT) {
            return ResponseEntity.ok(complaintService.getMyComplaints(user.getId()));
        }
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Complaint>> getMyComplaints(Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(complaintService.getMyComplaints(user.getId()));
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<Complaint>> getAssignedComplaints(Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
        try {
            Complaint complaint = complaintService.getComplaintById(id);
            return ResponseEntity.ok(complaint);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        try {
            Complaint updated = complaintService.updateStatus(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assignStaff(@PathVariable Long id, @RequestBody AssignRequest request) {
        try {
            Complaint updated = complaintService.assignStaff(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<?> updatePriority(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String priority = body.get("priority");
            Complaint updated = complaintService.updatePriority(id, priority);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(complaintService.getStats(user));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable Long id) {
        List<Map<String, Object>> comments = complaintComments.getOrDefault(id, new ArrayList<>());
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        String text = body.get("comment");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comment cannot be empty"));
        }

        Map<String, Object> comment = new HashMap<>();
        comment.put("id", UUID.randomUUID().toString());
        comment.put("authorName", user.getName());
        comment.put("authorRole", user.getRole().name());
        comment.put("comment", text.trim());
        comment.put("createdAt", LocalDateTime.now().toString());

        complaintComments.computeIfAbsent(id, k -> new ArrayList<>()).add(comment);
        return ResponseEntity.ok(comment);
    }
}
