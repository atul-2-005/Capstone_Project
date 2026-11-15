# CampusConnect – Smart University Service Management System
> **Full Stack Development II (FSD-II) Practical Examination Project**  
> Built with **React.js (Frontend)**, **Java Spring Boot (Single Monolithic Backend)**, **MySQL (Database)**, and **JWT Authentication**.

---

## 1. Project Overview

**CampusConnect** is a clean, practical university service management web application designed for college practical examinations and demonstrations. It connects students and campus administrators to streamline service complaints and facility bookings.

### Implemented Features (Exactly 7 Modules):
1. **Student Registration & Login**: Students can create an account and log in securely with JWT authentication and BCrypt password encryption.
2. **Student Dashboard**: Shows summary cards for total, pending, in-progress, and resolved complaints, recent complaint status, and quick complaint submission.
3. **Submit Campus Complaints**: Students can submit complaints with Title, Category (Hostel, Classroom, Electrical, Plumbing, IT, Transport, Other), Priority (Low, Medium, High, Urgent), Location, and Description.
4. **View Personal Complaints & Status**: Students can view their own complaints, search/filter, and track real-time status updates (`SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
5. **Admin Login & Dashboard**: Administrators can log in, view university-wide metrics, charts by status/category, and recent complaints requiring action.
6. **Admin View, Assign & Update Complaints**: Administrators can view all student complaints, assign technicians/staff members, and update complaint status with resolution remarks.
7. **Basic Facility Booking**: Students can browse campus facilities (Seminar Hall, Computer Lab, Sports Court, Library Room) and book available time slots; Administrators can view and approve bookings.

---

## 2. Technology Stack

- **Frontend**: React.js 18, Vite, Tailwind CSS, Lucide React icons, Axios, Recharts
- **Backend**: Java 17+, Spring Boot 3.3.4 (Single Unified Backend Application)
  - `spring-boot-starter-web` (REST APIs)
  - `spring-boot-starter-data-jpa` & Hibernate (MySQL ORM)
  - `spring-boot-starter-security` (Role-Based Access Control)
  - `io.jsonwebtoken` JJWT (JWT Token Authentication)
- **Database**: MySQL (Single relational database with auto table generation)
- **Architecture**: Client-Server Monolith (No Docker, No Eureka, No Redis, No MongoDB required)

---

## 3. Pre-Seeded Demonstration Accounts

When the Spring Boot backend starts for the first time on MySQL, it automatically populates sample accounts, campus facilities, and initial complaints into the database:

| Role | Email Address | Default Password | Description |
|---|---|---|---|
| **STUDENT** | `student1@campusconnect.edu` | `Student@123` | Pre-seeded student with complaints & bookings |
| **ADMIN** | `admin@campusconnect.edu` | `Admin@123` | Campus administrator with full management rights |
| **STAFF** | `staff.it@campusconnect.edu` | `Staff@123` | IT Support technician |

> **Tip for Viva/Exam**: On the login page, you can simply click the **"1-Click Demo Evaluation"** buttons (`Student`, `Admin`, or `Staff`) to log in immediately without typing passwords!

---

## 4. Simple Windows VS Code Startup Instructions

### Prerequisites
1. **Java JDK 17 or higher** installed (`java -version`).
2. **Node.js 18 or higher** installed (`node -v`).
3. **MySQL Server** installed and running on default port `3306` (e.g., via MySQL Workbench, XAMPP, or standalone MySQL service).

---

### Step 1: Verify MySQL Database Connection
Open `backend/src/main/resources/application.properties` and verify your local MySQL username and password:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campusconnect?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```
*(Change `spring.datasource.password=root` to your MySQL root password if different. Spring Boot will automatically create the `campusconnect` database and all tables on startup).*

---

### Step 2: Open Project in VS Code
1. Open VS Code.
2. Click **File > Open Folder...** and select `Full_Stack_Project`.

---

### Step 3: Run the Spring Boot Backend

#### Method A (Inside VS Code GUI - Recommended):
1. In VS Code Explorer, open `backend/src/main/java/com/campusconnect/CampusConnectApplication.java`.
2. Click the **Run** button right above `public static void main(String[] args)` (or press `F5`).
3. The backend starts on **http://localhost:8080**.

#### Method B (Using VS Code Terminal):
1. Open a new terminal in VS Code (`Ctrl + ` `~`).
2. Run:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```

---

### Step 4: Run the React Frontend

1. Open a second terminal tab in VS Code.
2. Run:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
3. Open your browser and navigate to: **http://localhost:5173**

---

## 5. MySQL Database Structure

Spring Boot automatically generates the following normalized tables in MySQL:

1. **`users`**:
   - `id` (PK, Auto-increment)
   - `name`, `email` (Unique), `password` (BCrypt encoded)
   - `role` (`STUDENT`, `ADMIN`, `STAFF`)
   - `department`, `phone`, `active`, `created_at`
2. **`complaints`**:
   - `id` (PK, Auto-increment)
   - `request_number` (Unique, e.g., `REQ-2026-0001`)
   - `title`, `description`, `category`, `priority`, `status`
   - `location`, `student_id`, `student_name`, `assigned_staff`, `resolution_notes`, `created_at`, `updated_at`
3. **`facilities`**:
   - `id` (PK, Auto-increment)
   - `name`, `description`, `location`, `capacity`, `status`, `image_url`
4. **`bookings`**:
   - `id` (PK, Auto-increment)
   - `facility_id`, `facility_name`, `student_id`, `student_name`
   - `booking_date`, `start_time`, `end_time`, `purpose`, `status`, `created_at`

---

## 6. REST API Endpoints Reference

| HTTP Method | API Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new student account | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | Public |
| `GET` | `/api/users/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/users/staff` | Fetch technicians list for assignment | Admin / Staff |
| `POST` | `/api/requests` | Submit a new complaint | Student |
| `GET` | `/api/requests` | View complaints (All for Admin, personal for Student) | Authenticated |
| `GET` | `/api/requests/my` | View logged-in student's complaints | Student |
| `GET` | `/api/requests/{id}` | View detailed complaint info | Authenticated |
| `PATCH` | `/api/requests/{id}/status` | Update complaint status & resolution notes | Admin / Staff |
| `PATCH` | `/api/requests/{id}/assign` | Assign complaint to a technician/staff | Admin |
| `GET` | `/api/requests/stats` | Fetch summary count metrics | Authenticated |
| `GET` | `/api/facilities` | List all available campus facilities | Public / Auth |
| `POST` | `/api/facilities` | Create new campus facility | Admin |
| `DELETE` | `/api/facilities/{id}` | Delete a facility | Admin |
| `POST` | `/api/bookings` | Book a facility slot | Student |
| `GET` | `/api/bookings` | List all bookings | Admin |
| `GET` | `/api/bookings/my` | List student's own bookings | Student |
| `PATCH` | `/api/bookings/{id}/cancel` | Cancel an eligible booking | Student / Admin |
| `PATCH` | `/api/bookings/{id}/approve` | Approve a booking | Admin |
| `GET` | `/api/dashboard/admin` | Fetch admin dashboard analytics & charts | Admin |

---

## 7. College Viva / Examination Q&A Guide

When demonstrating this project during your practical exam, use these answers:

* **Q: How does authentication work?**  
  *A:* "When the student or admin logs in, Spring Security verifies the credentials and `JwtUtil` issues a signed JSON Web Token (JWT) containing the user ID, email, and role. The React client stores this token in `localStorage` and Axios sends it in the `Authorization: Bearer <token>` header on every subsequent API call. The backend `JwtFilter` intercepts requests and validates the token before executing controller methods."

* **Q: How are passwords secured?**  
  *A:* "Passwords are never saved in plain text. Spring Security's `BCryptPasswordEncoder` hashes passwords with salting before saving them in the MySQL `users` table."

* **Q: How does the React frontend communicate with the backend?**  
  *A:* "The React application runs on port `5173` and the Spring Boot backend runs on port `8080`. Vite's development server proxies all `/api` requests to `http://localhost:8080`, avoiding Cross-Origin Resource Sharing (CORS) complications."

* **Q: How does complaint assignment and status tracking work?**  
  *A:* "When a student submits a complaint, its status defaults to `SUBMITTED`. The Admin logs in, views the complaint in the queue, and assigns it to a staff technician (updating the status to `ASSIGNED`). When the technician starts work, the status changes to `IN_PROGRESS`. Once fixed, the technician records resolution notes and marks it `RESOLVED`."

* **Q: How does facility booking avoid overlapping conflicts?**  
  *A:* "In `BookingService.java`, before saving a new booking, the application queries MySQL for existing active bookings on that facility for the requested date. If the requested time slot is already taken, an exception is thrown, preventing double bookings."
