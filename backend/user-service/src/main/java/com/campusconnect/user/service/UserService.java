package com.campusconnect.user.service;

import com.campusconnect.user.dto.UserDto;
import com.campusconnect.user.dto.UserUpdateRequest;
import com.campusconnect.user.entity.AccountStatus;
import com.campusconnect.user.entity.Department;
import com.campusconnect.user.entity.Role;
import com.campusconnect.user.entity.User;
import com.campusconnect.user.exception.ResourceNotFoundException;
import com.campusconnect.user.repository.DepartmentRepository;
import com.campusconnect.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToDto(user);
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getUsers(Role role, AccountStatus status, Long departmentId, String search, Pageable pageable) {
        Page<User> users = userRepository.searchUsers(role, status, departmentId, search, pageable);
        Map<Long, String> deptMap = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getId, Department::getName, (a, b) -> a));

        return users.map(user -> mapToDtoWithDeptMap(user, deptMap));
    }

    @Transactional(readOnly = true)
    public List<UserDto> getStaffMembers(Long departmentId) {
        List<User> staff = (departmentId != null)
                ? userRepository.findByRoleAndDepartmentId(Role.STAFF, departmentId)
                : userRepository.findByRole(Role.STAFF);

        Map<Long, String> deptMap = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getId, Department::getName, (a, b) -> a));

        return staff.stream()
                .map(user -> mapToDtoWithDeptMap(user, deptMap))
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getDepartmentId() != null) {
            user.setDepartmentId(request.getDepartmentId());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getAccountStatus() != null) {
            user.setAccountStatus(request.getAccountStatus());
        }

        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setAccountStatus(AccountStatus.INACTIVE);
        userRepository.save(user);
    }

    public UserDto mapToDto(User user) {
        String deptName = null;
        if (user.getDepartmentId() != null) {
            deptName = departmentRepository.findById(user.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .departmentId(user.getDepartmentId())
                .departmentName(deptName)
                .phone(user.getPhone())
                .accountStatus(user.getAccountStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private UserDto mapToDtoWithDeptMap(User user, Map<Long, String> deptMap) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .departmentId(user.getDepartmentId())
                .departmentName(user.getDepartmentId() != null ? deptMap.get(user.getDepartmentId()) : null)
                .phone(user.getPhone())
                .accountStatus(user.getAccountStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
