# CabineIQ — New Frontend + ML Feedback Module
## Complete Decision Log
**Royal Air Maroc — Internal Tool**
**Session Resume Document**

---

## 1. Project Context

The existing CabineIQ system (already built and running) consists of:
- 7 Spring Boot microservices (Discovery, Auth, Aircraft, Seat, Passenger, Flight, API Gateway)
- React frontend (being replaced — 100% fresh rebuild)
- MySQL databases per service
- JWT authentication

This document covers **all decisions made for the new frontend rebuild + new ML feedback module**.

---

## 2. New Frontend — Global Decisions

| Decision | Choice |
|---|---|
| Rebuild strategy | 100% fresh — nothing kept from old frontend |
| Visual theme | White/corporate (light default) with dark/light toggle |
| Globe dashboard | Exception — stays dark (dark navy `#07162c`) even in light mode |
| Navigation | Icon rail (left, 44px) — separate from content |
| Routing | Separate pages per feature |
| Chat | Floating bubble in icon rail (not bottom-right corner) |

### Tech Stack (Frontend)
```
React 18 + TypeScript
Tailwind CSS
shadcn/ui
Axios + TanStack Query
React Router v6
react-globe.gl (globe visualization)
Three.js (3D aircraft model)
Recharts (analytics charts)
```

### Pages Structure
```
/login          → Login page (white, modern, RAM corporate)
/               → Dashboard (globe + flight drawer)
/flights/:id    → Flight detail page
/seat-map       → Seat management tool
/passengers     → Passenger manifest
/analytics      → Bar charts + ML pricing insights
/feedback       → Public survey (no auth, QR accessible)
/chat           → AI copilot (or floating panel)
```

---

## 3. Icon Rail — Navigation

| Icon | Route | Notes |
|---|---|---|
| Earth SVG (custom) | `/` | Active: blue `#38bdf8` + left bar indicator |
| Plane `ti-plane` | `/flights` | — |
| Armchair `ti-armchair` | `/seat-map` | Full seat management tool |
| Users `ti-users` | `/passengers` | Full passenger manifest |
| — separator — | — | — |
| Bar chart `ti-chart-bar` | `/analytics` | ML insights + charts |
| Message dots `ti-message-dots` | `/feedback` | Survey management |
| — separator — | — | — |
| Robot `ti-robot` | Chat panel | Red accent `#C41E3A` — always visible |

---

## 4. Dashboard Page (`/`) — Finalized

### Layout
```
┌─────────────────────────────────────────────────────┐
│              TOP BAR (44px)                         │
├──────┬──────────────────────────────────────────────┤
│      │         3D GLOBE (flex: 1)                   │
│ ICON │    react-globe.gl — always dark navy         │
│ RAIL │    arcs · plane markers · airports  ┌────────┤
│(44px)│                                     │ HOVER  │
│      │                                     │ PANEL  │
│      ├─────────────────────────────────────┴────────┤
│      │   FLIGHT DRAWER (210px)                      │
│      │   [🔍 expandable search]  ← flight cards →  │
└──────┴──────────────────────────────────────────────┘
```

### Top Bar Elements
- Logo image (`/ram-logo.jpg`) — provided by RAM
- Stats row: colored dots — Departed / Boarding / Delayed / Cancelled
- LIVE badge: pulsing green dot
- Bell icon with amber dot (unread notifications)
- Username from `localStorage.ram_username`
- Dark/Light toggle

### Globe Behavior
- **Hover** flight card → highlight arc on globe + **hover panel slides in**
- **Click** flight card OR plane marker → navigate to `/flights/:id`
- Plane position logic:
  - `SCHEDULED / BOARDING / DELAYED` → sits at origin
  - `DEPARTED` → animated along route based on `progress %`
  - `ARRIVED` → sits at destination
  - `CANCELLED` → hidden

### Hover Panel (slides in from right, 196px)
- Status badge, flight number, route, aircraft
- Departure / Arrival / Gate / Progress %
- Occupancy bar + `132 / 180 passengers`
- ✕ close button
- `VIEW FULL DETAIL →` button → navigate to `/flights/:id`

### Flight Drawer (210px, bottom)
- **No label** — just the expandable search + cards
- Expandable search: `[🔍]` → click → expands to `[🔍 Filter flights...][✕]`
  - Width animates: `0 → 150px` over `300ms cubic-bezier(.4,0,.2,1)`
  - Auto-focuses input after animation
  - Collapse on Escape or ✕
- Flight cards (horizontal scroll, min-width 148px):
  - Flight number + status badge
  - Route + city
  - Aircraft model
  - Progress bar (4px, glows on DEPARTED)
  - Footer: time + `132/180` pax count

### Airport Coordinates
File: `src/data/airports.ts` — hardcoded IATA coords.
**RAM IT team swaps this file** when connecting to real database.
```
CMN, CDG, JFK, LHR, MAD, BCN, DXB, GVA, MRS, LYS, NCE, TUN, ALG, CAI, DAK
```

---

## 5. Flight Detail Page (`/flights/:id`) — Finalized

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  TOP BAR: [← Back] AT200 CMN→CDG [DEPARTED]            │
│           [Change Status ▾]  [QR Feedback]              │
├──────────────────┬──────────────────────────────────────┤
│   LEFT COL       │        CENTER COL                    │
│   (260px)        │                                      │
│                  │  ┌──────────────────────────────┐    │
│  FLIGHT INFO     │  │   3D AIRCRAFT (Three.js)     │    │
│  Route display   │  │   Boeing 737-800 wireframe   │    │
│  Info grid       │  │   Red/green seat dots on     │    │
│  Occupancy bar   │  │   fuselage — gold = selected │    │
│  Class bars      │  │   drag to rotate / zoom      │    │
│  ─────────────── │  └──────────────────────────────┘    │
│  PASSENGERS·132  │                                      │
│  [🔍 expandable] │  ┌──────────────────────────────┐    │
│                  │  │   SEAT MAP (mini — read only) │    │
│  Passenger list  │  │   Class sections: FIRST /     │    │
│  (scrollable)    │  │   BUSINESS / ECONOMY          │    │
│  Click → gold    │  │   Click passenger → gold seat │    │
│  highlight       │  │   Legend: green/red/gold      │    │
└──────────────────┴──────────────────────────────────────┘
```

### Why Seat Map Appears Here
The mini seat map on this page is a **passenger locator** — not a management tool.
- Clicking a passenger → their seat turns **gold** in the map AND their dot turns gold on the 3D plane
- Label appears in seat map header: `"Ahmed Bennani — Seat 5A"`
- It is **read-only** — no status changes here

### The `/seat-map` page is different:
| | Flight Detail | Seat Map Page |
|---|---|---|
| Scope | One specific flight | Any aircraft |
| Purpose | Locate a passenger | Manage seat inventory |
| Interaction | Click passenger → highlight | Click seat → change status |
| Size | Mini panel (220px) | Full page |

### Passenger Search (Expandable — same animation as drawer)
- Located in passenger list header
- Filters by name OR seat number in real time
- "No passengers found" state when no match

### Top Bar Actions
| Button | Action |
|---|---|
| `← Back` | Navigate back to `/` dashboard |
| `Change Status ▾` | Dropdown: SCHEDULED / BOARDING / DEPARTED / ARRIVED / DELAYED / CANCELLED → calls `PATCH /api/flights/:id/status` |
| `QR Feedback` | Generates QR code → URL: `/feedback?flightId=1` → downloadable PNG |

### 3D Aircraft
- Library: **Three.js**
- RAM-colored wireframe aircraft (Boeing 737-800 style)
- Seat dots on fuselage colored by status: red = occupied, green = available, **gold = selected passenger**
- Draggable rotation, scroll to zoom

---

## 6. Seat Map Page (`/seat-map`) — Scope Defined

**Full operational seat management tool.**

Features:
- Select aircraft from dropdown
- Generate seat layout (`POST /api/seats/generate`)
- Click seat → change status (AVAILABLE / OCCUPIED / UNAVAILABLE)
- Assign passenger to seat
- Delete + regenerate layout
- Full zoom, full scroll, all rows visible
- Search passenger → highlight seat (same as flight detail but full page)

---

## 7. Passengers Page (`/passengers`) — Scope Defined

**Full passenger manifest across all flights.**

Features:
- Table view of all passengers
- Filter by flight, by class, by nationality
- Search by name or passport number
- Click passenger → see full profile (seat, flight, passport, nationality, email)
- Expandable search (same animation pattern)

---

## 8. ML Feedback Module — Full Specification

### 8.1 Goal
Collect behavioral data from passengers via QR survey → calculate intent score → show personalized offer → feed ML model → predict optimal ticket prices and identify sales patterns.

### 8.2 New Services Required
| Service | Port | Tech | Role |
|---|---|---|---|
| feedback-service | 8086 | Spring Boot 3.2 | Store survey responses + calculate score |
| ml-service | 8087 | Python Flask + XGBoost | Train model nightly + expose predictions |

### 8.3 QR Code Flow
```
Dashboard → "QR Feedback" button on flight card
        ↓
Generates URL: /feedback?flightId=1&seat=5A&route=CMN-CDG
        ↓
Staff prints or displays QR at gate
        ↓
Passenger scans → survey opens on phone
        ↓
Flight data auto-filled from URL params (no typing)
        ↓
3 survey screens → submit → score calculated → offer shown
```

### 8.4 Survey — 4 Screens

**Screen 1 — Your Journey**
- Trip purpose: Business / Leisure / Family
- Travelling: Alone / With 1 person / Group
- Booked: Last minute / Few weeks ago / Months ahead
- Found via: RAM.ma / Google Flights / Agency / Other
- Flights per year: 1-2 / 3-5 / 6-10 / 10+
- Other airlines used: Air France / Ryanair / EasyJet / Transavia / Only RAM

**Screen 2 — Your Experience**
- Price paid: Under 100€ / 100-200€ / 200-400€ / 400€+
- Was it worth it: Great deal / Fair price / Too expensive
- Experience vs expectation: Better / As expected / Worse
- Comfort rating: ★★★★★ (1-5)
- Service rating: ★★★★★ (1-5)
- Would pay extra for: No layovers / Legroom / Bags / WiFi / Nothing

**Screen 3 — Your Next Trip**
- Return flight: Already booked / Not booked yet / No
- Next destination: [text input]
- When: This month / 1-3 months / 3-6 months / Not sure
- What decides booking: Lowest price / Best schedule / Loyalty / Direct flight
- Would switch for 50€ cheaper: Yes / Depends / No — I prefer RAM

**Screen 4 — Dynamic Offer** (generated from score)
- Score ≥ 70 → "Book your return [route] now — 15% off · 24h only"
- Score 40-70 → "Subscribe to RAM price alerts for [destination] — free"
- Score < 30 → "Thank you for flying RAM!" (no offer)

### 8.5 Intent Score Formula (Phase 1 — Rule-based)
```
return_intent:
  BOOKED   → +35 pts
  PLANNED  → +20 pts
  NO       → +0  pts

loyalty_sensitive:
  NO       → +25 pts
  DEPENDS  → +12 pts
  YES      → +0  pts

flights_per_year:
  10+      → +20 pts
  6-10     → +15 pts
  3-5      → +10 pts
  1-2      → +5  pts

experience_vs_expectation:
  BETTER       → +20 pts
  AS_EXPECTED  → +10 pts
  WORSE        → +0  pts

MAX SCORE = 100
```

### 8.6 Score Segments
| Score | Segment | Action |
|---|---|---|
| 71-100 | HIGH VALUE | Show return flight offer + 15% discount |
| 41-70 | POTENTIAL | Show price alert subscription |
| 0-30 | PRICE SENSITIVE | No offer — save data only |

### 8.7 Complete Data Schema (feedback_db)
```sql
-- Auto-filled from QR URL + flight-service
flight_id, seat_id, seat_class, route,
departure_hour, departure_day, departure_month, occupancy_pct

-- Screen 1
trip_purpose, companion_count, booking_window,
booking_channel, flights_per_year, competitor_used

-- Screen 2
price_paid_range, price_perception, experience_vs_expectation,
comfort_rating, service_rating,
wtp_no_layover, wtp_legroom, wtp_bags, wtp_wifi

-- Screen 3
return_intent, next_destination, next_travel_window,
booking_decision_factor, loyalty_sensitive

-- Calculated
purchase_intent_score (0-100)

-- Screen 4 tracking
offer_shown, offer_clicked (BOOLEAN)

-- Optional
incentive_email, submitted_at
```

### 8.8 Incentive for Passengers
- RAM loyalty member → 500 miles credited
- Non-member → 10% discount code on next booking

### 8.9 ML Model — XGBoost
| Phase | Trigger | Method | Output |
|---|---|---|---|
| Phase 1 | 0-999 responses | Rule-based score formula | Intent score 0-100 |
| Phase 2 | 1000+ responses | XGBoost trained on real data | Optimized score weights |
| Phase 3 | 5000+ responses | XGBoost + A/B testing | Real-time price multiplier |

**Target variables:**
- `price_multiplier` (float 0.8-1.5) — optimal price adjustment per route/class/month
- `offer_clicked` (boolean) — was the commercial offer accepted?
- `purchase_intent_score` (int 0-100)

**Nightly job:** runs at 02:00, reads `feedback_db`, trains model, stores predictions in `ml_predictions` table.

---

## 9. Analytics Page (`/analytics`) — Scope Defined

**4 bar charts + KPI cards**

| Chart | X Axis | Y Axis | Business Insight |
|---|---|---|---|
| Intent by trip purpose | BUSINESS / LEISURE / FAMILY | Average score | Business travelers = highest value |
| Intent by booking channel | RAM.ma / Google / Agency / Other | Average score | Direct channel = most loyal |
| Offer click rate by score | 0-30 / 31-50 / 51-70 / 71-100 | % clicked | Validates score → conversion |
| Price sensitivity by route | CMN→CDG / CMN→JFK / etc. | % price-sensitive | Identifies captive demand routes |

**KPI cards:**
- Total surveys completed
- Average response rate per flight
- Average intent score (global + by route)
- Offer conversion rate (%)
- Segment distribution (High Value / Potential / Price-sensitive)

---

## 10. Notifications — Triggers

All 4 triggers active:

| Trigger | Event | Channel |
|---|---|---|
| Flight status change | SCHEDULED → BOARDING / DELAYED / CANCELLED | Bell icon + email |
| Seat change | Seat marked UNAVAILABLE (maintenance) | Bell icon |
| Passenger assignment | Passenger assigned to seat | Bell icon |
| Occupancy threshold | Flight crosses 90% full | Bell icon + email |

---

## 11. AI Chatbot — Capabilities

Located in icon rail (robot icon `ti-robot`, red accent).
Opens as a slide-in panel from the right.

**Can do:**
- Search passengers by name → highlight in dashboard
- Search flights by number or route
- Navigate dashboard ("show me flight AT200")
- Answer questions about current data ("how many delayed flights?")
- Send email alerts to operations staff
- Query seat availability ("are there window seats on AT200?")

**Architecture:**
```
User types question
        ↓
/api/ai/query (new gateway route)
        ↓
ai-service calls Claude API (claude-sonnet-4-20250514)
with system prompt describing all API routes
        ↓
Claude returns: { endpoint, method, params }
        ↓
ai-service executes the real API call
        ↓
Returns conversational result to frontend
```

---

## 12. Build Order (Sprint Plan)

### Sprint 1 — Foundation
1. `src/data/airports.ts` — IATA coordinates
2. `src/types/index.ts` — updated types (Flight, Seat, Passenger, Feedback)
3. `src/lib/api.ts` — updated Axios config + new feedback endpoints
4. `AppShell.tsx` — icon rail + header + dark/light toggle
5. `Login.tsx` — white, modern, RAM corporate

### Sprint 2 — Dashboard
6. `GlobeMap.tsx` — react-globe.gl
7. `FlightCard.tsx` — card component
8. `FlightDrawer.tsx` — scrollable drawer + expandable search
9. `HoverPanel.tsx` — slide-in panel
10. `Dashboard.tsx` — main page assembly

### Sprint 3 — Flight Detail
11. `Aircraft3D.tsx` — Three.js plane with seat dots
12. `SeatMap.tsx` (mini) — read-only, passenger highlight
13. `PassengerList.tsx` — expandable search + click to highlight
14. `StatusChanger.tsx` — dropdown status update
15. `QrGenerator.tsx` — QR code for feedback URL
16. `FlightDetail.tsx` — page assembly

### Sprint 4 — Seat Map + Passengers Pages
17. `SeatMapPage.tsx` — full management tool
18. `PassengersPage.tsx` — full manifest table

### Sprint 5 — Feedback Survey
19. `Screen1.tsx` through `Screen4.tsx`
20. `Survey.tsx` — page with flight auto-fill from URL
21. `feedback-service` — Spring Boot :8086

### Sprint 6 — Analytics + ML
22. `Analytics.tsx` — 4 charts + KPIs
23. `ml-service` — Python Flask + XGBoost :8087

### Sprint 7 — AI + Notifications
24. `ChatBubble.tsx` — slide-in panel
25. `BellIcon.tsx` — dropdown with triggers
26. `ai-service` — Spring Boot calling Claude API

---

## 13. Current Status

| Page | Mockup | Spec (.md) | Code |
|---|---|---|---|
| Dashboard `/` | ✅ v3 finalized | ✅ DASHBOARD_SPEC.md | ⬜ |
| Flight Detail `/flights/:id` | ✅ v2 finalized | ⬜ | ⬜ |
| Seat Map `/seat-map` | ⬜ | ⬜ | ⬜ |
| Passengers `/passengers` | ⬜ | ⬜ | ⬜ |
| Analytics `/analytics` | ⬜ | ⬜ | ⬜ |
| Feedback `/feedback` | ⬜ | ⬜ | ⬜ |
| Login `/login` | ⬜ | ⬜ | ⬜ |
| Chat panel | ⬜ | ⬜ | ⬜ |
| ML feedback module | ✅ Spec doc | ✅ CabineIQ_Feedback_ML_Specification.docx | ⬜ |

---

## 14. Files Already Generated

| File | Location | Description |
|---|---|---|
| `DASHBOARD_SPEC.md` | outputs/ | Full dashboard page specification |
| `CabineIQ_Feedback_ML_Specification.docx` | outputs/ | Complete ML feedback module spec |
| `start.bat` | project root | Launch all 8 services |
| `stop.bat` | project root | Stop all services |

---

*CabineIQ — Royal Air Maroc — Session Resume Document*
*Last updated: Flight Detail page mockup v2 finalized*
