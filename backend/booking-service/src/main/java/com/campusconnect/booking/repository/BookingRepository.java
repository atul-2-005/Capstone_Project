package com.campusconnect.booking.repository;

import com.campusconnect.booking.entity.Booking;
import com.campusconnect.booking.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByStudentIdOrderByStartTimeDesc(Long studentId);

    List<Booking> findByFacilityIdAndStartTimeBetweenAndStatusIn(
            Long facilityId, LocalDateTime start, LocalDateTime end, List<BookingStatus> statuses);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.facilityId = :facilityId " +
           "AND b.status IN :activeStatuses " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    long countOverlappingBookings(@Param("facilityId") Long facilityId,
                                 @Param("startTime") LocalDateTime startTime,
                                 @Param("endTime") LocalDateTime endTime,
                                 @Param("activeStatuses") List<BookingStatus> activeStatuses);

    @Query("SELECT b FROM Booking b WHERE " +
           "(:facilityId IS NULL OR b.facilityId = :facilityId) AND " +
           "(:studentId IS NULL OR b.studentId = :studentId) AND " +
           "(:status IS NULL OR b.status = :status)")
    Page<Booking> searchBookings(@Param("facilityId") Long facilityId,
                                @Param("studentId") Long studentId,
                                @Param("status") BookingStatus status,
                                Pageable pageable);
}
