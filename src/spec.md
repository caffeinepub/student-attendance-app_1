# Specification

## Summary
**Goal:** Stop student records from disappearing across classes/sections by fixing backend storage keying and making student IDs globally unique and upgrade-safe, with a clearer empty-state/diagnostic path in the UI.

**Planned changes:**
- Update backend storage so student records are keyed in a way that cannot collide across classes/sections, preventing overwrites when adding students in multiple classes.
- Change the add-student flow to generate globally unique student IDs (not derived from per-class/section counts) and ensure the backend safely rejects/handles any overwrite-risk updates.
- Persist student records and any needed ID/index state across canister upgrades so data and ID generation do not reset after redeploy/upgrade.
- Add a UI recovery/diagnostic empty-state for Student List that distinguishes (in English) between unauthorized/not logged in, loading error, and genuinely empty; optionally allow checking whether any students exist in the backend without exposing private data to unauthorized users.

**User-visible outcome:** Users can add students in Class 7/8/9 (and other sections) without students disappearing or overwriting each other, students remain after upgrades, and the Student List provides clear empty/error states with a way to confirm whether data exists.
