package com.campusconnect.booking.service;

import com.campusconnect.booking.dto.BookingDto;
import com.campusconnect.booking.dto.CreateBookingDto;
import com.campusconnect.booking.entity.Booking;
import com.campusconnect.booking.entity.BookingStatus;
import com.campusconnect.booking.entity.Facility;
import com.campusconnect.booking.entity.FacilityStatus;
import com.campusconnect.booking.exception.OverlappingBookingException;
import com.campusconnect.booking.repository.BookingRepository;
import com.campusconnect.booking.repository.FacilityRepository;
import com.campusconnect.booking.security.UserContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @InjectMocks
    private BookingService bookingService;

    private UserContext studentUser;
    private Facility facility;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        studentUser = UserContext.builder()
                .id(10L)
                .email("student1@campusconnect.edu")
                .role("STUDENT")
                .name("Alex Student")
                .build();

        facility = Facility.builder()
                .id(1L)
                .name("Executive Seminar Hall")
                .capacity(120)
                .status(FacilityStatus.AVAILABLE)
                .build();

        now = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
    }

    @Test
    @DisplayName("Should successfully book facility when slot is free")
    void createBooking_Success() {
        CreateBookingDto dto = CreateBookingDto.builder()
                .facilityId(1L)
                .startTime(now)
                .endTime(now.plusHours(2))
                .purpose("AI Symposium")
                .build();

        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility));
        when(bookingRepository.countOverlappingBookings(eq(1L), any(), any(), any())).thenReturn(0L);

        Booking saved = Booking.builder()
                .id(100L)
                .facilityId(1L)
                .facilityName("Executive Seminar Hall")
                .studentId(studentUser.getId())
                .studentName(studentUser.getName())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .status(BookingStatus.CONFIRMED)
                .build();

        when(bookingRepository.save(any(Booking.class))).thenReturn(saved);

        BookingDto result = bookingService.createBooking(dto, studentUser);

        assertNotNull(result);
        assertEquals(BookingStatus.CONFIRMED, result.getStatus());
        assertEquals("Executive Seminar Hall", result.getFacilityName());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should throw OverlappingBookingException when requested time overlaps with existing booking")
    void createBooking_OverlapThrowsException() {
        CreateBookingDto dto = CreateBookingDto.builder()
                .facilityId(1L)
                .startTime(now)
                .endTime(now.plusHours(2))
                .purpose("Conflict test")
                .build();

        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility));
        // Simulate existing booking detected by database overlap count query
        when(bookingRepository.countOverlappingBookings(eq(1L), any(), any(), any())).thenReturn(1L);

        assertThrows(OverlappingBookingException.class, () -> bookingService.createBooking(dto, studentUser));
        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
