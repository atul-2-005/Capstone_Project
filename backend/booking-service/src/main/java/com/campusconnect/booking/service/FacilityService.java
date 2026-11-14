package com.campusconnect.booking.service;

import com.campusconnect.booking.dto.AvailabilitySlotDto;
import com.campusconnect.booking.dto.FacilityDto;
import com.campusconnect.booking.entity.Booking;
import com.campusconnect.booking.entity.BookingStatus;
import com.campusconnect.booking.entity.Facility;
import com.campusconnect.booking.entity.FacilityStatus;
import com.campusconnect.booking.exception.BadRequestException;
import com.campusconnect.booking.exception.ResourceNotFoundException;
import com.campusconnect.booking.repository.BookingRepository;
import com.campusconnect.booking.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final BookingRepository bookingRepository;

    @Cacheable(value = "facilities")
    @Transactional(readOnly = true)
    public List<FacilityDto> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FacilityDto getFacilityById(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));
        return mapToDto(facility);
    }

    @CacheEvict(value = "facilities", allEntries = true)
    @Transactional
    public FacilityDto createFacility(FacilityDto dto) {
        if (facilityRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new BadRequestException("Facility with name '" + dto.getName() + "' already exists");
        }

        Facility facility = Facility.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription().trim())
                .location(dto.getLocation().trim())
                .capacity(dto.getCapacity())
                .status(dto.getStatus() != null ? dto.getStatus() : FacilityStatus.AVAILABLE)
                .bookingRules(dto.getBookingRules())
                .imageUrl(dto.getImageUrl())
                .build();

        return mapToDto(facilityRepository.save(facility));
    }

    @CacheEvict(value = "facilities", allEntries = true)
    @Transactional
    public FacilityDto updateFacility(Long id, FacilityDto dto) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));

        if (!facility.getName().equalsIgnoreCase(dto.getName().trim()) &&
                facilityRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new BadRequestException("Facility with name '" + dto.getName() + "' already exists");
        }

        facility.setName(dto.getName().trim());
        facility.setDescription(dto.getDescription().trim());
        facility.setLocation(dto.getLocation().trim());
        facility.setCapacity(dto.getCapacity());
        if (dto.getStatus() != null) facility.setStatus(dto.getStatus());
        if (dto.getBookingRules() != null) facility.setBookingRules(dto.getBookingRules());
        if (dto.getImageUrl() != null) facility.setImageUrl(dto.getImageUrl());

        return mapToDto(facilityRepository.save(facility));
    }

    @CacheEvict(value = "facilities", allEntries = true)
    @Transactional
    public void deleteFacility(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Facility not found with id: " + id);
        }
        facilityRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AvailabilitySlotDto> getFacilityAvailability(Long facilityId, LocalDate date) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));

        LocalDateTime startOfDay = date.atTime(LocalTime.MIN);
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Booking> existingBookings = bookingRepository.findByFacilityIdAndStartTimeBetweenAndStatusIn(
                facility.getId(), startOfDay, endOfDay,
                List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING_APPROVAL));

        // Generate hourly slots from 08:00 to 20:00
        List<AvailabilitySlotDto> slots = new ArrayList<>();
        for (int hour = 8; hour < 20; hour++) {
            LocalDateTime slotStart = date.atTime(hour, 0);
            LocalDateTime slotEnd = date.atTime(hour + 1, 0);

            // Check if slot falls in any existing booking
            Booking overlapping = existingBookings.stream()
                    .filter(b -> b.getStartTime().isBefore(slotEnd) && b.getEndTime().isAfter(slotStart))
                    .findFirst()
                    .orElse(null);

            slots.add(AvailabilitySlotDto.builder()
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .available(overlapping == null && facility.getStatus() == FacilityStatus.AVAILABLE)
                    .bookedBy(overlapping != null ? overlapping.getStudentName() : null)
                    .purpose(overlapping != null ? overlapping.getPurpose() : null)
                    .build());
        }

        return slots;
    }

    public FacilityDto mapToDto(Facility f) {
        return FacilityDto.builder()
                .id(f.getId())
                .name(f.getName())
                .description(f.getDescription())
                .location(f.getLocation())
                .capacity(f.getCapacity())
                .status(f.getStatus())
                .bookingRules(f.getBookingRules())
                .imageUrl(f.getImageUrl())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
