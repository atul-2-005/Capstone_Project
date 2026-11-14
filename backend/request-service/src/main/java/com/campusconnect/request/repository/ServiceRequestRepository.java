package com.campusconnect.request.repository;

import com.campusconnect.request.entity.RequestCategory;
import com.campusconnect.request.entity.RequestPriority;
import com.campusconnect.request.entity.RequestStatus;
import com.campusconnect.request.entity.ServiceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    Optional<ServiceRequest> findByRequestNumber(String requestNumber);

    List<ServiceRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<ServiceRequest> findByAssignedStaffIdOrderByCreatedAtDesc(Long assignedStaffId);

    long countByStatus(RequestStatus status);
    long countByCategory(RequestCategory category);
    long countByStudentId(Long studentId);
    long countByAssignedStaffId(Long assignedStaffId);

    @Query("SELECT r FROM ServiceRequest r WHERE " +
           "(:studentId IS NULL OR r.studentId = :studentId) AND " +
           "(:staffId IS NULL OR r.assignedStaffId = :staffId) AND " +
           "(:deptId IS NULL OR r.departmentId = :deptId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:priority IS NULL OR r.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.requestNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ServiceRequest> searchRequests(@Param("studentId") Long studentId,
                                        @Param("staffId") Long staffId,
                                        @Param("deptId") Long deptId,
                                        @Param("status") RequestStatus status,
                                        @Param("category") RequestCategory category,
                                        @Param("priority") RequestPriority priority,
                                        @Param("search") String search,
                                        Pageable pageable);

    @Query("SELECT MAX(r.id) FROM ServiceRequest r")
    Long findMaxId();
}
