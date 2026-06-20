# 🏗️ ARCHITECTURE — Royal Air Maroc Airline System (CabineIQ)

> **Last updated:** June 2026 &nbsp;|&nbsp; **Status:** Active development

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Repository Layout](#3-repository-layout)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture — `frontend-new`](#5-frontend-architecture--frontend-new)
6. [End-to-End Data Flows](#6-end-to-end-data-flows)
7. [Configuration & Environment](#7-configuration--environment)
8. [Local Development](#8-local-development)
9. [Design Notes & Known Constraints](#9-design-notes--known-constraints)

---

## 1. Overview

| | |
|---|---|
| **Project** | Royal Air Maroc Airline System — *CabineIQ* |
| **Purpose** | Internal airline operations platform: flights, aircraft, seats, passengers, feedback analytics, AI copilot, notifications |
| **Backend** | Java 21 · Spring Boot 3.2 · Spring Cloud 2023 (Microservices) |
| **ML Service** | Python Flask · XGBoost · scikit-learn |
| **Frontend** | React 19 · TypeScript · Vite 8 · Tailwind CSS |
| **Database** | MySQL 8 (database-per-service pattern) |
| **Discovery** | Netflix Eureka |
| **Entry Point** | API Gateway → port `8080` |

---

## 2. System Architecture Diagram

### 2.1 High-Level System Topology

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer"]
        BROWSER["Browser<br/>React SPA :3000"]
    end

    subgraph GATEWAY_LAYER["🔐 API Gateway Layer"]
        GW["API Gateway<br/>:8080<br/>JWT Filter · CORS · Routing"]
    end

    subgraph DISCOVERY["📡 Service Discovery"]
        EUREKA["Eureka Server<br/>:8761"]
    end

    subgraph CORE_SERVICES["⚙️ Core Business Services"]
        AUTH["Auth Service<br/>:8085<br/>auth_db"]
        FLIGHT["Flight Service<br/>:8084<br/>flight_db"]
        AIRCRAFT["Aircraft Service<br/>:8081<br/>aircraft_db"]
        SEAT["Seat Service<br/>:8082<br/>seat_db"]
        PASSENGER["Passenger Service<br/>:8083<br/>passenger_db"]
    end

    subgraph ANALYTICS_SERVICES["📊 Analytics & Intelligence"]
        FEEDBACK["Feedback Service<br/>:8086<br/>feedback_db"]
        ML["ML Service · Flask<br/>:8087<br/>reads feedback_db"]
        AI["AI Service<br/>:8088<br/>Claude API"]
    end

    subgraph SUPPORT_SERVICES["🔔 Support Services"]
        NOTIF["Notification Service<br/>:8089<br/>notification_db"]
    end

    subgraph EXTERNAL["☁️ External"]
        CLAUDE["Anthropic Claude API"]
        MYSQL[("MySQL 8<br/>localhost:3306")]
    end

    BROWSER -->|"/api proxy"| GW
    BROWSER -->|"Direct HTTP"| ML

    GW -->|"lb://auth-service"| AUTH
    GW -->|"lb://flight-service"| FLIGHT
    GW -->|"lb://aircraft-service"| AIRCRAFT
    GW -->|"lb://seat-service"| SEAT
    GW -->|"lb://passenger-service"| PASSENGER
    GW -->|"lb://feedback-service"| FEEDBACK
    GW -->|"http://localhost:8087"| ML
    GW -->|"lb://ai-service"| AI
    GW -->|"lb://notification-service"| NOTIF

    AUTH --> EUREKA
    FLIGHT --> EUREKA
    AIRCRAFT --> EUREKA
    SEAT --> EUREKA
    PASSENGER --> EUREKA
    FEEDBACK --> EUREKA
    AI --> EUREKA
    NOTIF --> EUREKA
    GW --> EUREKA

    AI -->|"WebClient"| CLAUDE
    AI -->|"WebClient → Gateway"| GW

    PASSENGER -->|"RestTemplate<br/>localhost:8082"| SEAT

    AUTH --> MYSQL
    FLIGHT --> MYSQL
    AIRCRAFT --> MYSQL
    SEAT --> MYSQL
    PASSENGER --> MYSQL
    FEEDBACK --> MYSQL
    NOTIF --> MYSQL
    ML -->|"SQLAlchemy"| MYSQL

    style CLIENT fill:#1e3a5f,stroke:#38bdf8,color:#fff
    style GATEWAY_LAYER fill:#0d2a1a,stroke:#4ade80,color:#fff
    style DISCOVERY fill:#2d1b4e,stroke:#a78bfa,color:#fff
    style CORE_SERVICES fill:#1a1a2e,stroke:#C41E3A,color:#fff
    style ANALYTICS_SERVICES fill:#1a2e1a,stroke:#C9A84C,color:#fff
    style SUPPORT_SERVICES fill:#2e1a1a,stroke:#fbbf24,color:#fff
    style EXTERNAL fill:#0a0a0a,stroke:#666,color:#fff
```

### 2.2 Gateway Routing Map

```mermaid
graph LR
    GW["API Gateway :8080"]

    subgraph ROUTES["Route Mappings"]
        R1["/api/auth/**"]
        R2["/api/aircraft/**"]
        R3["/api/seats/**"]
        R4["/api/passengers/**"]
        R5["/api/flights/**"]
        R6["/api/feedback/**"]
        R7["/api/ml/**"]
        R8["/api/ai/**"]
        R9["/api/notifications/**"]
    end

    subgraph TARGETS["Target Services"]
        T1["auth-service :8085"]
        T2["aircraft-service :8081"]
        T3["seat-service :8082"]
        T4["passenger-service :8083"]
        T5["flight-service :8084"]
        T6["feedback-service :8086"]
        T7["ML Service :8087"]
        T8["ai-service :8088"]
        T9["notification-service :8089"]
    end

    GW --> R1 --> T1
    GW --> R2 --> T2
    GW --> R3 --> T3
    GW --> R4 --> T4
    GW --> R5 --> T5
    GW --> R6 --> T6
    GW --> R7 -->|"RewritePath"| T7
    GW --> R8 -->|"RewritePath"| T8
    GW --> R9 -->|"RewritePath"| T9

    style GW fill:#0d2a1a,stroke:#4ade80,color:#fff
    style ROUTES fill:#1a1a2e,stroke:#C41E3A,color:#fff
    style TARGETS fill:#1e3a5f,stroke:#38bdf8,color:#fff
```

---

## 3. Repository Layout

```
airline-system/
├── backend/                          # Maven multi-module microservices
│   ├── pom.xml                       # Parent POM
│   ├── discovery-service/            # Eureka Server
│   ├── api-gateway/                  # Spring Cloud Gateway + JWT filter
│   ├── auth-service/                 # Authentication & JWT issuance
│   ├── aircraft-service/             # Aircraft CRUD
│   ├── seat-service/                 # Seat map generation & status
│   ├── passenger-service/            # Passenger CRUD & seat assignment
│   ├── flight-service/               # Flight CRUD & status management
│   ├── feedback-service/             # Passenger feedback & analytics
│   ├── ai-service/                   # Claude-powered AI copilot
│   ├── notification-service/         # In-app notifications
│   └── ml-service/                   # Python Flask (NOT in Maven parent)
│       ├── app.py                    # Flask API server (:8087)
│       ├── train.py                  # XGBoost nightly training
│       └── requirements.txt
├── frontend-new/                     # React SPA — CabineIQ UI
│   ├── src/
│   │   ├── App.tsx                   # Router + QueryClientProvider
│   │   ├── lib/api.ts                # Axios clients + 9 API modules
│   │   ├── hooks/                    # useAuth, useTheme
│   │   ├── types/index.ts            # Shared TypeScript interfaces
│   │   ├── data/airports.ts          # Static coords for 3D globe
│   │   ├── pages/                    # 9 route-level screens
│   │   └── components/               # 8 feature directories
│   └── vite.config.ts
├── start.bat                         # Orchestrates all services
└── stop.bat                          # Kills all services
```

### 3.1 Component Dependency Graph

```mermaid
graph TD
    subgraph INFRA["Infrastructure Layer"]
        EUREKA["discovery-service"]
        GATEWAY["api-gateway"]
    end

    subgraph BUSINESS["Business Layer"]
        AUTH["auth-service"]
        FLIGHT["flight-service"]
        AIRCRAFT["aircraft-service"]
        SEAT["seat-service"]
        PASSENGER["passenger-service"]
        FEEDBACK["feedback-service"]
        NOTIF["notification-service"]
    end

    subgraph INTELLIGENCE["Intelligence Layer"]
        AI["ai-service"]
        ML["ml-service"]
    end

    subgraph PRESENTATION["Presentation Layer"]
        FE["frontend-new"]
    end

    GATEWAY --> EUREKA
    AUTH --> EUREKA
    FLIGHT --> EUREKA
    AIRCRAFT --> EUREKA
    SEAT --> EUREKA
    PASSENGER --> EUREKA
    FEEDBACK --> EUREKA
    NOTIF --> EUREKA
    AI --> EUREKA

    PASSENGER -.->|"RestTemplate"| SEAT
    AI -.->|"WebClient"| GATEWAY
    ML -.->|"SQLAlchemy"| FEEDBACK

    FE -->|"Vite proxy /api"| GATEWAY
    FE -->|"Direct HTTP"| ML

    style INFRA fill:#2d1b4e,stroke:#a78bfa,color:#fff
    style BUSINESS fill:#1a1a2e,stroke:#C41E3A,color:#fff
    style INTELLIGENCE fill:#1a2e1a,stroke:#C9A84C,color:#fff
    style PRESENTATION fill:#1e3a5f,stroke:#38bdf8,color:#fff
```

---

## 4. Backend Architecture

**Pattern:** Microservices with database-per-service, Eureka service discovery, and a single Spring Cloud API Gateway.

### 4.1 Service Registry

| Service | Port | Database | Spring Boot App | Responsibility |
|---------|------|----------|-----------------|----------------|
| Discovery (Eureka) | `8761` | — | `DiscoveryServiceApplication` | Service registry & health dashboard |
| API Gateway | `8080` | — | `ApiGatewayApplication` | Routing, JWT enforcement, CORS, path rewriting |
| Auth | `8085` | `auth_db` | `AuthServiceApplication` | Register, login, JWT issuance (HMAC-SHA) |
| Aircraft | `8081` | `aircraft_db` | `AircraftServiceApplication` | Aircraft CRUD, status tracking |
| Seat | `8082` | `seat_db` | `SeatServiceApplication` | Seat map generation, seat status management |
| Passenger | `8083` | `passenger_db` | `PassengerServiceApplication` | Passenger CRUD, seat assignment (cross-service) |
| Flight | `8084` | `flight_db` | `FlightServiceApplication` | Flight CRUD, status transitions |
| Feedback | `8086` | `feedback_db` | `FeedbackServiceApplication` | Passenger feedback intake & analytics aggregation |
| AI | `8088` | — | `AiServiceApplication` | Claude-powered NL query → internal API calls |
| Notification | `8089` | `notification_db` | `NotificationServiceApplication` | In-app notification CRUD & read tracking |
| ML (Flask) | `8087` | reads `feedback_db` | `app.py` | Sentiment/intent predictions, XGBoost training |

### 4.2 Per-Service Internal Architecture

```mermaid
graph LR
    subgraph SERVICE["Spring Boot Microservice"]
        CTRL["controller/"] --> SVC["service/"]
        SVC --> REPO["repository/"]
        REPO --> ENTITY["entity/"]
        DTO["dto/"] -.-> CTRL
        DTO -.-> SVC
        CONFIG["config/"] -.-> SVC
        EXCEPTION["exception/"] -.-> CTRL
    end

    REPO -->|"JPA"| DB[("MySQL")]

    style SERVICE fill:#1a1a2e,stroke:#C41E3A,color:#fff
    style DB fill:#0a0a0a,stroke:#666,color:#fff
```

**Standard layers per service:**
`controller/` → `service/` → `repository/` → `entity/` + `dto/`, optional `config/`, `exception/`

### 4.3 Authentication & Authorization Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend<br/>React SPA
    participant GW as API Gateway<br/>:8080
    participant JWT as JwtAuthFilter
    participant AUTH as Auth Service<br/>:8085
    participant DB as auth_db

    Note over User,DB: === Registration / Login ===
    User->>FE: Enter credentials
    FE->>GW: POST /api/auth/login
    GW->>JWT: Check path
    JWT-->>GW: /api/auth/** → SKIP filter
    GW->>AUTH: Forward to auth-service
    AUTH->>DB: Verify username + bcrypt password
    DB-->>AUTH: User entity
    AUTH->>AUTH: JwtService.generateToken(username, role)
    AUTH-->>GW: {token, username, role, message}
    GW-->>FE: JWT response
    FE->>FE: localStorage.setItem(ram_token, ram_username, ram_role)

    Note over User,DB: === Protected API Call ===
    User->>FE: Navigate to /flights
    FE->>GW: GET /api/flights<br/>Authorization: Bearer {token}
    GW->>JWT: Validate token
    JWT->>JWT: Jwts.parser().verifyWith(HMAC-SHA key)
    JWT-->>GW: ✅ Valid → chain.filter()
    GW->>AUTH: Route to flight-service (via Eureka)

    Note over User,DB: === Unauthorized ===
    FE->>GW: GET /api/flights (expired/missing token)
    GW->>JWT: Validate token
    JWT-->>GW: ❌ 401 UNAUTHORIZED
    GW-->>FE: 401
    FE->>FE: Clear localStorage → redirect /login
```

### 4.4 Inter-Service Communication

```mermaid
graph LR
    subgraph SYNC["Synchronous Communication"]
        PASS["Passenger<br/>Service :8083"]
        SEAT_SVC["Seat<br/>Service :8082"]
        AI_SVC["AI<br/>Service :8088"]
        GW_SVC["API Gateway<br/>:8080"]
        CLAUDE_API["Anthropic<br/>Claude API"]
        ML_SVC["ML Service<br/>(Flask) :8087"]
        FB_DB[("feedback_db")]
    end

    PASS -->|"RestTemplate<br/>PUT /api/seats/{id}/status<br/>localhost:8082"| SEAT_SVC
    AI_SVC -->|"WebClient<br/>GET /api/flights, etc."| GW_SVC
    AI_SVC -->|"WebClient<br/>POST messages"| CLAUDE_API
    ML_SVC -->|"SQLAlchemy<br/>SELECT FROM feedback"| FB_DB

    style SYNC fill:#1a1a2e,stroke:#C41E3A,color:#fff
```

### 4.5 Database-Per-Service Schema

```mermaid
erDiagram
    AUTH_DB {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        enum role "ADMIN | USER"
        timestamp created_at
    }

    FLIGHT_DB {
        bigint id PK
        varchar flight_number
        varchar origin
        varchar destination
        datetime departure_time
        datetime arrival_time
        enum status "SCHEDULED | BOARDING | DEPARTED | ARRIVED | DELAYED | CANCELLED"
        bigint aircraft_id FK
        varchar gate
        timestamp created_at
    }

    AIRCRAFT_DB {
        bigint id PK
        varchar aircraft_code
        varchar model
        varchar registration
        int total_rows
        int seats_per_row
        int total_seats
        enum status "ACTIVE | MAINTENANCE | RETIRED"
    }

    SEAT_DB {
        varchar seat_id PK
        bigint aircraft_id PK
        enum status "AVAILABLE | OCCUPIED | UNAVAILABLE"
        enum seat_class "FIRST | BUSINESS | ECONOMY"
        int row_number
    }

    PASSENGER_DB {
        bigint id PK
        varchar first_name
        varchar last_name
        varchar email
        varchar passport_number UK
        varchar nationality
        bigint flight_id FK
        varchar seat_id FK
        bigint aircraft_id FK
        timestamp created_at
    }

    FEEDBACK_DB {
        bigint id PK
        bigint flight_id FK
        varchar seat_id
        varchar seat_class
        varchar route
        varchar trip_purpose
        float purchase_intent_score
        varchar offer_shown
        boolean offer_clicked
        timestamp submitted_at
    }

    NOTIFICATION_DB {
        varchar id PK
        enum type "FLIGHT_STATUS | SEAT_UNAVAILABLE | PASSENGER_ASSIGNED | HIGH_OCCUPANCY"
        varchar title
        text body
        boolean is_read
        bigint flight_id FK
        timestamp created_at
    }

    FLIGHT_DB ||--o{ PASSENGER_DB : "passengers"
    AIRCRAFT_DB ||--o{ SEAT_DB : "seats"
    AIRCRAFT_DB ||--o{ FLIGHT_DB : "aircraft"
    FLIGHT_DB ||--o{ FEEDBACK_DB : "feedback"
    FLIGHT_DB ||--o{ NOTIFICATION_DB : "notifications"
```

---

## 5. Frontend Architecture — `frontend-new`

**App name:** CabineIQ — Royal Air Maroc operations UI

### 5.1 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| UI Framework | React + TypeScript | 19.x |
| Build Tool | Vite | 8.x |
| Dev Server Port | — | `:3000` |
| Routing | React Router | v7 (nested) |
| Server State | TanStack React Query | v5 |
| HTTP Client | Axios | latest |
| Styling | Tailwind CSS + Radix UI | 3.x |
| 3D Globe | react-globe.gl | latest |
| Charts | Recharts | latest |
| Icons | react-icons (Tabler) + @tabler/icons-react | latest |

### 5.2 Component Architecture

```mermaid
graph TD
    subgraph APP["App.tsx"]
        QCP["QueryClientProvider"]
        ROUTER["BrowserRouter"]
    end

    subgraph PUBLIC_ROUTES["Public Routes"]
        LOGIN["/login → Login.tsx"]
        FBPAGE["/feedback → FeedbackPage.tsx"]
    end

    subgraph PROTECTED["ProtectedRoute"]
        SHELL["AppShell"]
    end

    subgraph SHELL_LAYOUT["AppShell Layout"]
        TOPBAR["Top Bar<br/>Logo · Stats · LIVE · Bell · User · Theme"]
        RAIL["Icon Rail Nav<br/>Dashboard · Flights · Seat Map · Passengers · Analytics · Feedback · AI"]
        OUTLET["&lt;Outlet /&gt;"]
        CHAT["ChatPanel<br/>AI Copilot Overlay"]
        NOTIF_DROP["NotificationDropdown"]
    end

    subgraph PAGES["Pages"]
        DASH["/ → Dashboard.tsx<br/>3D Globe · FlightCards"]
        FLIGHTS["/flights → FlightsPage.tsx"]
        DETAIL["/flights/:id → FlightDetail.tsx<br/>Aircraft3D · SeatMapMini · PassengerList"]
        SEATMAP["/seat-map → SeatMapPage.tsx<br/>Interactive Seat Map"]
        PASSENGERS["/passengers → PassengersPage.tsx<br/>CRUD · ProfilePanel"]
        ANALYTICS["/analytics → AnalyticsPage.tsx<br/>KPI Cards · Charts · ML Table"]
    end

    QCP --> ROUTER
    ROUTER --> PUBLIC_ROUTES
    ROUTER --> PROTECTED
    PROTECTED --> SHELL
    SHELL --> SHELL_LAYOUT
    TOPBAR --> NOTIF_DROP
    SHELL --> CHAT
    OUTLET --> PAGES

    style APP fill:#1e3a5f,stroke:#38bdf8,color:#fff
    style PUBLIC_ROUTES fill:#2e1a1a,stroke:#fbbf24,color:#fff
    style PROTECTED fill:#0d2a1a,stroke:#4ade80,color:#fff
    style SHELL_LAYOUT fill:#1a1a2e,stroke:#C41E3A,color:#fff
    style PAGES fill:#1a2e1a,stroke:#C9A84C,color:#fff
```

### 5.3 Frontend Routing Table

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/login` | `Login.tsx` | 🌐 Public | Username/password → JWT auth |
| `/feedback` | `FeedbackPage.tsx` | 🌐 Public | Passenger feedback survey form |
| `/` | `Dashboard.tsx` | 🔒 Protected | 3D globe with flight arcs, FlightCards, HoverPanel |
| `/flights` | `FlightsPage.tsx` | 🔒 Protected | Flight list with status badges |
| `/flights/:id` | `FlightDetail.tsx` | 🔒 Protected | Aircraft3D model, SeatMapMini, passenger list, QR, status changer |
| `/seat-map` | `SeatMapPage.tsx` | 🔒 Protected | Full interactive seat map per aircraft |
| `/passengers` | `PassengersPage.tsx` | 🔒 Protected | Passenger CRUD, search, seat assignment, profile panel |
| `/analytics` | `AnalyticsPage.tsx` | 🔒 Protected | KPI cards, 4 Recharts, ML predictions table |
| `*` | `NotFound.tsx` | 🌐 Public | 404 fallback |

### 5.4 State Management Architecture

```mermaid
graph TD
    subgraph LOCAL_STORAGE["localStorage"]
        TOKEN["ram_token"]
        USER["ram_username"]
        ROLE["ram_role"]
        THEME["theme"]
    end

    subgraph HOOKS["Custom Hooks"]
        USE_AUTH["useAuth()"]
        USE_THEME["useTheme()"]
    end

    subgraph REACT_QUERY["TanStack React Query"]
        QC["QueryClient<br/>retry: 1 · staleTime: 30s"]
        K1["'flights'"]
        K2["'feedback-analytics'"]
        K3["'ml-predictions'"]
        K4["'notifications'"]
        K5["'passengers'"]
    end

    TOKEN --> USE_AUTH
    USER --> USE_AUTH
    ROLE --> USE_AUTH
    THEME --> USE_THEME

    USE_AUTH -->|"isAuthenticated<br/>isAdmin<br/>logout<br/>setAuth"| COMPONENTS["Components"]
    USE_THEME -->|"isDark<br/>toggle"| COMPONENTS

    QC --> K1
    QC --> K2
    QC --> K3
    QC --> K4
    QC --> K5

    K1 -->|"refetchInterval: 60s"| COMPONENTS
    K2 -->|"refetchInterval: 60s"| COMPONENTS
    K3 -->|"refetchInterval: 60s"| COMPONENTS

    style LOCAL_STORAGE fill:#2d1b4e,stroke:#a78bfa,color:#fff
    style HOOKS fill:#1a2e1a,stroke:#C9A84C,color:#fff
    style REACT_QUERY fill:#1e3a5f,stroke:#38bdf8,color:#fff
```

### 5.5 API Integration Layer

```mermaid
graph LR
    subgraph BROWSER["Browser"]
        API_TS["lib/api.ts"]
    end

    subgraph AXIOS["Axios Clients"]
        MAIN["api<br/>baseURL: /api"]
        ML_CLIENT["mlClient<br/>baseURL: localhost:8087"]
    end

    subgraph INTERCEPTORS["Interceptors"]
        REQ["Request:<br/>Attach Bearer token"]
        RES["Response:<br/>401 → clear auth → /login"]
    end

    subgraph MODULES["Exported API Modules"]
        A1["authAPI<br/>login · register"]
        A2["flightsAPI<br/>getAll · getById · updateStatus · create · delete"]
        A3["aircraftAPI<br/>getAll · getById · create"]
        A4["seatsAPI<br/>getSeatMap · generateSeats · updateStatus"]
        A5["passengersAPI<br/>getAll · getById · searchByName · getByFlight · assignSeat · delete"]
        A6["feedbackAPI<br/>submit · getByFlight · getAnalytics"]
        A7["aiAPI<br/>query"]
        A8["notificationsAPI<br/>getAll · markAllRead · markRead"]
        A9["mlAPI<br/>getPredictions · getHealth"]
    end

    API_TS --> MAIN
    API_TS --> ML_CLIENT
    MAIN --> REQ --> RES
    MAIN --> A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8
    ML_CLIENT --> A9

    MAIN -->|"Vite proxy<br/>/api → localhost:8080"| GW["API Gateway :8080"]
    ML_CLIENT -->|"Direct HTTP"| ML["ML Service :8087"]

    style BROWSER fill:#1e3a5f,stroke:#38bdf8,color:#fff
    style AXIOS fill:#1a1a2e,stroke:#C41E3A,color:#fff
    style INTERCEPTORS fill:#2e1a1a,stroke:#fbbf24,color:#fff
    style MODULES fill:#1a2e1a,stroke:#C9A84C,color:#fff
```

---

## 6. End-to-End Data Flows

### 6.1 Login & Protected Access

```mermaid
sequenceDiagram
    actor User
    participant Login as Login.tsx
    participant AuthAPI as authAPI
    participant Proxy as Vite Proxy
    participant GW as API Gateway :8080
    participant JwtFilter as JwtAuthFilter
    participant Auth as auth-service :8085
    participant JwtSvc as JwtService
    participant DB as auth_db

    User->>Login: Enter username + password
    Login->>AuthAPI: authAPI.login(username, password)
    AuthAPI->>Proxy: POST /api/auth/login
    Proxy->>GW: Forward to localhost:8080
    GW->>JwtFilter: Intercept request
    JwtFilter->>JwtFilter: isPublicPath("/api/auth/login") → true
    JwtFilter-->>GW: Skip JWT validation
    GW->>Auth: lb://auth-service → POST /api/auth/login
    Auth->>DB: SELECT * FROM users WHERE username = ?
    DB-->>Auth: User entity (hashed password)
    Auth->>Auth: BCrypt.matches(plain, hashed) ✅
    Auth->>JwtSvc: generateToken(username, role)
    JwtSvc->>JwtSvc: Jwts.builder()<br/>.claims({role})<br/>.subject(username)<br/>.expiration(24h)<br/>.signWith(HMAC-SHA)
    JwtSvc-->>Auth: JWT string
    Auth-->>GW: {token, username, role, "Login successful"}
    GW-->>Proxy: 200 OK
    Proxy-->>AuthAPI: Response
    AuthAPI-->>Login: Response data
    Login->>Login: useAuth().setAuth(token, username, role)<br/>→ localStorage
    Login->>User: Navigate to "/" (Dashboard)

    Note over User,DB: Subsequent requests include Bearer token
    User->>GW: GET /api/flights (Authorization: Bearer {JWT})
    GW->>JwtFilter: Validate JWT
    JwtFilter->>JwtFilter: parseSignedClaims(token) ✅
    JwtFilter-->>GW: chain.filter() → route to flight-service
```

### 6.2 Seat Assignment (Cross-Service)

```mermaid
sequenceDiagram
    actor Staff
    participant Page as PassengersPage.tsx
    participant API as passengersAPI
    participant GW as API Gateway :8080
    participant PASS as passenger-service :8083
    participant PassDB as passenger_db
    participant SEAT as seat-service :8082
    participant SeatDB as seat_db

    Staff->>Page: Click "Assign Seat" (passengerId, seatId, aircraftId)
    Page->>API: passengersAPI.assignSeat(id, seatId, aircraftId)
    API->>GW: PUT /api/passengers/{id}/assign-seat<br/>{seatId, aircraftId}
    GW->>PASS: lb://passenger-service

    PASS->>PassDB: SELECT * FROM passengers WHERE id = ?
    PassDB-->>PASS: Passenger entity
    PASS->>PASS: passenger.setSeatId(seatId)<br/>passenger.setAircraftId(aircraftId)
    PASS->>PassDB: UPDATE passengers SET seat_id = ?, aircraft_id = ?
    PassDB-->>PASS: ✅ Saved

    Note over PASS,SEAT: Cross-service call (hardcoded URL)
    PASS->>SEAT: RestTemplate PUT<br/>http://localhost:8082/api/seats/{seatId}/status?aircraftId={id}<br/>Body: {status: "OCCUPIED"}
    SEAT->>SeatDB: UPDATE seats SET status = 'OCCUPIED'<br/>WHERE seat_id = ? AND aircraft_id = ?
    SeatDB-->>SEAT: ✅ Updated
    SEAT-->>PASS: 200 OK

    PASS-->>GW: PassengerResponseDTO
    GW-->>API: Response
    API-->>Page: Updated passenger
    Page->>Page: React Query invalidation → re-fetch
```

### 6.3 AI Copilot Query

```mermaid
sequenceDiagram
    actor Staff
    participant Chat as ChatPanel.tsx
    participant AiAPI as aiAPI
    participant GW as API Gateway :8080
    participant AI as ai-service :8088
    participant Claude as Anthropic Claude API
    participant Internal as Internal APIs<br/>(via Gateway)

    Staff->>Chat: "How many delayed flights?"
    Chat->>AiAPI: aiAPI.query(query, conversationHistory)
    AiAPI->>GW: POST /api/ai/query
    GW->>AI: lb://ai-service → RewritePath → POST /query

    Note over AI,Claude: Step 1: Route Classification
    AI->>Claude: System: "You are CabineIQ..."<br/>User: "How many delayed flights?"
    Claude-->>AI: {"apiCall":"GET /api/flights",<br/>"responseKey":"flights",<br/>"naturalLanguageTemplate":"..."}

    Note over AI,Internal: Step 2: Execute Internal API
    AI->>AI: parseJson(response) → resolve path
    AI->>GW: WebClient GET http://gateway:8080/api/flights
    GW-->>AI: [Flight JSON array]

    Note over AI,Claude: Step 3: Format Response
    AI->>Claude: "Given this data: [...], answer: 'How many delayed flights?'"
    Claude-->>AI: "There are 2 delayed flights: AT205 and AT310"

    AI-->>GW: {answer, actionType: "FLIGHTS_QUERY", relatedFlightId}
    GW-->>AiAPI: Response
    AiAPI-->>Chat: Display answer
    Chat->>Staff: "There are 2 delayed flights: AT205 and AT310"
```

### 6.4 ML Predictions Pipeline

```mermaid
sequenceDiagram
    participant Scheduler as APScheduler<br/>Cron: 02:00 UTC
    participant Train as train.py
    participant DB as feedback_db (MySQL)
    participant Model as model.pkl
    participant App as app.py (Flask :8087)
    participant FE as AnalyticsPage.tsx

    Note over Scheduler,FE: === Nightly Training ===
    Scheduler->>Train: scheduled_train()
    Train->>DB: SELECT features + purchase_intent_score<br/>FROM feedback WHERE score IS NOT NULL
    DB-->>Train: DataFrame (N rows)

    alt N < 1000
        Train->>Train: RULE_BASED phase → skip training
    else N >= 1000
        Train->>Train: OneHotEncoder.fit_transform(features)
        Train->>Train: XGBRegressor.fit(X_train, y_score)
        Train->>Train: XGBClassifier.fit(X_train, y_click)
        Train->>Train: Evaluate RMSE + AUC
        Train->>Model: pickle.dump({regressor, classifier, encoder, metrics})
    end

    Note over Scheduler,FE: === Frontend Request ===
    FE->>App: GET /predictions (every 60s via React Query)
    App->>DB: SELECT COUNT(*) FROM feedback
    DB-->>App: row_count

    alt RULE_BASED or no model.pkl
        App->>DB: SELECT route, seat_class, AVG(score), COUNT(*)<br/>GROUP BY route, seat_class LIMIT 20
        DB-->>App: Aggregated data
        App->>App: rule_based_multiplier(avg_score) → predictions[]
    else XGBOOST_PHASE2 / PHASE3
        App->>Model: load model.pkl
        App->>App: Return CACHED_PREDICTIONS
    end

    App-->>FE: {lastTrained, modelPhase, predictions[]}
    FE->>FE: MlPredictionsTable renders with trend arrows
```

### 6.5 Notification Flow

```mermaid
sequenceDiagram
    participant FE as AppShell.tsx
    participant Hook as useNotifications()
    participant API as notificationsAPI
    participant GW as API Gateway :8080
    participant NOTIF as notification-service :8089
    participant DB as notification_db

    FE->>Hook: Initialize (polling every 30s)
    Hook->>API: notificationsAPI.getAll()
    API->>GW: GET /api/notifications
    GW->>NOTIF: lb://notification-service<br/>RewritePath → GET /notifications
    NOTIF->>DB: SELECT * FROM notifications ORDER BY created_at DESC
    DB-->>NOTIF: Notification[]
    NOTIF-->>GW: Response
    GW-->>API: Response
    API-->>Hook: Notification[]
    Hook->>Hook: Calculate unreadCount<br/>Detect new → shakeBell animation
    Hook-->>FE: {notifications, unreadCount, shakeBell}
    FE->>FE: Render UnreadBadge + bell shake

    Note over FE,DB: User clicks bell
    FE->>Hook: markAllRead()
    Hook->>API: notificationsAPI.markAllRead()
    API->>GW: PATCH /api/notifications/read-all
    GW->>NOTIF: Forward
    NOTIF->>DB: UPDATE notifications SET is_read = true
    DB-->>NOTIF: ✅
```

---

## 7. Configuration & Environment

### 7.1 Environment Variables

| Variable | Used by | Purpose | Default |
|----------|---------|---------|---------|
| `JWT_SECRET` | API Gateway, auth-service | Shared HMAC-SHA signing key | Hardcoded hex fallback |
| `ANTHROPIC_API_KEY` | ai-service | Claude API authentication | *(empty — service returns "unavailable")* |
| `DB_HOST` | ml-service | MySQL host | `localhost` |
| `DB_PORT` | ml-service | MySQL port | `3306` |
| `DB_NAME` | ml-service | MySQL database name | `feedback_db` |
| `DB_USER` | ml-service | MySQL username | `root` |
| `DB_PASS` | ml-service | MySQL password | `root` |

### 7.2 CORS Configuration

```mermaid
graph LR
    subgraph ALLOWED["Allowed Origins"]
        O1["http://localhost:3000<br/>(Vite dev server)"]
        O2["http://localhost:5173<br/>(Vite alternate port)"]
    end

    subgraph METHODS["Allowed Methods"]
        M1["GET · POST · PUT"]
        M2["PATCH · DELETE · OPTIONS"]
    end

    GW["API Gateway<br/>globalcors config"] --> ALLOWED
    GW --> METHODS
    ML["ML Service<br/>Flask-CORS"] --> ALLOWED

    style GW fill:#0d2a1a,stroke:#4ade80,color:#fff
    style ML fill:#1a2e1a,stroke:#C9A84C,color:#fff
```

### 7.3 Database Configuration

All Spring Boot services share this pattern:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/{service_db}
    username: root
    password: root
  jpa:
    hibernate:
      ddl-auto: update    # Auto-schema, no migrations
    show-sql: true
```

---

## 8. Local Development

### 8.1 Prerequisites

| Tool | Version |
|------|---------|
| Java | 21+ |
| Maven | 3.9+ |
| Node.js | 18+ |
| Python | 3.10+ |
| MySQL | 8.0+ |

### 8.2 Startup Sequence

```mermaid
graph TD
    START["start.bat"] --> E["1. Eureka Server :8761"]
    E --> |"Wait for registry"| SERVICES
    subgraph SERVICES["2. Business Services (parallel)"]
        AUTH["auth-service :8085"]
        AIRCRAFT["aircraft-service :8081"]
        SEAT["seat-service :8082"]
        PASSENGER["passenger-service :8083"]
        FLIGHT["flight-service :8084"]
        FEEDBACK["feedback-service :8086"]
        AI["ai-service :8088"]
        NOTIF["notification-service :8089"]
    end
    SERVICES --> GW["3. API Gateway :8080"]
    GW --> ML["4. ML Service :8087<br/>(python app.py)"]
    ML --> FE["5. frontend-new :3000<br/>(npm run dev)"]

    style START fill:#C41E3A,stroke:#fff,color:#fff
    style E fill:#2d1b4e,stroke:#a78bfa,color:#fff
    style SERVICES fill:#1a1a2e,stroke:#C41E3A,color:#fff
    style GW fill:#0d2a1a,stroke:#4ade80,color:#fff
    style ML fill:#1a2e1a,stroke:#C9A84C,color:#fff
    style FE fill:#1e3a5f,stroke:#38bdf8,color:#fff
```

### 8.3 Key URLs

| Resource | URL |
|----------|-----|
| 🖥️ Frontend (CabineIQ) | http://localhost:3000 |
| 🔐 API Gateway | http://localhost:8080 |
| 📡 Eureka Dashboard | http://localhost:8761 |
| 🤖 ML Health Check | http://localhost:8087/health |
| 📊 ML Predictions | http://localhost:8087/predictions |

---

## 9. Design Notes & Known Constraints

### 9.1 Security

```mermaid
graph TD
    subgraph SECURED["✅ Secured Path"]
        B["Browser"] -->|"Bearer JWT"| GW["API Gateway"]
        GW -->|"JwtAuthFilter validates"| SVC["Microservices"]
    end

    subgraph UNSECURED["⚠️ Unsecured Path"]
        DIRECT["Direct access<br/>localhost:{port}"] -->|"No JWT check"| SVC2["Microservices"]
    end

    style SECURED fill:#0d2a1a,stroke:#4ade80,color:#fff
    style UNSECURED fill:#2e1a1a,stroke:#f87171,color:#fff
```

- **JWT enforced only at the gateway.** Individual services on their direct ports do not validate tokens.
- JWT is HMAC-SHA signed with a shared `JWT_SECRET` between `auth-service` and `api-gateway`.
- Public paths: `/api/auth/login`, `/api/auth/register` skip JWT validation.

### 9.2 Data Layer

- **No migration tooling** — all services use Hibernate `ddl-auto: update` for schema management. No Flyway or Liquibase.
- **Database-per-service** — each service owns its schema, but cross-database joins are not possible.

### 9.3 Inter-Service Coupling

- **Passenger → Seat** uses hardcoded `http://localhost:8082` instead of Eureka discovery (`lb://seat-service`).
- **ML → MySQL** reads `feedback_db` directly via SQLAlchemy — bypasses the feedback-service API entirely.

### 9.4 ML Service Integration

- Frontend makes **direct HTTP calls** to `localhost:8087` for `/predictions` and `/health`.
- Gateway also routes `/api/ml/**` to `localhost:8087` with path rewriting.
- Dual integration path creates redundancy.

### 9.5 Other Constraints

- **AI service** requires `ANTHROPIC_API_KEY` or returns "AI service is temporarily unavailable."
- **Public feedback page** (`/feedback`) submits data via `feedbackAPI.submit()` to the gateway.
- **No WebSocket/SSE** — notification polling uses React Query interval-based refetching.
- **No container orchestration** — local development only via `start.bat`/`stop.bat`.
