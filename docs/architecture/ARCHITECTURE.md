# CampusConnect: System Architecture Specification

## 1. Architectural Philosophy
CampusConnect is structured as a cloud-native microservices application built with Spring Boot 3.x, Spring Cloud Gateway, Netflix Eureka, React 18, MySQL, MongoDB, and Redis.

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        Browser["React 18 SPA (Vite + Tailwind CSS + Lucide + Recharts)"]
    end

    subgraph Edge ["Edge & Discovery Layer"]
        Gateway["Spring Cloud Gateway (:8080)\n- Central Route Ingress\n- CORS Policies\n- JWT Validation & Header Forwarding"]
        Eureka["Netflix Eureka Server (:8761)\n- Service Registry & Heartbeats"]
    end

    subgraph Services ["Core Microservices"]
        UserService["User Service (:8081)\n- Authentication (JWT / BCrypt)\n- RBAC (Student, Staff, Admin)\n- Department Hierarchy"]
        RequestService["Request Service (:8082)\n- Ticket Lifecycle (REQ-2026-XXXX)\n- State Machine & Resolution Notes\n- Lost & Found Hub\n- Comments Engine"]
        BookingService["Booking Service (:8083)\n- Facility Catalog\n- Atomic Anti-Overlap Scheduling"]
        NotificationService["Notification Service (:8084)\n- In-App Alerts & Badges\n- System Audit Trail (MongoDB)"]
    end

    subgraph Data ["Data & Cache Layer"]
        MySQL_DB[("MySQL Database\n- Relational Transactional Data")]
        Mongo_DB[("MongoDB Database\n- Activity Audits & Comments")]
        Redis_Cache[("Redis Cache\n- Stats, Facilities, Departments")]
    end

    Browser -->|HTTP REST /api/*| Gateway
    Gateway --> Eureka
    UserService --> Eureka
    RequestService --> Eureka
    BookingService --> Eureka
    NotificationService --> Eureka

    Gateway -->|/api/auth/**, /api/users/**| UserService
    Gateway -->|/api/requests/**, /api/lost-found/**| RequestService
    Gateway -->|/api/facilities/**, /api/bookings/**| BookingService
    Gateway -->|/api/notifications/**, /api/activity-logs/**| NotificationService

    UserService --> MySQL_DB
    UserService --> Redis_Cache
    RequestService --> MySQL_DB
    RequestService --> Mongo_DB
    BookingService --> MySQL_DB
    BookingService --> Redis_Cache
    NotificationService --> Mongo_DB
```

---

## 2. API Gateway & Security Flow

1. **Authentication Token Flow**:
   - The user authenticates at `/api/auth/login`.
   - `UserService` generates a signed HMAC-SHA256 JWT containing `userId`, `email`, and `role`.
   - The client stores the token in `localStorage` and includes it in the `Authorization: Bearer <token>` header on subsequent requests.
2. **Gateway Pre-Filtering & Claim Enrichment**:
   - `JwtAuthFilter` in the API Gateway intercepts incoming requests.
   - For valid tokens, the Gateway decodes claims and appends enrichment headers:
     - `X-User-Id`: The user's database ID.
     - `X-User-Role`: The user's role (`STUDENT`, `STAFF`, `ADMIN`).
     - `X-User-Email`: The user's university email.
   - Downstream services read these trusted headers or re-validate the token for defense-in-depth.

---

## 3. Database Ownership & Isolation
Each microservice owns its business domain to ensure loose coupling:
- **User Service**: Controls `users` and `departments`.
- **Request Service**: Controls `service_requests`, `request_history`, `lost_found_items`, and MongoDB `request_comments`.
- **Booking Service**: Controls `facilities` and `bookings`.
- **Notification Service**: Controls MongoDB `notifications` and `activity_logs`.

---

## 4. Facility Booking Concurrency Control
To prevent overlapping facility reservations, the Booking Service employs:
1. **Time-Window Math**:
   An overlap between an existing interval `[S_1, E_1]` and a requested interval `[S_2, E_2]` occurs if and only if:
   $$S_1 < E_2 \quad \text{AND} \quad E_1 > S_2$$
2. **Database Query with Active Filter**:
   ```sql
   SELECT COUNT(b) FROM Booking b
   WHERE b.facilityId = :facilityId
     AND b.status IN ('CONFIRMED', 'PENDING_APPROVAL')
     AND (b.startTime < :endTime AND b.endTime > :startTime);
   ```
3. **Transaction Isolation**:
   The booking creation method is executed with `Isolation.SERIALIZABLE` or synchronized transactional locking, throwing an `OverlappingBookingException` (HTTP 409 Conflict) if any collision is found.
