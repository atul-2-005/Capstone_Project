package com.campusconnect.booking.controller;

import com.campusconnect.booking.dto.BookingDto;
import com.campusconnect.booking.dto.CreateBookingDto;
import com.campusconnect.booking.entity.BookingStatus;
import com.campusconnect.booking.security.UserContext;
import com.campusconnect.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Facility Bookings", description = "Endpoints for reserving campus facilities with atomic overlap prevention")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    @Operation(summary = "Book a facility (validates anti-overlap atomically)")
    public ResponseEntity<BookingDto> createBooking(
            @Valid @RequestBody CreateBookingDto dto,
            @AuthenticationPrincipal UserContext user) {
        return new ResponseEntity<>(bookingService.createBooking(dto, user), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @Operation(summary = "Get bookings created by current student")
    public ResponseEntity<List<BookingDto>> getMyBookings(@AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(bookingService.getMyBookings(user));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all facility bookings (Admin only)")
    public ResponseEntity<Page<BookingDto>> getAllBookings(
            @RequestParam(required = false) Long facilityId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

        return ResponseEntity.ok(bookingService.getAllBookings(facilityId, studentId, status, pageRequest));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<BookingDto> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(bookingService.getBookingById(id, user));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an existing booking (Student owner or Admin)")
    public ResponseEntity<BookingDto> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, user));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve pending booking (Admin only)")
    public ResponseEntity<BookingDto> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }
}
