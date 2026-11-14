package com.campusconnect.user.data;

import com.campusconnect.user.entity.AccountStatus;
import com.campusconnect.user.entity.Department;
import com.campusconnect.user.entity.Role;
import com.campusconnect.user.entity.User;
import com.campusconnect.user.repository.DepartmentRepository;
import com.campusconnect.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SeedDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedDepartments();
        seedUsers();
    }

    private void seedDepartments() {
        if (departmentRepository.count() == 0) {
            log.info("Seeding initial departments...");
            departmentRepository.saveAll(List.of(
                    Department.builder().name("Information Technology").description("Handles campus IT, WiFi, portals, computer labs, and student systems").build(),
                    Department.builder().name("Campus Maintenance").description("Manages campus facilities, classrooms, furniture, civil maintenance, and grounds").build(),
                    Department.builder().name("Electrical & Utilities").description("Handles electrical systems, power backup, lighting, HVAC, and lab power").build(),
                    Department.builder().name("Hostel Administration").description("Oversees residential student hostels, dining halls, and warden services").build(),
                    Department.builder().name("Library Services").description("Manages central library resources, quiet study zones, and digital archives").build()
            ));
            log.info("Departments seeded successfully.");
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Seeding default users (Admin, Staff, Students)...");

            Department itDept = departmentRepository.findByNameIgnoreCase("Information Technology").orElse(null);
            Department maintDept = departmentRepository.findByNameIgnoreCase("Campus Maintenance").orElse(null);
            Department electDept = departmentRepository.findByNameIgnoreCase("Electrical & Utilities").orElse(null);

            // 1. Admin
            userRepository.save(User.builder()
                    .name("Dr. Eleanor Vance (System Admin)")
                    .email("admin@campusconnect.edu")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .phone("+1 555-0100")
                    .accountStatus(AccountStatus.ACTIVE)
                    .build());

            // 2. Staff Accounts
            userRepository.save(User.builder()
                    .name("Marcus Chen (IT Lead)")
                    .email("staff.it@campusconnect.edu")
                    .password(passwordEncoder.encode("Staff@123"))
                    .role(Role.STAFF)
                    .departmentId(itDept != null ? itDept.getId() : null)
                    .phone("+1 555-0101")
                    .accountStatus(AccountStatus.ACTIVE)
                    .build());

            userRepository.save(User.builder()
                    .name("Robert Miller (Facilities Supervisor)")
                    .email("staff.maintenance@campusconnect.edu")
                    .password(passwordEncoder.encode("Staff@123"))
                    .role(Role.STAFF)
                    .departmentId(maintDept != null ? maintDept.getId() : null)
                    .phone("+1 555-0102")
                    .accountStatus(AccountStatus.ACTIVE)
                    .build());

            userRepository.save(User.builder()
                    .name("Aisha Patel (Chief Electrician)")
                    .email("staff.electrical@campusconnect.edu")
                    .password(passwordEncoder.encode("Staff@123"))
                    .role(Role.STAFF)
                    .departmentId(electDept != null ? electDept.getId() : null)
                    .phone("+1 555-0103")
                    .accountStatus(AccountStatus.ACTIVE)
                    .build());

            // 3. 10 Student Accounts
            String[] studentNames = {
                    "Alex Rivera", "Sophia Martinez", "Liam Johnson", "Emma Davis", "Noah Wilson",
                    "Olivia Brown", "Ethan Taylor", "Ava Anderson", "Lucas Thomas", "Mia Jackson"
            };

            for (int i = 0; i < studentNames.length; i++) {
                int num = i + 1;
                userRepository.save(User.builder()
                        .name(studentNames[i])
                        .email("student" + num + "@campusconnect.edu")
                        .password(passwordEncoder.encode("Student@123"))
                        .role(Role.STUDENT)
                        .phone("+1 555-020" + num)
                        .accountStatus(AccountStatus.ACTIVE)
                        .build());
            }

            log.info("Users seeded successfully: 1 Admin, 3 Staff, 10 Students.");
        }
    }
}
