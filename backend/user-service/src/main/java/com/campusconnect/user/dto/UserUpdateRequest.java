package com.campusconnect.user.dto;

import com.campusconnect.user.entity.AccountStatus;
import com.campusconnect.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    private String name;
    private String phone;
    private Long departmentId;
    private Role role;
    private AccountStatus accountStatus;
}
