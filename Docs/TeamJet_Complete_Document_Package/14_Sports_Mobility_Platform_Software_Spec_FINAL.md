# SPORTS MOBILITY REQUEST PLATFORM

## Software Specification and Build Guide

**Owner:** Travel.SportsMedia.us, a division of Sports Media, Inc.
**Version:** 2.0
**Date:** January 24, 2026

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Vision

Build a secure, role-based intake and authorization platform that enables professional sports organizations to submit short-notice, small-jet charter requests that route directly to a fulfillment broker operations desk.

### 1.2 Core Design Principles

| Principle                   | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| **Hands-Off Operations**    | Platform routes requests; broker fulfills             |
| **Broker-Agnostic**         | Add or swap brokers without re-platforming            |
| **Security-First**          | Confidentiality by design, least-privilege access     |
| **Audit Everything**        | Immutable logs, approvals, SLA performance            |
| **Non-Carrier Positioning** | Platform does NOT select operators or control flights |

### 1.3 What the Platform Does

- Captures charter requests from authorized team users
- Routes requests to fulfillment broker
- Manages approval workflows
- Tracks SLA performance
- Maintains compliance documentation
- Generates reporting and analytics

### 1.4 What the Platform Does NOT Do

- Operate aircraft
- Select air carriers or operators
- Control flight operations
- Set air transportation prices
- Execute charter contracts

---

## 2. USER ROLES AND PERMISSIONS

### 2.1 Team Roles

| Role           | Permissions                              | Examples        |
| -------------- | ---------------------------------------- | --------------- |
| **Team Admin** | Full team configuration, user management | IT Director     |
| **Executive**  | Request, approve, view all               | Owner, CEO, GM  |
| **Manager**    | Request, approve within scope            | VP, Director    |
| **Requester**  | Submit requests, view own                | Coordinator, EA |
| **Viewer**     | View only, no actions                    | Finance analyst |

### 2.2 Platform Roles

| Role            | Permissions                          | Examples        |
| --------------- | ------------------------------------ | --------------- |
| **Super Admin** | Global configuration, all tenants    | Platform owner  |
| **Ops Admin**   | Escalations, SLA monitoring, support | Operations team |
| **Support**     | Read-only, ticket handling           | Support staff   |

### 2.3 Broker Roles

| Role              | Permissions                     | Examples       |
| ----------------- | ------------------------------- | -------------- |
| **Broker Admin**  | Integration config, API keys    | Broker IT      |
| **Broker Ops**    | Receive requests, submit quotes | Booking agents |
| **Broker Viewer** | Read-only access                | Management     |

### 2.4 Permission Matrix

| Action              | Team Admin | Executive | Manager | Requester | Viewer |
| ------------------- | ---------- | --------- | ------- | --------- | ------ |
| Create Request      | Yes        | Yes       | Yes     | Yes       | No     |
| Approve Request     | Yes        | Yes       | Scoped  | No        | No     |
| View All Requests   | Yes        | Yes       | Scoped  | Own       | Scoped |
| Manage Users        | Yes        | No        | No      | No        | No     |
| View Reports        | Yes        | Yes       | Scoped  | No        | Scoped |
| Configure Workflows | Yes        | No        | No      | No        | No     |

---

## 3. SUPPORTED USE CASES

### 3.1 Primary Use Cases

| Use Case           | Description                          | Urgency            |
| ------------------ | ------------------------------------ | ------------------ |
| Executive Mobility | C-suite, ownership, board travel     | Standard to Urgent |
| Player Movement    | Trades, physicals, contract signings | Often Urgent       |
| Family Mobility    | Approved family travel               | Standard           |
| Sponsor/VIP        | Partner hospitality, events          | Standard           |
| Event Travel       | Appearances, activations             | Planned            |
| Emergency          | Medical, security, crisis            | Urgent             |

### 3.2 Travel Categories

| Category          | Description                   | Approval Level         |
| ----------------- | ----------------------------- | ---------------------- |
| Business-Critical | Trades, deals, time-sensitive | Auto or Manager        |
| Executive         | Leadership travel             | Manager or Executive   |
| Hospitality       | Sponsor, VIP                  | Partnerships + Finance |
| Personal          | Player family, personal       | Player Services        |
| Emergency         | Crisis situations             | Auto with notification |

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Request Intake (P0)

| Feature              | Description                              | Validation           |
| -------------------- | ---------------------------------------- | -------------------- |
| Traveler Category    | Executive, Player, Family, Sponsor, etc. | Required dropdown    |
| Passenger Count      | Number of travelers                      | 1-19                 |
| Origin Airport       | Departure location                       | ICAO/IATA lookup     |
| Destination Airport  | Arrival location                         | ICAO/IATA lookup     |
| Date and Time        | Departure window                         | Future date required |
| Trip Type            | One-way, Round-trip, Multi-leg           | Required             |
| Urgency Flag         | Standard, Same-Day, Urgent               | Required             |
| Confidentiality      | Normal, Confidential, Restricted         | Default: Normal      |
| Special Requirements | Free text                                | Optional             |
| Baggage Notes        | Equipment, excess baggage                | Optional             |
| Ground Transport     | Request pickup/dropoff                   | Optional             |

### 4.2 Multi-Leg Support

| Field       | Per Leg  |
| ----------- | -------- |
| Origin      | Required |
| Destination | Required |
| Date/Time   | Required |
| Passengers  | Can vary |

Support unlimited legs with add/remove interface.

### 4.3 Approvals and Governance (P1)

| Feature             | Description                        |
| ------------------- | ---------------------------------- |
| Configurable Chains | Define approval sequences          |
| Budget Thresholds   | Auto-approve below limits          |
| Role-Based          | Different chains by requester role |
| Category-Based      | Different chains by travel type    |
| Delegation          | Out-of-office backup approvers     |
| Timeout             | Auto-escalate if no response       |
| Audit Trail         | Immutable log of all actions       |

### 4.4 Broker Routing (P0)

| Feature            | Description                             |
| ------------------ | --------------------------------------- |
| Primary Routing    | Default broker for all requests         |
| Fallback Routing   | Secondary broker if primary unavailable |
| Category Routing   | Different brokers by aircraft size      |
| SLA Tracking       | Timer starts at routing                 |
| Acknowledgment     | Broker confirms receipt                 |
| Rejection Handling | Route to fallback if declined           |

### 4.5 Quote Management (P0)

| Feature          | Description                      |
| ---------------- | -------------------------------- |
| Quote Receipt    | Broker submits via API or portal |
| Multiple Options | Support 2-3 aircraft options     |
| Quote Display    | Present to team user             |
| Comparison       | Side-by-side view                |
| Expiration       | Countdown timer                  |
| Selection        | Team confirms choice             |
| Rejection        | Decline with optional reason     |

### 4.6 Status Tracking (P1)

| Status           | Description                  |
| ---------------- | ---------------------------- |
| Draft            | Request in progress          |
| Submitted        | Sent for approval            |
| Pending Approval | Awaiting approver            |
| Approved         | Ready for routing            |
| Routed           | Sent to broker               |
| Quoting          | Broker sourcing options      |
| Quoted           | Options available            |
| Confirmed        | Quote accepted, booking made |
| In-Flight        | Departure confirmed          |
| Completed        | Arrival confirmed            |
| Cancelled        | Request cancelled            |

### 4.7 SLA Management (P1)

| Metric            | Tracking                            |
| ----------------- | ----------------------------------- |
| Response Time     | Request to broker acknowledgment    |
| Quote Time        | Request to first quote              |
| Confirmation Time | Quote acceptance to booking confirm |
| Breach Detection  | Automatic alert on SLA miss         |
| Escalation        | Route to ops admin                  |
| Reporting         | Dashboard and exports               |

### 4.8 Reporting and Analytics (P2)

| Report             | Contents                          |
| ------------------ | --------------------------------- |
| Usage Summary      | Requests by team, category, month |
| SLA Performance    | Compliance rates, breaches        |
| Spend Analysis     | Costs by category, trend          |
| Approval Metrics   | Time to approve, rejection rates  |
| Broker Performance | Quote rates, win rates            |

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Security

| Requirement            | Standard                                  |
| ---------------------- | ----------------------------------------- |
| Authentication         | SSO optional, MFA required for privileged |
| Authorization          | RBAC with tenant isolation                |
| Encryption (Transit)   | TLS 1.3 minimum                           |
| Encryption (Rest)      | AES-256                                   |
| Session Management     | JWT, short-lived access tokens            |
| Audit Logging          | Immutable, timestamped                    |
| Penetration Testing    | Annual                                    |
| Vulnerability Scanning | Continuous                                |

### 5.2 Privacy

| Requirement        | Implementation                |
| ------------------ | ----------------------------- |
| Data Minimization  | Collect only necessary PII    |
| Purpose Limitation | Use only for service delivery |
| Retention Limits   | Configurable per team         |
| Access Controls    | Role-based, logged            |
| CCPA Compliance    | Privacy rights support        |
| Consent            | For optional data uses        |

### 5.3 Performance

| Metric           | Target                   |
| ---------------- | ------------------------ |
| Page Load        | <1.5 seconds             |
| API Response     | <200ms (95th percentile) |
| Request Creation | <2 seconds               |
| Quote Rendering  | <2 seconds               |
| Search           | <500ms                   |

### 5.4 Availability

| Metric           | Target         |
| ---------------- | -------------- |
| Uptime           | 99.9%          |
| Planned Downtime | <4 hours/month |
| Recovery Time    | <15 minutes    |
| Failover         | Automatic      |

### 5.5 Scalability

| Metric           | Initial | Growth  |
| ---------------- | ------- | ------- |
| Teams            | 25      | 200+    |
| Concurrent Users | 100     | 1,000   |
| Requests/Month   | 500     | 5,000   |
| Data Retention   | 2 years | 7 years |

---

## 6. TECHNICAL ARCHITECTURE

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│   iOS App           │   Android App        │   Web App                  │
│   (React Native)    │   (React Native)     │   (Next.js 14)             │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                      │
│                    (Node.js / Express / TypeScript)                      │
│                    Authentication, Rate Limiting, Routing                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐
│   CORE SERVICES     │ │ BROKER SERVICES │ │     ADMIN SERVICES          │
├─────────────────────┤ ├─────────────────┤ ├─────────────────────────────┤
│ - Identity/Auth     │ │ - Request Queue │ │ - Tenant Management         │
│ - Request Service   │ │ - Quote Service │ │ - User Administration       │
│ - Approval Service  │ │ - Status Sync   │ │ - Configuration             │
│ - Notification      │ │ - Webhooks      │ │ - Reporting Engine          │
│ - Document Service  │ │                 │ │ - Audit Service             │
│ - SLA Service       │ │                 │ │                             │
└─────────────────────┘ └─────────────────┘ └─────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                     │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│   PostgreSQL        │   Redis             │   S3                        │
│   (Supabase)        │   (Cache/Sessions)  │   (Documents)               │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
```

### 6.2 Technology Stack

| Layer      | Technology                 | Rationale                 |
| ---------- | -------------------------- | ------------------------- |
| Mobile     | React Native               | Cross-platform efficiency |
| Web        | Next.js 14                 | SSR, React ecosystem      |
| API        | Node.js/Express/TypeScript | JavaScript consistency    |
| Database   | PostgreSQL (Supabase)      | Reliability, real-time    |
| Cache      | Redis                      | Performance, sessions     |
| Storage    | AWS S3                     | Document storage          |
| Auth       | Supabase Auth              | Built-in, secure          |
| Hosting    | Vercel + AWS               | Performance + flexibility |
| Monitoring | DataDog/Sentry             | Observability             |

### 6.3 Database Schema (Core)

```sql
-- Tenants (Teams)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    league VARCHAR(50),
    subscription_tier VARCHAR(50) DEFAULT 'standard',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Requests
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    requester_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft',
    category VARCHAR(50) NOT NULL,
    urgency VARCHAR(20) DEFAULT 'standard',
    confidentiality VARCHAR(20) DEFAULT 'normal',
    passenger_count INTEGER NOT NULL,
    special_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Request Legs
CREATE TABLE request_legs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    leg_number INTEGER NOT NULL,
    origin_airport VARCHAR(10) NOT NULL,
    destination_airport VARCHAR(10) NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    flexible_time BOOLEAN DEFAULT FALSE
);

-- Approvals
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id),
    approver_id UUID REFERENCES users(id),
    sequence INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending',
    decided_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id),
    broker_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    aircraft_type VARCHAR(100),
    aircraft_year INTEGER,
    operator_name VARCHAR(255),
    safety_rating VARCHAR(50),
    total_price DECIMAL(12,2),
    price_breakdown JSONB,
    valid_until TIMESTAMPTZ,
    terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status Events (Audit Log)
CREATE TABLE status_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id),
    event_type VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    actor_id UUID,
    actor_type VARCHAR(20), -- user, broker, system
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SLA Tracking
CREATE TABLE sla_timers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id),
    sla_type VARCHAR(50) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    target_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    breached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_requests_tenant ON requests(tenant_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_approvals_request ON approvals(request_id);
CREATE INDEX idx_quotes_request ON quotes(request_id);
CREATE INDEX idx_status_events_request ON status_events(request_id);
```

### 6.4 API Endpoints

```
AUTHENTICATION
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/mfa/verify
GET    /api/auth/me

REQUESTS
GET    /api/requests                    # List requests (filtered by role)
POST   /api/requests                    # Create request
GET    /api/requests/:id                # Get request details
PUT    /api/requests/:id                # Update request
DELETE /api/requests/:id                # Delete draft
POST   /api/requests/:id/submit         # Submit for approval
POST   /api/requests/:id/cancel         # Cancel request

APPROVALS
GET    /api/approvals/pending           # My pending approvals
POST   /api/approvals/:id/approve       # Approve
POST   /api/approvals/:id/reject        # Reject
POST   /api/approvals/:id/delegate      # Delegate to another

QUOTES
GET    /api/requests/:id/quotes         # Quotes for request
POST   /api/requests/:id/quotes         # Submit quote (broker)
POST   /api/quotes/:id/select           # Select quote
POST   /api/quotes/:id/reject           # Reject quote

BROKER (Webhook Receivers)
POST   /api/broker/acknowledge          # Broker acknowledges request
POST   /api/broker/quote                # Broker submits quote
POST   /api/broker/status               # Broker updates status

ADMIN
GET    /api/admin/tenants               # List tenants
POST   /api/admin/tenants               # Create tenant
GET    /api/admin/users                 # List users
GET    /api/admin/sla/dashboard         # SLA metrics
GET    /api/admin/reports/:type         # Generate report

REPORTING
GET    /api/reports/usage               # Usage summary
GET    /api/reports/sla                 # SLA performance
GET    /api/reports/spend               # Spend analysis
GET    /api/reports/export              # Export data
```

---

## 7. BROKER INTEGRATION

### 7.1 Integration Modes

| Mode               | Description                | Use Case             |
| ------------------ | -------------------------- | -------------------- |
| **Mode A: API**    | Full API integration       | Tech-forward brokers |
| **Mode B: Email**  | Structured email templates | Traditional brokers  |
| **Mode C: Hybrid** | API in, email for quotes   | Transitional         |

### 7.2 API Integration Spec

**Request Payload (to Broker):**

```json
{
  "request_id": "uuid",
  "tenant": "Team Name",
  "urgency": "urgent",
  "legs": [
    {
      "origin": "KJFK",
      "destination": "KMIA",
      "date": "2026-02-15",
      "time": "14:00",
      "passengers": 4
    }
  ],
  "category": "executive",
  "special_requirements": "Catering requested",
  "callback_url": "https://charter.sportsmedia.net/api/broker/quote"
}
```

**Quote Payload (from Broker):**

```json
{
  "request_id": "uuid",
  "quotes": [
    {
      "aircraft_type": "Citation XLS+",
      "aircraft_year": 2018,
      "operator": "ABC Aviation",
      "safety_rating": "ARGUS Platinum",
      "total_price": 28500.0,
      "price_breakdown": {
        "flight": 25000,
        "fees": 2500,
        "taxes": 1000
      },
      "valid_until": "2026-02-14T18:00:00Z",
      "cancellation_terms": "Full refund 72+ hours..."
    }
  ]
}
```

### 7.3 Webhook Events

| Event           | Trigger              | Payload                |
| --------------- | -------------------- | ---------------------- |
| request.created | New request routed   | Request details        |
| quote.submitted | Broker submits quote | Quote details          |
| quote.selected  | Team selects quote   | Selection confirmation |
| status.updated  | Any status change    | Status event           |

---

## 8. AI/CLAUDE INTEGRATION

### 8.1 Permitted Uses

| Use Case          | Description                         |
| ----------------- | ----------------------------------- |
| Request Summaries | Generate clear summaries for broker |
| Field Validation  | Detect missing/invalid information  |
| Classification    | Categorize requests by type/urgency |
| Report Narratives | Generate compliance export text     |
| Escalation Triage | Suggest actions for ops admin       |

### 8.2 Guardrails (CRITICAL)

Claude/AI must NOT:

| Prohibited Action          | Reason                  |
| -------------------------- | ----------------------- |
| Select operators           | Regulatory positioning  |
| Set or suggest prices      | Broker responsibility   |
| Generate contract language | Legal risk              |
| Make safety claims         | Beyond provided data    |
| Approve requests           | Human decision required |
| Access PII without purpose | Privacy                 |

### 8.3 Implementation

```typescript
// Example: Request summary generation
const generateRequestSummary = async (request: Request) => {
  const prompt = `
    Summarize this charter request for a broker:
    - Category: ${request.category}
    - Route: ${request.legs.map((l) => `${l.origin}-${l.destination}`).join(" | ")}
    - Date: ${request.legs[0].date}
    - Passengers: ${request.passenger_count}
    - Special: ${request.special_requirements || "None"}

    Generate a 2-3 sentence professional summary.
    Do NOT suggest aircraft, pricing, or operators.
  `;

  return await claude.complete(prompt);
};
```

---

## 9. USER EXPERIENCE FLOWS

### 9.1 Team User: Create Request

```
1. Login → Dashboard
2. Click "New Request"
3. Select Category (Executive, Player, etc.)
4. Enter Trip Details
   - Origin/Destination
   - Date/Time
   - Passengers
5. Add Special Requirements (optional)
6. Set Urgency Level
7. Set Confidentiality (if needed)
8. Review Summary
9. Submit for Approval (or auto-submit)
10. Receive Confirmation
```

### 9.2 Approver: Review Request

```
1. Receive Notification
2. View Pending Queue
3. Select Request
4. Review Details
   - Trip info
   - Requester
   - Category
   - Estimated cost (if available)
5. Approve / Reject / Request Info
6. Add Notes (optional)
7. Confirm Decision
```

### 9.3 Team User: Select Quote

```
1. Receive Quote Notification
2. View Quote Options
3. Compare (side-by-side)
   - Aircraft type/year
   - Operator/safety rating
   - Price
   - Terms
4. Select Preferred Option
5. Confirm Selection
6. Receive Booking Confirmation
```

### 9.4 Broker: Process Request

```
1. Receive Request Alert
2. Acknowledge Receipt
3. Source Aircraft Options
4. Build Quote(s)
5. Submit via API/Portal
6. Await Selection
7. Confirm Booking
8. Update Status Through Completion
```

---

## 10. DEPLOYMENT AND RELEASE

### 10.1 Phase 1: MVP (Weeks 1-4)

| Feature                 | Priority |
| ----------------------- | -------- |
| Tenant/user management  | P0       |
| Request creation        | P0       |
| Basic approval workflow | P0       |
| Broker email routing    | P0       |
| Manual quote entry      | P0       |
| Status tracking         | P0       |
| Basic notifications     | P0       |
| Web app (responsive)    | P0       |

### 10.2 Phase 2: API Integration (Weeks 5-8)

| Feature                | Priority |
| ---------------------- | -------- |
| Broker API integration | P1       |
| Webhook handlers       | P1       |
| SLA tracking           | P1       |
| Advanced approvals     | P1       |
| Reporting exports      | P1       |

### 10.3 Phase 3: Mobile Launch (Weeks 9-12)

| Feature              | Priority |
| -------------------- | -------- |
| iOS app              | P1       |
| Android app          | P1       |
| Push notifications   | P1       |
| Biometric auth       | P1       |
| App store submission | P1       |

### 10.4 Phase 4: Enterprise (Weeks 13-16)

| Feature              | Priority |
| -------------------- | -------- |
| SSO integration      | P2       |
| Advanced analytics   | P2       |
| Custom branding      | P2       |
| API for integrations | P2       |
| Multi-broker routing | P2       |

---

## 11. DEFINITION OF DONE

### 11.1 Security Checklist

- [ ] MFA enforced for privileged roles
- [ ] All data encrypted at rest and in transit
- [ ] RBAC implemented and tested
- [ ] Penetration test passed
- [ ] Vulnerability scan clean

### 11.2 Compliance Checklist

- [ ] Audit logs immutable and exportable
- [ ] Non-carrier positioning verified in all UI
- [ ] Privacy policy implemented
- [ ] Data retention configurable
- [ ] CCPA requirements met

### 11.3 Operations Checklist

- [ ] Broker routing operational
- [ ] Fallback procedures documented
- [ ] SLA dashboard functional
- [ ] Escalation alerts working
- [ ] Support documentation complete

### 11.4 Quality Checklist

- [ ] Unit test coverage >80%
- [ ] Integration tests passing
- [ ] Load testing completed
- [ ] Accessibility audit passed
- [ ] Cross-browser testing done

---

## 12. APPENDICES

### Appendix A: Request Field Validation Rules

| Field               | Type    | Required | Validation               |
| ------------------- | ------- | -------- | ------------------------ |
| category            | enum    | Yes      | Valid category           |
| origin_airport      | string  | Yes      | Valid ICAO/IATA          |
| destination_airport | string  | Yes      | Valid ICAO/IATA          |
| departure_date      | date    | Yes      | Future date              |
| departure_time      | time    | Yes      | Valid time               |
| passenger_count     | integer | Yes      | 1-19                     |
| urgency             | enum    | Yes      | standard/same_day/urgent |

### Appendix B: Status Codes

| Code             | Description                    |
| ---------------- | ------------------------------ |
| DRAFT            | Request started, not submitted |
| PENDING_APPROVAL | Awaiting approver action       |
| APPROVED         | Ready for broker routing       |
| ROUTED           | Sent to broker                 |
| QUOTING          | Broker sourcing options        |
| QUOTED           | Quotes available               |
| CONFIRMED        | Booking confirmed              |
| IN_FLIGHT        | Departed                       |
| COMPLETED        | Arrived                        |
| CANCELLED        | Request cancelled              |

### Appendix C: SLA Definitions

| SLA Type       | Urgent | Same-Day | Standard |
| -------------- | ------ | -------- | -------- |
| Acknowledgment | 10 min | 15 min   | 30 min   |
| First Quote    | 30 min | 45 min   | 2 hours  |
| Confirmation   | 30 min | 1 hour   | 2 hours  |

---

## DOCUMENT APPROVAL

| Role              | Name     | Date |
| ----------------- | -------- | ---- |
| Product Owner     |          |      |
| Technical Lead    |          |      |
| Executive Sponsor | Dan Kost |      |

---

_This specification is a living document. Updates tracked via version control._

_Version 2.0 - January 24, 2026_
