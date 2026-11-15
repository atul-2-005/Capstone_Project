package com.campusconnect.service;

import com.campusconnect.dto.FacilityRequest;
import com.campusconnect.entity.Facility;
import com.campusconnect.repository.FacilityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    public Facility getFacilityById(Long id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with ID: " + id));
    }

    public Facility createFacility(FacilityRequest request) {
        Facility facility = Facility.builder()
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 50)
                .status(request.getStatus() != null ? request.getStatus() : "AVAILABLE")
                .imageUrl(request.getImageUrl())
                .build();

        return facilityRepository.save(facility);
    }

    public void deleteFacility(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new IllegalArgumentException("Facility not found with ID: " + id);
        }
        facilityRepository.deleteById(id);
    }
}
