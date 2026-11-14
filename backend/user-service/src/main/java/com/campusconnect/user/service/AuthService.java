package com.campusconnect.user.service;

import com.campusconnect.user.dto.AuthResponse;
import com.campusconnect.user.dto.LoginRequest;
import com.campusconnect.user.dto.RegisterRequest;
import com.campusconnect.user.entity.AccountStatus;
import com.campusconnect.user.entity.Department;
import com.campusconnect.user.entity.Role;
import com.campusconnect.user.entity.User;
import com.campusconnect.user.exception.BadRequestException;
import com.campusconnect.user.repository.DepartmentRepository;
import com.campusconnect.user.repository.UserRepository;
import com.campusconnect.user.security.JwtTokenProvider;
import com.campusconnect.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("An account with email '" + request.getEmail() + "' already exists");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;

        if (request.getDepartmentId() != null && !departmentRepository.existsById(request.getDepartmentId())) {
            throw new BadRequestException("Department does not exist with id: " + request.getDepartmentId());
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .departmentId(request.getDepartmentId())
                .phone(request.getPhone())
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateToken(principal);

        String deptName = null;
        if (savedUser.getDepartmentId() != null) {
            deptName = departmentRepository.findById(savedUser.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .departmentId(savedUser.getDepartmentId())
                .departmentName(deptName)
                .phone(savedUser.getPhone())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        String deptName = null;
        if (principal.getDepartmentId() != null) {
            deptName = departmentRepository.findById(principal.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }

        return AuthResponse.builder()
                .token(token)
                .id(principal.getId())
                .name(principal.getName())
                .email(principal.getEmail())
                .role(principal.getRole())
                .departmentId(principal.getDepartmentId())
                .departmentName(deptName)
                .build();
    }
}
