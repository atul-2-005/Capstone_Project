package com.campusconnect.service;

import com.campusconnect.dto.BookingRequest;
import com.campusconnect.entity.Booking;
import com.campusconnect.entity.Facility;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.repository.BookingRepository;
import com.campusconnect.repository.FacilityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;

    public BookingService(BookingRepository bookingRepository, FacilityRepository facilityRepository) {
        this.bookingRepository = bookingRepository;
        this.facilityRepository = facilityRepository;
    }

    public Booking createBooking(BookingRequest request, User student) {
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with ID: " + request.getFacilityId()));

        // Conflict check: see if an active booking already exists for the same date and overlapping time
        List<Booking> existingBookings = bookingRepository.findByFacilityIdAndBookingDate(
                request.getFacilityId(),
                request.getBookingDate()
        );

        for (Booking existing : existingBookings) {
            if (!"CANCELLED".equalsIgnoreCase(existing.getStatus())) {
                // If the same time slot is already taken
                if (existing.getStartTime().equalsIgnoreCase(request.getStartTime())) {
                    throw new IllegalArgumentException("This facility is already booked on " +
                            request.getBookingDate() + " at " + request.getStartTime());
                }
            }
        }

        Booking booking = Booking.builder()
                .facilityId(facility.getId())
                .facilityName(facility.getName())
                .studentId(student.getId())
                .studentName(student.getName())
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose() != null ? request.getPurpose() : "Academic Activities")
                .status("CONFIRMED")
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(Long studentId) {
        return bookingRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public Booking cancelBooking(Long id, User user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + id));

        // Ensure student owns it or user is Admin
        if (user.getRole() != Role.ADMIN && !booking.getStudentId().equals(user.getId())) {
            throw new IllegalArgumentException("You are not authorized to cancel this booking");
        }

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    public Booking approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + id));

        booking.setStatus("CONFIRMED");
        return bookingRepository.save(booking);
    }

    public List<Booking> getFacilityAvailability(Long facilityId, String date) {
        return bookingRepository.findByFacilityIdAndBookingDate(facilityId, date);
    }
}
