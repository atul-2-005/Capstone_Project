package com.campusconnect.request.data;

import com.campusconnect.request.document.RequestComment;
import com.campusconnect.request.entity.*;
import com.campusconnect.request.repository.LostFoundRepository;
import com.campusconnect.request.repository.RequestCommentRepository;
import com.campusconnect.request.repository.RequestHistoryRepository;
import com.campusconnect.request.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RequestSeedData implements CommandLineRunner {

    private final ServiceRequestRepository requestRepository;
    private final RequestHistoryRepository historyRepository;
    private final LostFoundRepository lostFoundRepository;
    private final RequestCommentRepository commentRepository;

    @Override
    public void run(String... args) {
        seedServiceRequests();
        seedLostAndFound();
    }

    private void seedServiceRequests() {
        if (requestRepository.count() == 0) {
            log.info("Seeding realistic service requests...");

            ServiceRequest req1 = ServiceRequest.builder()
                    .requestNumber("REQ-2026-0001")
                    .title("High-Speed WiFi Access Point Down in Turing Lab 3")
                    .description("The Cisco AP on the northern ceiling of Computer Science Lab 3 is completely unresponsive. 35 students cannot connect to the university network during programming practicum.")
                    .category(RequestCategory.IT_SUPPORT)
                    .priority(RequestPriority.URGENT)
                    .status(RequestStatus.IN_PROGRESS)
                    .location("Alan Turing Engineering Block, Floor 2, Lab 3")
                    .studentId(5L)
                    .studentName("Alex Rivera")
                    .assignedStaffId(2L)
                    .assignedStaffName("Marcus Chen (IT Lead)")
                    .departmentId(1L)
                    .departmentName("Information Technology")
                    .build();
            ServiceRequest s1 = requestRepository.save(req1);

            historyRepository.save(RequestHistory.builder()
                    .requestId(s1.getId()).action("CREATED")
                    .statusFrom(null).statusTo(RequestStatus.SUBMITTED)
                    .performedBy(5L).performedByName("Alex Rivera")
                    .comments("Request submitted by student").build());
            historyRepository.save(RequestHistory.builder()
                    .requestId(s1.getId()).action("ASSIGNED")
                    .statusFrom(RequestStatus.SUBMITTED).statusTo(RequestStatus.ASSIGNED)
                    .performedBy(1L).performedByName("Dr. Eleanor Vance (System Admin)")
                    .comments("Assigned to Marcus Chen").build());
            historyRepository.save(RequestHistory.builder()
                    .requestId(s1.getId()).action("STATUS_CHANGED")
                    .statusFrom(RequestStatus.ASSIGNED).statusTo(RequestStatus.IN_PROGRESS)
                    .performedBy(2L).performedByName("Marcus Chen (IT Lead)")
                    .comments("Investigating PoE switch connection in rack B").build());

            ServiceRequest req2 = ServiceRequest.builder()
                    .requestNumber("REQ-2026-0002")
                    .title("Ceiling Air Conditioner Water Leakage")
                    .description("Water is steadily dripping from the central AC unit directly over desk row 4 in Lecture Hall B. Poses slipping hazard and risk to electrical wiring.")
                    .category(RequestCategory.CLASSROOM_MAINTENANCE)
                    .priority(RequestPriority.HIGH)
                    .status(RequestStatus.RESOLVED)
                    .location("Main Academic Complex, Lecture Hall B")
                    .studentId(6L)
                    .studentName("Sophia Martinez")
                    .assignedStaffId(3L)
                    .assignedStaffName("Robert Miller (Facilities Supervisor)")
                    .departmentId(2L)
                    .departmentName("Campus Maintenance")
                    .resolutionNotes("Drainage tray pipe cleaned, blockage cleared and tested for 30 minutes without further leaks.")
                    .resolvedAt(LocalDateTime.now().minusHours(4))
                    .build();
            ServiceRequest s2 = requestRepository.save(req2);

            historyRepository.save(RequestHistory.builder()
                    .requestId(s2.getId()).action("CREATED")
                    .statusFrom(null).statusTo(RequestStatus.SUBMITTED)
                    .performedBy(6L).performedByName("Sophia Martinez")
                    .comments("Submitted").build());
            historyRepository.save(RequestHistory.builder()
                    .requestId(s2.getId()).action("STATUS_CHANGED")
                    .statusFrom(RequestStatus.IN_PROGRESS).statusTo(RequestStatus.RESOLVED)
                    .performedBy(3L).performedByName("Robert Miller")
                    .comments("Drainage pipe unblocked and verified.").build());

            ServiceRequest req3 = ServiceRequest.builder()
                    .requestNumber("REQ-2026-0003")
                    .title("Flickering Fluorescent Lighting in Library Quiet Zone")
                    .description("Two overhead tubes in the second-floor study carrels are flickering continuously and emitting a loud buzzing sound, disrupting exam study.")
                    .category(RequestCategory.ELECTRICAL_ISSUES)
                    .priority(RequestPriority.MEDIUM)
                    .status(RequestStatus.ASSIGNED)
                    .location("Central University Library, 2nd Floor, Zone C")
                    .studentId(7L)
                    .studentName("Liam Johnson")
                    .assignedStaffId(4L)
                    .assignedStaffName("Aisha Patel (Chief Electrician)")
                    .departmentId(3L)
                    .departmentName("Electrical & Utilities")
                    .build();
            requestRepository.save(req3);

            ServiceRequest req4 = ServiceRequest.builder()
                    .requestNumber("REQ-2026-0004")
                    .title("Broken Door Lock and Key Cylinder Malfunction")
                    .description("The deadbolt lock on Room 214 has seized. Key cannot turn. Room cannot be locked securely when occupants leave.")
                    .category(RequestCategory.HOSTEL_MAINTENANCE)
                    .priority(RequestPriority.HIGH)
                    .status(RequestStatus.SUBMITTED)
                    .location("Boys Hostel Block B, Room 214")
                    .studentId(5L)
                    .studentName("Alex Rivera")
                    .departmentId(4L)
                    .departmentName("Hostel Administration")
                    .build();
            requestRepository.save(req4);

            ServiceRequest req5 = ServiceRequest.builder()
                    .requestNumber("REQ-2026-0005")
                    .title("Low Water Pressure and Broken Faucet in 3rd Floor Washroom")
                    .description("The cold water faucet in washroom 3A is loose and sprays water sideways. Main supply pressure is too low.")
                    .category(RequestCategory.PLUMBING)
                    .priority(RequestPriority.MEDIUM)
                    .status(RequestStatus.ASSIGNED)
                    .location("Science & Humanities Wing, Level 3")
                    .studentId(8L)
                    .studentName("Emma Davis")
                    .assignedStaffId(3L)
                    .assignedStaffName("Robert Miller (Facilities Supervisor)")
                    .departmentId(2L)
                    .departmentName("Campus Maintenance")
                    .build();
            requestRepository.save(req5);

            ServiceRequest req6 = ServiceRequest.builder()
                    .requestNumber("REQ-2026-0006")
                    .title("Campus Shuttle Bus #4 Air Conditioning Not Functioning")
                    .description("The morning shuttle bus running Route 2 (Metro Station to Campus Gate 1) had no functional air conditioning during peak commute heat.")
                    .category(RequestCategory.TRANSPORT)
                    .priority(RequestPriority.LOW)
                    .status(RequestStatus.SUBMITTED)
                    .location("Campus Transport Depot, Gate 1")
                    .studentId(9L)
                    .studentName("Noah Wilson")
                    .build();
            requestRepository.save(req6);

            // Comments
            try {
                commentRepository.save(RequestComment.builder()
                        .requestId(s1.getId())
                        .authorId(5L)
                        .authorName("Alex Rivera")
                        .authorRole("STUDENT")
                        .comment("Marcus, thank you for looking into this! We have a coding quiz tomorrow at 9 AM.")
                        .build());
                commentRepository.save(RequestComment.builder()
                        .requestId(s1.getId())
                        .authorId(2L)
                        .authorName("Marcus Chen (IT Lead)")
                        .authorRole("STAFF")
                        .comment("On it, Alex. I have replaced the PoE injector and the AP is negotiating gigabit link now.")
                        .build());
            } catch (Exception ex) {
                log.warn("Mongo comment seed skipped: {}", ex.getMessage());
            }

            log.info("Service requests seeded successfully.");
        }
    }

    private void seedLostAndFound() {
        if (lostFoundRepository.count() == 0) {
            log.info("Seeding Lost & Found items...");

            lostFoundRepository.saveAll(List.of(
                    LostFoundItem.builder()
                            .title("Space Grey MacBook Air M2 (13-inch)")
                            .description("Found an Apple MacBook Air with a GitHub sticker and teal protective case on table 12 in the Central Library quiet study area.")
                            .category("Electronics")
                            .itemType(ItemType.FOUND)
                            .location("Central Library, Level 2")
                            .contactInfo("Library Help Desk (ext. 4410)")
                            .ownerId(2L)
                            .ownerName("Marcus Chen")
                            .status(LostFoundStatus.REPORTED)
                            .build(),

                    LostFoundItem.builder()
                            .title("Scientific Calculator Casio fx-991EX")
                            .description("Lost during Physics II midterm examination. Has my name 'Liam J.' engraved on the battery cover.")
                            .category("Academic Supplies")
                            .itemType(ItemType.LOST)
                            .location("Auditorium Hall 1")
                            .contactInfo("student3@campusconnect.edu")
                            .ownerId(7L)
                            .ownerName("Liam Johnson")
                            .status(LostFoundStatus.REPORTED)
                            .build(),

                    LostFoundItem.builder()
                            .title("Brown Leather Fossil Wallet")
                            .description("Contains university student ID card (ID: CC-2024-8842) and campus bus transit pass.")
                            .category("Personal Belongings")
                            .itemType(ItemType.FOUND)
                            .location("Campus Cafeteria near Juice Counter")
                            .contactInfo("Security Post 3")
                            .ownerId(3L)
                            .ownerName("Robert Miller")
                            .status(LostFoundStatus.CLAIMED)
                            .build(),

                    LostFoundItem.builder()
                            .title("Sony WH-1000XM4 Noise-Cancelling Headphones")
                            .description("Black over-ear headphones inside black zip case. Left on bench outside Student Activity Center.")
                            .category("Electronics")
                            .itemType(ItemType.LOST)
                            .location("Student Activity Center Plaza")
                            .contactInfo("student1@campusconnect.edu")
                            .ownerId(5L)
                            .ownerName("Alex Rivera")
                            .status(LostFoundStatus.REPORTED)
                            .build()
            ));

            log.info("Lost & Found items seeded successfully.");
        }
    }
}
