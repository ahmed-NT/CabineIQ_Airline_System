# AIRCRAFT SEAT CONFIGURATION & VISUALIZATION SYSTEM
## Royal Air Maroc — Internal Tool
### Project Context for AI Assistant

---

## 1. PROJECT OVERVIEW

This is an internal airline management dashboard built during an internship at **Royal Air Maroc**.

**Goal:** A centralized platform to:
- Configure aircraft seat layouts dynamically
- Visualize seat occupancy on a real-time seat map
- Locate passengers by name and highlight their seat
- Manage flights and see aircraft/seat information

---

## 2. ARCHITECTURE

```
Frontend (React) :3000
        ↓
API Gateway (Spring Cloud Gateway) :8080
        ↓
┌─────────────────────────────────────────┐
│  Aircraft  │  Seat  │ Passenger │ Flight │
│  :8081     │  :8082 │   :8083   │ :8084  │
└─────────────────────────────────────────┘
        ↓
Discovery Service (Eureka) :8761
        ↓
Each service has its own MySQL database
```

---

## 3. TECH STACK

### Backend
- Java 21
- Spring Boot 3.2.0
- Spring Cloud 2023.0.0
- Spring Cloud Gateway
- Netflix Eureka (Service Discovery)
- Spring Data JPA
- MySQL 8.0
- Lombok
- Maven (multi-module project)

### Frontend
- React (functional components)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios
- React Query (@tanstack/react-query)
- React Router

---

## 4. PROJECT STRUCTURE

```
airline-system/
├── frontend/                          # React app
│   ├── src/
│   │   ├── pages/
│   │   │   └── Index.tsx             # Main dashboard (3-column layout)
│   │   ├── components/dashboard/
│   │   │   ├── Header.tsx
│   │   │   ├── FlightsToolbar.tsx
│   │   │   ├── FlightsList.tsx       # Left panel - flight cards
│   │   │   ├── SeatMap.tsx           # Center panel - seat visualization
│   │   │   ├── WeatherWidget.tsx     # TO BE REMOVED
│   │   │   ├── FlightTimeline.tsx    # Right panel - keep
│   │   │   ├── FuelConsumption.tsx   # TO BE REMOVED
│   │   │   └── MaintenanceWidget.tsx # TO BE REMOVED
│   │   └── App.tsx
│   └── package.json
│
└── backend/
    ├── pom.xml                        # Maven parent POM
    ├── discovery-service/             # Eureka Server :8761
    ├── api-gateway/                   # Spring Cloud Gateway :8080
    ├── aircraft-service/              # :8081 — aircraft_db
    ├── seat-service/                  # :8082 — seat_db
    ├── passenger-service/             # :8083 — passenger_db
    └── flight-service/                # :8084 — flight_db
```

---

## 5. SERVICES & APIs

### Aircraft Service — Port 8081 — DB: aircraft_db
```
POST   /api/aircraft              → create aircraft
GET    /api/aircraft              → list all
GET    /api/aircraft/{id}         → get by id
GET    /api/aircraft/code/{code}  → get by code
PUT    /api/aircraft/{id}         → update
DELETE /api/aircraft/{id}         → delete
```

### Seat Service — Port 8082 — DB: seat_db
```
POST   /api/seats/generate              → generate seats for aircraft
GET    /api/seats/aircraft/{aircraftId} → get seat map
GET    /api/seats/{id}                  → get single seat
PUT    /api/seats/{seatId}/status       → update seat status
DELETE /api/seats/aircraft/{aircraftId} → delete all seats
```

### Passenger Service — Port 8083 — DB: passenger_db
```
GET    /api/passengers                    → list all
POST   /api/passengers                    → create
GET    /api/passengers/{id}               → get by id
GET    /api/passengers/search?name=       → search by name
GET    /api/passengers/flight/{flightId}  → by flight
PUT    /api/passengers/{id}/assign-seat   → assign seat
```

### Flight Service — Port 8084 — DB: flight_db
```
GET    /api/flights              → list all
POST   /api/flights              → create
GET    /api/flights/{id}         → get by id
PUT    /api/flights/{id}/status  → update status
```

### API Gateway — Port 8080
```
/api/aircraft/**   → routes to aircraft-service
/api/seats/**      → routes to seat-service
/api/passengers/** → routes to passenger-service
/api/flights/**    → routes to flight-service
```

---

## 6. DATA MODELS

### Aircraft Entity
```java
- id: Long (PK, auto)
- aircraftCode: String (unique) e.g. "AT-B737-01"
- model: String e.g. "Boeing 737-800"
- registration: String (unique) e.g. "CN-RNV"
- totalRows: Integer
- seatsPerRow: Integer
- totalSeats: Integer
- status: Enum → ACTIVE, MAINTENANCE, RETIRED
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

### Seat Entity
```java
- id: Long (PK, auto)
- seatId: String e.g. "12A"
- aircraftId: Long (FK)
- rowNumber: Integer
- seatLetter: String e.g. "A"
- seatClass: Enum → FIRST, BUSINESS, ECONOMY
- status: Enum → AVAILABLE, OCCUPIED, UNAVAILABLE
- passengerId: Long (nullable)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

### Passenger Entity (TO BE BUILT)
```java
- id: Long (PK, auto)
- firstName: String
- lastName: String
- email: String
- passportNumber: String (unique)
- nationality: String
- flightId: Long
- seatId: String
- aircraftId: Long
- createdAt: LocalDateTime
```

### Flight Entity (TO BE BUILT)
```java
- id: Long (PK, auto)
- flightNumber: String (unique) e.g. "AT 200"
- origin: String (IATA code) e.g. "CMN"
- destination: String (IATA code) e.g. "CDG"
- departureTime: LocalDateTime
- arrivalTime: LocalDateTime
- status: Enum → SCHEDULED, BOARDING, DEPARTED, ARRIVED, DELAYED, CANCELLED
- aircraftId: Long
- gate: String
- createdAt: LocalDateTime
```

---

## 7. CRITICAL SEAT MAP JSON STRUCTURE

The seat map API must return this exact structure:
```json
{
  "aircraftId": 1,
  "aircraftCode": "AT-B737-01",
  "rows": [
    {
      "rowNumber": 1,
      "seatClass": "FIRST",
      "seats": [
        { "seatId": "1A", "status": "AVAILABLE", "type": null },
        { "seatId": "1B", "status": "AVAILABLE", "type": null },
        { "seatId": "1C", "status": "AVAILABLE", "type": null },
        { "seatId": null, "status": null, "type": "AISLE" },
        { "seatId": "1D", "status": "AVAILABLE", "type": null },
        { "seatId": "1E", "status": "AVAILABLE", "type": null },
        { "seatId": "1F", "status": "AVAILABLE", "type": null }
      ]
    }
  ]
}
```

### Seat Class Distribution
```
Rows 1-2:  FIRST CLASS
Rows 3-6:  BUSINESS CLASS
Rows 7+:   ECONOMY CLASS
```

### Layout Types
```
NARROW → A B C | AISLE | D E F  (6 seats per row)
WIDE   → A B C | AISLE | D E F G H (8 seats per row)
```

### Seat Status Colors (Frontend)
```
AVAILABLE   → Green  #4CAF82
OCCUPIED    → Red    #C41E3A
UNAVAILABLE → Gray   #9E9E9E
HIGHLIGHTED → Gold   #C9A84C (passenger search result)
```

---

## 8. FRONTEND DESIGN — ROYAL AIR MAROC THEME

### Brand Colors
```
Primary Red   → #C41E3A
Deep Green    → #006233
Gold          → #C9A84C
Dark Navy     → #1A1A2E
Off White     → #F8F6F1 (background)
```

### Dashboard Layout (3 columns)
```
┌──────────────┬───────────────────────┬──────────────────┐
│  col-span-3  │      col-span-5       │   col-span-4     │
│              │                       │                  │
│ Flight List  │   Seat Map (center)   │ Passenger Search │
│              │                       │ Passenger Info   │
│ - Flight     │ - Aircraft nose/tail  │ Flight Details   │
│   cards      │ - Dynamic seat rows   │                  │
│ - Status     │ - Click seat →        │                  │
│   badges     │   show passenger      │                  │
│              │ - Search highlight    │                  │
└──────────────┴───────────────────────┴──────────────────┘
```

### Components to KEEP from Lovable
```
✅ Header.tsx
✅ FlightsToolbar.tsx
✅ FlightsList.tsx (connect to real API)
✅ SeatMap.tsx (make dynamic)
✅ FlightTimeline.tsx
```

### Components to REMOVE
```
❌ WeatherWidget.tsx
❌ FuelConsumption.tsx
❌ MaintenanceWidget.tsx
```

### Components to ADD
```
✅ PassengerSearch.tsx  - search by name, highlight seat
✅ PassengerInfo.tsx    - show name, seat, class, passport
✅ FlightDetails.tsx    - route, gate, aircraft model
```

---

## 9. CURRENT PROGRESS STATUS

### ✅ COMPLETED
- [x] Maven parent POM (Java 21, Spring Boot 3.2.0)
- [x] Discovery Service (Eureka :8761)
- [x] API Gateway (:8080) with CORS for localhost:3000
- [x] Aircraft Service (:8081) — full CRUD
- [x] Seat Service (:8082) — seat map generation
- [x] Passenger Service (:8083) — application shell created
- [x] Flight Service (:8084) — application shell created
- [x] All 4 MySQL databases created
- [x] All services build successfully
- [x] spring-boot-maven-plugin added to all services

### ⬜ IN PROGRESS / PENDING
- [ ] Fix spring-boot-maven-plugin inheritance issue
  → Need to change pluginManagement → plugins in parent pom.xml
  → OR add <version>3.2.0</version> to each child pom.xml plugin
- [ ] Build full Passenger Service logic
  (Entity, Repository, Service, Controller, DTOs)
- [ ] Build full Flight Service logic
  (Entity, Repository, Service, Controller, DTOs)
- [ ] Test all APIs in Postman
- [ ] Connect Frontend to Backend APIs
- [ ] Replace hardcoded data in SeatMap.tsx with API calls
- [ ] Replace hardcoded data in FlightsList.tsx with API calls
- [ ] Add PassengerSearch component
- [ ] Add PassengerInfo component
- [ ] Apply Royal Air Maroc theme

---

## 10. KNOWN ISSUES & FIXES

### Issue 1 — spring-boot-maven-plugin not found
```
Error: No plugin found for prefix 'spring-boot'
Fix: In backend/pom.xml change <pluginManagement> to <plugins>
     OR add <version>3.2.0</version> to each child pom.xml
```

### Issue 2 — Java version mismatch
```
Error: compiler compliance 17 but JRE 21
Fix: Set java.version=21 in parent pom.xml (already done)
```

### Issue 3 — EnableEurekaClient not found
```
Error: cannot find symbol EnableEurekaClient
Fix: Remove @EnableEurekaClient annotation (not needed in Spring Cloud 2023)
     Keep only @SpringBootApplication
```

### Issue 4 — Port already in use
```
Error: Port 8761 already in use
Fix: taskkill /F /IM java.exe
     Then restart services in order
```

---

## 11. STARTUP PROCEDURE

```powershell
# Step 1 — Kill all Java processes
taskkill /F /IM java.exe

# Step 2 — Only if code changed, run from parent:
cd c:\Users\AHMED\.cursor\projects\airline-system\backend
mvn clean install -DskipTests

# Step 3 — Start services in order (separate terminals)
# Terminal 1
cd backend\discovery-service && mvn spring-boot:run

# Terminal 2
cd backend\aircraft-service && mvn spring-boot:run

# Terminal 3
cd backend\seat-service && mvn spring-boot:run

# Terminal 4
cd backend\passenger-service && mvn spring-boot:run

# Terminal 5
cd backend\flight-service && mvn spring-boot:run

# Terminal 6
cd backend\api-gateway && mvn spring-boot:run

# Step 4 — Verify
# Open http://localhost:8761 → should show 5 services
```

---

## 12. NEXT STEPS (IN ORDER)

1. Fix plugin issue in parent pom.xml
2. Verify all 5 services appear in Eureka
3. Test Aircraft + Seat APIs in Postman
4. Build Passenger Service full logic
5. Build Flight Service full logic
6. Connect Frontend to Backend
7. Apply Royal Air Maroc theme
8. Add passenger search feature
