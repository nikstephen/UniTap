# UniTap Requirements

## Phase 1 foundation

UniTap supports BSIT students, CSG officers, and CSG administrators. Accounts may have more than one role. Students can view their own academic identity, while officers and administrators receive only the operations permitted by their role.

The future system will support university NFC IDs, academic terms, historical section assignments, attendance, events, charges, wallets, payments, authorized devices, role-based access, audit trails, and reporting.

## Phase 2 acceptance flow

The current demonstration supports login, active-account validation, role resolution, student profile and history viewing, academic-term and section management, student listing, and simulated device visibility. Data is fictional and remains in the browser only.

## Business rules

- Student numbers are unique identifiers.
- A section belongs to one academic term.
- Only one term is active at a time.
- Historical assignments are retained rather than deleted.
- An assignment cannot conflict with another assignment for the same student and term.
- Browser role checks are demonstration controls; a future backend must enforce authorization.