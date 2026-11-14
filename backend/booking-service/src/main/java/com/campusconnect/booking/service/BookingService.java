package com.campusconnect.booking.service;

import com.campusconnect.booking.dto.BookingDto;
import com.campusconnect.booking.dto.CreateBookingDto;
import com.campusconnect.booking.entity.Booking;
import com.campusconnect.booking.entity.BookingStatus;
import com.campusconnect.booking.entity.Facility;
import com.campusconnect.booking.entity.FacilityStatus;
import com.campusconnect.booking.exception.BadRequestException;
import com.campusconnect.booking.exception.ForbiddenException;
import com.campusconnect.booking.exception.OverlappingBookingException;
import com.campusconnect.booking.exception.ResourceNotFoundException;
import com.campusconnect.booking.repository.BookingRepository;
import com.campusconnect.booking.repository.FacilityRepository;
import com.campusconnect.booking.security.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingDto createBooking(CreateBookingDto dto, UserContext user) {
        // 1. Validate facility exists and is available
        Facility facility = facilityRepository.findById(dto.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + dto.getFacilityId()));

        if (facility.getStatus() != FacilityStatus.AVAILABLE) {
            throw new BadRequestException("This facility is currently not available for bookings (Status: " + facility.getStatus() + ")");
        }

        // 2. Validate timing logic
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        Duration duration = Duration.between(dto.getStartTime(), dto.getEndTime());
        if (duration.toMinutes() < 30) {
            throw new BadRequestException("Minimum booking duration is 30 minutes");
        }
        if (duration.toHours() > 8) {
            throw new BadRequestException("Maximum booking duration cannot exceed 8 hours per session");
        }

        // 3. Strict Database Overlap Prevention Check
        List<BookingStatus> activeStatuses = List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING_APPROVAL);
        long overlaps = bookingRepository.countOverlappingBookings(
                facility.getId(), dto.getStartTime(), dto.getEndTime(), activeStatuses);

        if (overlaps > 0) {
            log.warn("Overlapping booking attempt prevented for facility {} between {} and {}",
                    facility.getName(), dto.getStartTime(), dto.getEndTime());
            throw new OverlappingBookingException(
                    "The facility '" + facility.getName() + "' is already reserved during the requested time window (" +
                    dto.getStartTime() + " to " + dto.getEndTime() + "). Please choose an alternative slot.");
        }

        Booking booking = Booking.builder()
                .facilityId(facility.getId())
                .facilityName(facility.getName())
                .studentId(user.getId())
                .studentName(user.getName() != null ? user.getName() : user.getEmail())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose().trim())
                .status(BookingStatus.CONFIRMED)
                .build();

        return mapToDto(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getMyBookings(UserContext user) {
        return bookingRepository.findByStudentIdOrderByStartTimeDesc(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BookingDto> getAllBookings(Long facilityId, Long studentId, BookingStatus status, Pageable pageable) {
        return bookingRepository.searchBookings(facilityId, studentId, status, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingById(Long id, UserContext user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if ("STUDENT".equalsIgnoreCase(user.getRole()) && !booking.getStudentId().equals(user.getId())) {
            throw new ForbiddenException("You are not authorized to view another student's booking");
        }

        return mapToDto(booking);
    }

    @Transactional
    public BookingDto cancelBooking(Long id, UserContext user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!booking.getStudentId().equals(user.getId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ForbiddenException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return mapToDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDto approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.CONFIRMED);
        return mapToDto(bookingRepository.save(booking));
    }

    public BookingDto mapToDto(Booking b) {
        return BookingDto.builder()
                .id(b.getId())
                .facilityId(b.getFacilityId())
                .facilityName(b.getFacilityName())
                .studentId(b.getStudentId())
                .studentName(b.getStudentName())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
