# Enterprise People - Product Features Matrix

This document provides a comprehensive list of the core modules and functional capabilities built into the Enterprise People Multi-Service ERP system.

---

## 1. Authentication & Role-Based Access Control (RBAC)
- **Stateful Secure Session Management**: JWT token-based authentication with cookie-based authorization.
- **Glassmorphic Login Panel**: Sleek login dashboard containing secure fields, automated Virtual Keyboard inputs, validation, and loading spinners.
- **Demo Quick-Autofill Console**: Accordion menu allowing testers to click and automatically populate test credentials for all system roles.
- **Dynamic Dashboard Redirection**: Redirects users to specialized modules based on their emails and database roles:
  - `HR_STAFF` -> HR Portal
  - `OPERATIONS_STAFF` -> Operations Portal
  - `CREATIVE_SPECIALIST` -> Employee Self-Service (ESS) Dashboard
  - `STAKEHOLDER` -> Financial & Audit Ledger dashboard

---

## 2. HR Specialist Dashboard
- **Roster & Onboarding Module**: Form to register new full-time and freelance staff, defining contract terms, roles, and base salary.
- **Centralized Payroll Console**: Monitors base salaries, auto-calculated early task delivery bonuses (e.g., $100 for high-priority task completions), deductions, and payout toggles (Pending, Approved, Paid).
- **Time & Attendance Reviewer**: Tracks employee check-in/out stamps, IP addresses, geofenced GPS office locations, shift statuses (On Time/Late), and overtime logs.
- **Leave Request Manager**: Logs requests (Sick, Casual, Annual, parental) and allows the HR representative to approve or decline requests.
- **Help Desk Query Resolver**: System to manage, update, and resolve support tickets submitted by staff members.
- **Performance Appraisals**: Form to document annual OKRs, KPI ratings, managers' reviews, self-appraisals, and L1-L3 competency evaluations.

---

## 3. Operations Manager Dashboard
- **Project Progress Tracker**: Lists projects with completion percentages aggregated automatically based on the count of finished tasks.
- **Task Allocation Grid**: Grid to create project tasks, assign priorities (Low, Medium, High), deadlines, and team members.
- **Submission QA Queue**: Reviews deliverables uploaded by designers, editors, or developers, reads design notes, and accepts or rejects submissions.
- **WebSockets Priority Broadcaster**: Emergency alert broadcast console that triggers immediate popup alerts across all online client terminals.

---

## 4. Employee Self-Service (ESS) Portal
- **Profile Selector Sandbox**: Easily swap active profile views to verify items for specific team members (Web Developers, Editors, Photographers, Digital Marketers).
- **Personal Task Board**: View assigned tasks, toggle task statuses (e.g. "In Progress"), and submit finished deliverables (link, filename, and commentary).
- **Attendance Punch Portal**: Punch checking timestamps that verify face ID and geolocations, and log shift hours.
- **Leave Application Form**: Form to apply for time-off and check remaining leave balances dynamically.
- **Payslips & Dossier View**: Detailed overview of personal emergency contacts, skills lists, certifications, reporting lines, and historical payslips.
- **Surveys & Engagement Polls**: Submit votes on active company initiatives (such. support for a 4-day work week trial) with real-time results displays.
- **Discussion Board**: Post announcements, reminders, and collaborate in the community board.

---

## 5. Shared Logistical Modules

### Inventory Asset Module
- Central registry for expensive physical gear (RTX Editing workstations, Sony FX3 Cinema Cameras, lighting storm LED kits, audio packages, neon sign backdrops).
- Assign items to staff members for specific project timelines.
- Log return check-ins, view serial numbers, and adjust maintenance status parameters (Available, Checked Out, Maintenance).

### Scheduling Calendar Module
- Calendar grid summarizing company activities (Shoots, Sprints, Client Events, editing reviews).
- Slot manager to allocate times, dates, and types for projects and staff members.

---

## 6. Audit Logging & System Diagnostics
- **Automated Ledger Logging**: Automatically logs all database state changes (POST/PUT/DELETE) alongside timestamps, IP addresses, and original/updated JSON payloads.
- **Executive Audit Board**: Restricted view in the Stakeholders dashboard displaying the chronological ledger of actions.
- **Architecture Diagram**: Interactive flowchart showing frontend-to-backend socket connections, routes, middleware, and database bindings.
- **Embedded Database Self-Healing**: Checks database directories and SQLite `dev.db` files on start, auto-creating them and running schema migrations if missing.
