package com.campusconnect.repository;

import com.campusconnect.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    List<Complaint> findByStatusOrderByCreatedAtDesc(String status);

    long countByStatus(String status);

    long countByStudentId(Long studentId);

    long countByStudentIdAndStatus(Long studentId, String status);

    @Query("SELECT c.category AS category, COUNT(c) AS count FROM Complaint c GROUP BY c.category")
    List<Map<String, Object>> countByCategory();

    @Query("SELECT c.status AS status, COUNT(c) AS count FROM Complaint c GROUP BY c.status")
    List<Map<String, Object>> countByStatusGroup();
}
