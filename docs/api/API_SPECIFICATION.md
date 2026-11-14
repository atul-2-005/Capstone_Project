# CampusConnect: REST API Specification

All protected endpoints require the HTTP Header:
```http
Authorization: Bearer <jwt_access_token>
```

---

## 1. Authentication Service (`/api/auth`)

### `POST /api/auth/register`
Creates a new user profile.
- **Request Body**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "student1@campusconnect.edu",
    "password": "Student@123",
    "role": "STUDENT",
    "phone": "+1 555-0201"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "id": 5,
    "name": "Alex Rivera",
    "email": "student1@campusconnect.edu",
    "role": "STUDENT",
    "departmentId": null
  }
  ```

### `POST /api/auth/login`
Authenticates credentials and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "admin@campusconnect.edu",
    "password": "Admin@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "id": 1,
    "name": "Dr. Eleanor Vance (System Admin)",
    "email": "admin@campusconnect.edu",
    "role": "ADMIN"
  }
  ```

---

## 2. User & Department Management (`/api/users`, `/api/departments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/users` | `ADMIN` | Search and paginate users (role, status, dept) |
| `GET` | `/api/users/staff` | Authenticated | List all campus technicians / staff |
| `PUT` | `/api/users/{id}` | Self or `ADMIN` | Update user details & status |
| `DELETE` | `/api/users/{id}` | `ADMIN` | Deactivate user account |
| `GET` | `/api/departments` | Public / Auth | List all departments (Cached in Redis) |
| `POST` | `/api/departments` | `ADMIN` | Create new department |
| `PUT` | `/api/departments/{id}` | `ADMIN` | Update department details |
| `DELETE` | `/api/departments/{id}` | `ADMIN` | Delete department |

---

## 3. Service Requests & Complaints (`/api/requests`)

### `POST /api/requests`
Submits a new maintenance complaint.
- **Access**: `STUDENT` or `ADMIN`
- **Request Body**:
  ```json
  {
    "title": "Cisco AP Down in Turing Lab 3",
    "description": "Access point is unresponsive. 35 students cannot connect to the campus network.",
    "category": "IT_SUPPORT",
    "priority": "URGENT",
    "location": "Turing Block, Floor 2, Lab 3",
    "imageUrl": "https://example.com/ap-issue.jpg"
  }
  ```
- **Response `201 Created`**:
  Returns the complete `RequestDto` with generated `REQ-2026-XXXX`.

### `PATCH /api/requests/{id}/status`
Transitions the lifecycle state of a ticket.
- **Access**: Assigned `STAFF` or `ADMIN`
- **Request Body**:
  ```json
  {
    "status": "RESOLVED",
    "resolutionNotes": "Cleaned drainage pipe, unblocked debris, and verified flow.",
    "comment": "Work completed at 11:30 AM"
  }
  ```

### `PATCH /api/requests/{id}/assign`
Assigns staff member to ticket.
- **Access**: `ADMIN`
- **Request Body**:
  ```json
  {
    "staffId": 2,
    "staffName": "Marcus Chen",
    "departmentId": 1,
    "departmentName": "Information Technology",
    "notes": "High priority practicum lab"
  }
  ```

---

## 4. Facility Bookings (`/api/facilities`, `/api/bookings`)

### `POST /api/bookings`
Reserves a facility for a specified time window with atomic overlap prevention.
- **Access**: `STUDENT` or `ADMIN`
- **Request Body**:
  ```json
  {
    "facilityId": 1,
    "startTime": "2026-11-15T14:00:00",
    "endTime": "2026-11-15T16:00:00",
    "purpose": "GDSC Cloud Workshop"
  }
  ```
- **Response `201 Created`**: Confirmed `BookingDto`.
- **Response `409 Conflict`**: Returned if the slot overlaps with another reservation.

---

## 5. Lost & Found Hub (`/api/lost-found`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/lost-found` | Search and filter listings (lost, found, category) |
| `POST` | `/api/lost-found` | Submit a new lost or found listing |
| `PATCH`| `/api/lost-found/{id}/status` | Mark listing as `CLAIMED` or `RESOLVED` |
| `DELETE`| `/api/lost-found/{id}` | Delete listing (owner or admin) |

---

## 6. Notifications & Activity Logs (`/api/notifications`, `/api/activity-logs`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Current user alerts with unread counter |
| `PATCH` | `/api/notifications/{id}/read` | Mark individual notification as read |
| `PATCH` | `/api/notifications/read-all` | Mark all user notifications as read |
| `GET` | `/api/activity-logs` | Admin access to chronological audit stream |
