# Scope And Limitations

This phase deliberately stops at identity and academic management foundations. Attendance, event scheduling, NFC reading, QR payments, charges, wallets, refunds, audit reporting, and real device security are deferred.

JSON files provide initial seed data. The browser LocalStorage repository takes over on first launch and preserves changes on refresh. LocalStorage is not a secure database, is not shared between devices, and must not hold production passwords or payment credentials. Demo passwords exist only to make local demonstrations possible.

Device records currently contain simulated identifiers. Capacitor and Android NFC integration will require platform permissions and a centralized backend in a later phase.