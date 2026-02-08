# Specification

## Summary
**Goal:** Ensure Class 8/9 students reliably appear across the app, make student/attendance data persist across canister upgrades, and enable monthly attendance export as an Excel-compatible CSV.

**Planned changes:**
- Fix backend student lookup so Class 8 and Class 9 (any section) return existing students (matching Class 7 behavior) across Student List and Attendance screens.
- Persist student storage through canister upgrades, restoring any indexes/counters so IDs and class/section lookups continue working after redeploy.
- Add backend APIs to save and fetch daily roll-call data, and query roll calls for a given month/class/section.
- Update frontend roll-call hooks/screens to use backend-stored attendance (replacing localStorage) so data remains after refresh and across devices.
- Add a Monthly Export UI to download attendance as an Excel-compatible .csv with English headers, using the selected month (and year if needed) and the current class/section; show a clear English error if not authorized.

**User-visible outcome:** Selecting Class 8/9 shows existing students without re-adding them; attendance entries are saved to the backend and survive refresh/upgrade; users can export monthly attendance to an Excel-opening CSV from the app.
