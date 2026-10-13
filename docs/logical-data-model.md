# Logical Data Model

Current records are `User`, `Role`, `StudentProfile`, `AcademicTerm`, `Section`, `StudentSectionAssignment`, and `AuthorizedDevice`. Future records are `Event`, `EventOccurrence`, `Attendance`, `ChargeTemplate`, `StudentCharge`, `Wallet`, `WalletTransaction`, `Payment`, and `AuditLog`.

```mermaid
erDiagram
  USER ||--o{ STUDENT_PROFILE : owns
  USER }o--o{ ROLE : has
  STUDENT_PROFILE ||--o{ STUDENT_SECTION_ASSIGNMENT : receives
  ACADEMIC_TERM ||--o{ SECTION : contains
  ACADEMIC_TERM ||--o{ STUDENT_SECTION_ASSIGNMENT : scopes
  SECTION ||--o{ STUDENT_SECTION_ASSIGNMENT : places
  USER ||--o{ AUTHORIZED_DEVICE : assigned
  USER { string id string username string status }
  ROLE { string id string name }
  STUDENT_PROFILE { string id string studentNumber string nfcStatus }
  ACADEMIC_TERM { string id string academicYear string status }
  SECTION { string id string name int yearLevel }
  STUDENT_SECTION_ASSIGNMENT { string id string status }
  AUTHORIZED_DEVICE { string id string deviceIdentifier string status }
```