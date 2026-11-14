# CampusConnect: Database Schema & Data Dictionary

## 1. Relational Database Tables (MySQL)

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(120) | NOT NULL, UNIQUE | University email address |
| `password` | VARCHAR(255) | NOT NULL | BCrypt encrypted password hash |
| `role` | VARCHAR(20) | NOT NULL | Enum: `STUDENT`, `STAFF`, `ADMIN` |
| `department_id`| BIGINT | NULL | Associated department ID |
| `phone` | VARCHAR(20) | NULL | Contact phone number |
| `account_status`| VARCHAR(20)| NOT NULL, DEFAULT 'ACTIVE' | Enum: `ACTIVE`, `INACTIVE` |
| `created_at` | DATETIME | NOT NULL | Timestamp of account creation |
| `updated_at` | DATETIME | NULL | Timestamp of last profile update |

### `departments`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Department ID |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Department title |
| `description` | VARCHAR(500) | NULL | Scope of maintenance responsibilities |
| `created_at` | DATETIME | NOT NULL | Creation timestamp |

### `service_requests`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Primary ticket identifier |
| `request_number`| VARCHAR(30)| NOT NULL, UNIQUE | Human-readable ID (e.g. `REQ-2026-0001`) |
| `title` | VARCHAR(150) | NOT NULL | Concise problem summary |
| `description` | TEXT | NOT NULL | Comprehensive incident description |
| `category` | VARCHAR(30) | NOT NULL | Category enum (`IT_SUPPORT`, `PLUMBING`, etc.) |
| `priority` | VARCHAR(20) | NOT NULL | Priority enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) |
| `status` | VARCHAR(20) | NOT NULL | Status enum (`SUBMITTED`, `IN_PROGRESS`, etc.) |
| `location` | VARCHAR(100) | NOT NULL | Campus building, floor, room |
| `student_id` | BIGINT | NOT NULL | Submitter's user ID |
| `student_name` | VARCHAR(100) | NOT NULL | Submitter's name |
| `assigned_staff_id`| BIGINT | NULL | Assigned staff user ID |
| `assigned_staff_name`| VARCHAR(100)| NULL | Assigned staff name |
| `department_id` | BIGINT | NULL | Handling department ID |
| `resolution_notes`| TEXT | NULL | Technician's documented fix |
| `image_url` | VARCHAR(500) | NULL | Photo attachment URL |
| `created_at` | DATETIME | NOT NULL | Ticket creation timestamp |
| `resolved_at` | DATETIME | NULL | Resolution completion timestamp |

### `request_history`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | History record ID |
| `request_id` | BIGINT | NOT NULL | Associated service request ID |
| `action` | VARCHAR(50) | NOT NULL | Action type (`CREATED`, `STATUS_CHANGED`, etc.) |
| `status_from`| VARCHAR(20) | NULL | Previous state |
| `status_to` | VARCHAR(20) | NULL | New state |
| `performed_by`| BIGINT | NOT NULL | User ID who executed transition |
| `performed_by_name`| VARCHAR(100)| NOT NULL | User name |
| `comments` | TEXT | NULL | Transition note |
| `timestamp` | DATETIME | NOT NULL | Event timestamp |

### `facilities`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Facility ID |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Facility title |
| `description`| TEXT | NOT NULL | Overview and hardware/amenities |
| `location` | VARCHAR(100) | NOT NULL | Building and room number |
| `capacity` | INT | NOT NULL | Maximum seating capacity |
| `status` | VARCHAR(20) | NOT NULL | Enum: `AVAILABLE`, `MAINTENANCE`, `INACTIVE`|
| `booking_rules`| TEXT | NULL | Usage guidelines |
| `created_at` | DATETIME | NOT NULL | Creation timestamp |

### `bookings`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Booking ID |
| `facility_id` | BIGINT | NOT NULL | Associated facility ID |
| `facility_name`| VARCHAR(100)| NOT NULL | Cached facility title |
| `student_id` | BIGINT | NOT NULL | Student user ID |
| `student_name` | VARCHAR(100)| NOT NULL | Student full name |
| `start_time` | DATETIME | NOT NULL | Slot start time |
| `end_time` | DATETIME | NOT NULL | Slot end time |
| `purpose` | VARCHAR(255)| NOT NULL | Academic purpose or event title |
| `status` | VARCHAR(20) | NOT NULL | Enum: `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| `created_at` | DATETIME | NOT NULL | Booking timestamp |

### `lost_found_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Item listing ID |
| `title` | VARCHAR(150) | NOT NULL | Item name |
| `description` | TEXT | NOT NULL | Distinguishing characteristics |
| `category` | VARCHAR(50) | NOT NULL | Item category |
| `item_type` | VARCHAR(20) | NOT NULL | Enum: `LOST`, `FOUND` |
| `location` | VARCHAR(100) | NOT NULL | Where lost or discovered |
| `owner_id` | BIGINT | NOT NULL | Reporter user ID |
| `owner_name` | VARCHAR(100) | NOT NULL | Reporter name |
| `contact_info`| VARCHAR(100) | NULL | Phone or contact desk |
| `status` | VARCHAR(20) | NOT NULL | Enum: `REPORTED`, `CLAIMED`, `RESOLVED` |
| `created_at` | DATETIME | NOT NULL | Listing timestamp |

---

## 2. Document Database Collections (MongoDB)

### Collection: `request_comments`
```json
{
  "_id": "ObjectId('6550a12f...')",
  "requestId": 1,
  "authorId": 2,
  "authorName": "Marcus Chen (IT Lead)",
  "authorRole": "STAFF",
  "comment": "Replaced PoE injector; AP is online now.",
  "createdAt": "2026-11-14T08:30:00Z"
}
```

### Collection: `notifications`
```json
{
  "_id": "ObjectId('6550a13a...')",
  "recipientId": 5,
  "title": "Service Request In Progress",
  "message": "Your request REQ-2026-0001 is now under active repair.",
  "type": "REQUEST_UPDATE",
  "referenceId": 1,
  "referenceType": "REQUEST",
  "isRead": false,
  "createdAt": "2026-11-14T08:31:00Z"
}
```

### Collection: `activity_logs`
```json
{
  "_id": "ObjectId('6550a14b...')",
  "userId": 1,
  "userName": "Dr. Eleanor Vance (System Admin)",
  "userRole": "ADMIN",
  "action": "ASSIGN_STAFF",
  "entityType": "SERVICE_REQUEST",
  "entityId": 1,
  "details": "Assigned REQ-2026-0001 to Marcus Chen (IT Lead)",
  "timestamp": "2026-11-14T08:25:00Z"
}
```
