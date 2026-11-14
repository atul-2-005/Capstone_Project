package com.campusconnect.booking.data;

import com.campusconnect.booking.entity.Booking;
import com.campusconnect.booking.entity.BookingStatus;
import com.campusconnect.booking.entity.Facility;
import com.campusconnect.booking.entity.FacilityStatus;
import com.campusconnect.booking.repository.BookingRepository;
import com.campusconnect.booking.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingSeedData implements CommandLineRunner {

    private final FacilityRepository facilityRepository;
    private final BookingRepository bookingRepository;

    @Override
    public void run(String... args) {
        seedFacilities();
        seedBookings();
    }

    private void seedFacilities() {
        if (facilityRepository.count() == 0) {
            log.info("Seeding campus facilities...");

            facilityRepository.saveAll(List.of(
                    Facility.builder()
                            .name("Main University Auditorium")
                            .description("Premier 800-seat amphitheater with state-of-the-art acoustic tuning, 4K digital projection, and motorized stage lighting.")
                            .location("Cultural & Events Center, North Campus")
                            .capacity(800)
                            .status(FacilityStatus.AVAILABLE)
                            .bookingRules("Requires faculty advisor sign-off. Event proposal must be attached. Minimum booking duration: 2 hours.")
                            .build(),

                    Facility.builder()
                            .name("Advanced Computing & AI Research Lab")
                            .description("Equipped with 45 dual-GPU NVIDIA workstations, high-speed fiber uplink, and dual interactive smart boards.")
                            .location("Alan Turing Engineering Block, Room 301")
                            .capacity(45)
                            .status(FacilityStatus.AVAILABLE)
                            .bookingRules("For academic project teams, hackathons, and research workshops. No food or beverage permitted.")
                            .build(),

                    Facility.builder()
                            .name("Executive Seminar Hall")
                            .description("Acoustically isolated 120-seat tiered lecture hall designed for guest symposia, thesis defenses, and department meetings.")
                            .location("Management & Humanities Complex, 1st Floor")
                            .capacity(120)
                            .status(FacilityStatus.AVAILABLE)
                            .bookingRules("Bookings must be requested at least 24 hours in advance.")
                            .build(),

                    Facility.builder()
                            .name("Indoor Sports Complex & Badminton Arena")
                            .description("4 international-standard synthetic badminton courts, spectator galleries, and locker room access.")
                            .location("University Sports Pavilion")
                            .capacity(60)
                            .status(FacilityStatus.AVAILABLE)
                            .bookingRules("Non-marking athletic footwear strictly mandatory. Maximum 2 hours per student group per day.")
                            .build(),

                    Facility.builder()
                            .name("Collaborative Study Pod Alpha")
                            .description("Soundproof glass study room with 65-inch digital display for group presentations, whiteboard wall, and 12 ergonomic chairs.")
                            .location("Central Library, 3rd Floor East Wing")
                            .capacity(12)
                            .status(FacilityStatus.AVAILABLE)
                            .bookingRules("Maximum 3 consecutive hours. Please leave whiteboard cleaned.")
                            .build()
            ));

            log.info("Facilities seeded successfully.");
        }
    }

    private void seedBookings() {
        if (bookingRepository.count() == 0) {
            log.info("Seeding initial facility bookings...");

            Facility lab = facilityRepository.findByNameIgnoreCase("Advanced Computing & AI Research Lab").orElse(null);
            Facility pod = facilityRepository.findByNameIgnoreCase("Collaborative Study Pod Alpha").orElse(null);
            Facility hall = facilityRepository.findByNameIgnoreCase("Executive Seminar Hall").orElse(null);

            LocalDate today = LocalDate.now();

            if (lab != null) {
                bookingRepository.save(Booking.builder()
                        .facilityId(lab.getId())
                        .facilityName(lab.getName())
                        .studentId(5L)
                        .studentName("Alex Rivera")
                        .startTime(today.plusDays(1).atTime(14, 0))
                        .endTime(today.plusDays(1).atTime(17, 0))
                        .purpose("Annual University Hackathon Preparation & Model Fine-Tuning")
                        .status(BookingStatus.CONFIRMED)
                        .build());
            }

            if (pod != null) {
                bookingRepository.save(Booking.builder()
                        .facilityId(pod.getId())
                        .facilityName(pod.getName())
                        .studentId(6L)
                        .studentName("Sophia Martinez")
                        .startTime(today.plusDays(2).atTime(10, 0))
                        .endTime(today.plusDays(2).atTime(12, 0))
                        .purpose("FSD-II Capstone Group Project Presentation Dry-Run")
                        .status(BookingStatus.CONFIRMED)
                        .build());
            }

            if (hall != null) {
                bookingRepository.save(Booking.builder()
                        .facilityId(hall.getId())
                        .facilityName(hall.getName())
                        .studentId(7L)
                        .studentName("Liam Johnson")
                        .startTime(today.plusDays(3).atTime(15, 0))
                        .endTime(today.plusDays(3).atTime(18, 0))
                        .purpose("Campus Developer Student Club (GDSC) Workshop on Cloud Native Architecture")
                        .status(BookingStatus.CONFIRMED)
                        .build());
            }

            log.info("Bookings seeded successfully.");
        }
    }
}
