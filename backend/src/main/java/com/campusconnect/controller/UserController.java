package com.campusconnect.controller;

import com.campusconnect.entity.User;
import com.campusconnect.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "department", user.getDepartment() != null ? user.getDepartment() : "General",
                "phone", user.getPhone() != null ? user.getPhone() : ""
        ));
    }

    @GetMapping("/staff")
    public ResponseEntity<List<User>> getStaffMembers() {
        return ResponseEntity.ok(authService.getStaffMembers());
    }
}
