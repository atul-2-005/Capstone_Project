package com.campusconnect.booking.repository;

import com.campusconnect.booking.entity.Facility;
import com.campusconnect.booking.entity.FacilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    Optional<Facility> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Facility> findByStatus(FacilityStatus status);
}
