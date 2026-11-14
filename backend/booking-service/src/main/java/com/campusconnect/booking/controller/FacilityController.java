package com.campusconnect.booking.controller;

import com.campusconnect.booking.dto.AvailabilitySlotDto;
import com.campusconnect.booking.dto.FacilityDto;
import com.campusconnect.booking.service.FacilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@Tag(name = "Campus Facilities", description = "Endpoints for university seminar halls, laboratories, and sports grounds")
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping
    @Operation(summary = "Get list of all campus facilities (cached in Redis)")
    public ResponseEntity<List<FacilityDto>> getAllFacilities() {
        return ResponseEntity.ok(facilityService.getAllFacilities());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get facility by ID")
    public ResponseEntity<FacilityDto> getFacilityById(@PathVariable Long id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Check availability slots for a specific date")
    public ResponseEntity<List<AvailabilitySlotDto>> getAvailability(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate checkDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(facilityService.getFacilityAvailability(id, checkDate));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create campus facility (Admin only)")
    public ResponseEntity<FacilityDto> createFacility(@Valid @RequestBody FacilityDto dto) {
        return new ResponseEntity<>(facilityService.createFacility(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update facility details (Admin only)")
    public ResponseEntity<FacilityDto> updateFacility(@PathVariable Long id, @Valid @RequestBody FacilityDto dto) {
        return ResponseEntity.ok(facilityService.updateFacility(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete campus facility (Admin only)")
    public ResponseEntity<Map<String, String>> deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.ok(Map.of("message", "Facility deleted successfully"));
    }
}
