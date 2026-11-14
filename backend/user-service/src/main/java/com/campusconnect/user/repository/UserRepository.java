package com.campusconnect.user.repository;

import com.campusconnect.user.entity.AccountStatus;
import com.campusconnect.user.entity.Role;
import com.campusconnect.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(Role role);
    List<User> findByRoleAndDepartmentId(Role role, Long departmentId);

    long countByRole(Role role);
    long countByAccountStatus(AccountStatus status);

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:status IS NULL OR u.accountStatus = :status) AND " +
           "(:deptId IS NULL OR u.departmentId = :deptId) AND " +
           "(:query IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<User> searchUsers(@Param("role") Role role,
                           @Param("status") AccountStatus status,
                           @Param("deptId") Long deptId,
                           @Param("query") String query,
                           Pageable pageable);
}
