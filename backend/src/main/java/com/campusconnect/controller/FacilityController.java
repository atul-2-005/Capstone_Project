package com.campusconnect.controller;

import com.campusconnect.dto.FacilityRequest;
import com.campusconnect.entity.Booking;
import com.campusconnect.entity.Facility;
import com.campusconnect.service.BookingService;
import com.campusconnect.service.FacilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;
    private final BookingService bookingService;

    public FacilityController(FacilityService facilityService, BookingService bookingService) {
        this.facilityService = facilityService;
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<Facility>> getAllFacilities() {
        return ResponseEntity.ok(facilityService.getAllFacilities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFacilityById(@PathVariable Long id) {
        try {
            Facility facility = facilityService.getFacilityById(id);
            return ResponseEntity.ok(facility);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Facility> createFacility(@RequestBody FacilityRequest request) {
        Facility created = facilityService.createFacility(request);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFacility(@PathVariable Long id) {
        try {
            facilityService.deleteFacility(id);
            return ResponseEntity.ok(Map.of("message", "Facility deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<Booking>> getAvailability(@PathVariable Long id, @RequestParam(required = false) String date) {
        if (date == null) {
            date = java.time.LocalDate.now().toString();
        }
        return ResponseEntity.ok(bookingService.getFacilityAvailability(id, date));
    }
}
