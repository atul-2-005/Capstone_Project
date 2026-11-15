package com.campusconnect.repository;

import com.campusconnect.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByFacilityIdAndBookingDate(Long facilityId, String bookingDate);

    long countByStudentId(Long studentId);
}
