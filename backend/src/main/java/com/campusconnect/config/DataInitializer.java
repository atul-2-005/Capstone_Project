package com.campusconnect.config;

import com.campusconnect.entity.*;
import com.campusconnect.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final ComplaintRepository complaintRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           FacilityRepository facilityRepository,
                           ComplaintRepository complaintRepository,
                           BookingRepository bookingRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.facilityRepository = facilityRepository;
        this.complaintRepository = complaintRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println(">> Database already contains seed data. Skipping initialization.");
            return;
        }

        System.out.println(">> Initializing CampusConnect default data in MySQL...");

        // 1. Create Default Admin
        User admin = userRepository.save(User.builder()
                .name("Campus Administrator")
                .email("admin@campusconnect.edu")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .department("Administration")
                .phone("+1 555-0100")
                .active(true)
                .build());

        // 2. Create Default Students
        User student1 = userRepository.save(User.builder()
                .name("Alex Student")
                .email("student1@campusconnect.edu")
                .password(passwordEncoder.encode("Student@123"))
                .role(Role.STUDENT)
                .department("Computer Science")
                .phone("+1 555-0101")
                .active(true)
                .build());

        User student2 = userRepository.save(User.builder()
                .name("Jordan Lee")
                .email("student2@campusconnect.edu")
                .password(passwordEncoder.encode("Student@123"))
                .role(Role.STUDENT)
                .department("Electrical Engineering")
                .phone("+1 555-0102")
                .active(true)
                .build());

        // 3. Create Staff Technicians
        User staff1 = userRepository.save(User.builder()
                .name("Marcus Chen")
                .email("staff.it@campusconnect.edu")
                .password(passwordEncoder.encode("Staff@123"))
                .role(Role.STAFF)
                .department("IT Support")
                .phone("+1 555-0201")
                .active(true)
                .build());

        User staff2 = userRepository.save(User.builder()
                .name("Sarah Jenkins")
                .email("staff.electrical@campusconnect.edu")
                .password(passwordEncoder.encode("Staff@123"))
                .role(Role.STAFF)
                .department("Electrical Maintenance")
                .phone("+1 555-0202")
                .active(true)
                .build());

        User staff3 = userRepository.save(User.builder()
                .name("David Rodriguez")
                .email("staff.maint@campusconnect.edu")
                .password(passwordEncoder.encode("Staff@123"))
                .role(Role.STAFF)
                .department("Hostel Maintenance")
                .phone("+1 555-0203")
                .active(true)
                .build());

        User staff4 = userRepository.save(User.builder()
                .name("Priya Sharma")
                .email("staff.classroom@campusconnect.edu")
                .password(passwordEncoder.encode("Staff@123"))
                .role(Role.STAFF)
                .department("Classroom Maintenance")
                .phone("+1 555-0204")
                .active(true)
                .build());

        // 4. Create Campus Facilities
        Facility f1 = facilityRepository.save(Facility.builder()
                .name("Executive Seminar Hall")
                .description("Air-conditioned seminar hall with dual projectors and surround audio system.")
                .location("Main Academic Block, 3rd Floor")
                .capacity(200)
                .status("AVAILABLE")
                .imageUrl("https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=60")
                .build());

        Facility f2 = facilityRepository.save(Facility.builder()
                .name("Advanced Computing Lab 3")
                .description("60 high-performance workstations with GPU and high-speed gigabit LAN.")
                .location("Technology Complex, Room 204")
                .capacity(60)
                .status("AVAILABLE")
                .imageUrl("https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=60")
                .build());

        Facility f3 = facilityRepository.save(Facility.builder()
                .name("Indoor Badminton Court")
                .description("Professional wooden indoor court with LED lighting and spectator seating.")
                .location("Campus Sports Pavilion")
                .capacity(30)
                .status("AVAILABLE")
                .imageUrl("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60")
                .build());

        Facility f4 = facilityRepository.save(Facility.builder()
                .name("Central Library Discussion Room")
                .description("Soundproof group discussion and presentation study room with whiteboard.")
                .location("Central Library, Level 2")
                .capacity(12)
                .status("AVAILABLE")
                .imageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60")
                .build());

        // 5. Create Sample Complaints
        complaintRepository.save(Complaint.builder()
                .requestNumber("REQ-2026-0001")
                .title("AC Not Cooling in Seminar Hall 1")
                .description("The central AC unit in Seminar Hall 1 is blowing warm air during afternoon lectures.")
                .category("Classroom Maintenance")
                .priority("HIGH")
                .status("ASSIGNED")
                .location("Main Academic Block, Seminar Hall 1")
                .studentId(student1.getId())
                .studentName(student1.getName())
                .assignedStaff("Priya Sharma")
                .createdAt(LocalDateTime.now().minusDays(3))
                .build());

        complaintRepository.save(Complaint.builder()
                .requestNumber("REQ-2026-0002")
                .title("Wi-Fi Router Disconnected in Hostel B 2nd Floor")
                .description("Hostel B wing access point router is offline. Students cannot access course portal.")
                .category("IT Support")
                .priority("URGENT")
                .status("IN_PROGRESS")
                .location("Hostel Block B, 2nd Floor Corridor")
                .studentId(student1.getId())
                .studentName(student1.getName())
                .assignedStaff("Marcus Chen")
                .createdAt(LocalDateTime.now().minusDays(2))
                .build());

        complaintRepository.save(Complaint.builder()
                .requestNumber("REQ-2026-0003")
                .title("Water Leakage in 1st Floor Restroom")
                .description("Continuous water leakage from tap in the engineering block ground floor.")
                .category("Plumbing")
                .priority("MEDIUM")
                .status("RESOLVED")
                .location("Tech Block Ground Floor Restroom")
                .studentId(student1.getId())
                .studentName(student1.getName())
                .assignedStaff("David Rodriguez")
                .resolutionNotes("Replaced the damaged rubber washer in the main outlet tap. Water pressure tested.")
                .createdAt(LocalDateTime.now().minusDays(5))
                .build());

        complaintRepository.save(Complaint.builder()
                .requestNumber("REQ-2026-0004")
                .title("Projector HDMI Cable Faulty in Room 302")
                .description("Projector HDMI signal flickers whenever connected to laptops.")
                .category("Electrical Issues")
                .priority("HIGH")
                .status("SUBMITTED")
                .location("Classroom 302, 3rd Floor")
                .studentId(student2.getId())
                .studentName(student2.getName())
                .createdAt(LocalDateTime.now().minusHours(4))
                .build());

        // 6. Create Sample Booking
        bookingRepository.save(Booking.builder()
                .facilityId(f1.getId())
                .facilityName(f1.getName())
                .studentId(student1.getId())
                .studentName(student1.getName())
                .bookingDate(LocalDate.now().plusDays(2).toString())
                .startTime("10:00")
                .endTime("12:00")
                .purpose("AI & Full Stack Student Workshop")
                .status("CONFIRMED")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build());

        System.out.println(">> Seed data successfully loaded into MySQL!");
        System.out.println(">> Admin: admin@campusconnect.edu | Password: Admin@123");
        System.out.println(">> Student: student1@campusconnect.edu | Password: Student@123");
    }
}
