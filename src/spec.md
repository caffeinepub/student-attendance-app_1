# Specification

## Summary
**Goal:** Add a final preview/confirmation step before opening WhatsApp for both single-student and “Message All” bulk actions, showing the exact wa.me destination number and fully rendered message text.

**Planned changes:**
- Add a confirmation/preview UI for the Attendance row WhatsApp action that displays student name, stored parent phone number, and the final rendered message, with actions to Cancel or Open WhatsApp.
- Add a confirmation/preview UI for the “Message All” action on both Attendance and Student List pages, showing the exact final bulk message (including any currently appended content) and the phone number used for the wa.me link, with actions to Cancel or Open WhatsApp.
- Refactor/share WhatsApp message and wa.me link generation utilities so the preview UI and the final “Open WhatsApp” action use the same logic for single and bulk flows.

**User-visible outcome:** Clicking a WhatsApp action (single student or “Message All”) first shows a preview with the exact message and destination number, letting the user cancel or confirm before WhatsApp opens; existing disabled/unavailable behaviors remain unchanged.
