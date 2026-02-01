# INTERNAL STANDARD OPERATING PROCEDURES

## Sports Media Charter Platform Operations

**Sports Media, Inc.**

**Version:** 1.0
**Effective Date:** January 24, 2026
**Last Updated:** ******\_\_\_******

---

## TABLE OF CONTENTS

1. [Purpose and Scope](#section-1)
2. [Organizational Structure](#section-2)
3. [Request Intake and Processing](#section-3)
4. [Quote Management](#section-4)
5. [Booking and Fulfillment](#section-5)
6. [Client Support](#section-6)
7. [Compliance and Documentation](#section-7)
8. [Incident Management](#section-8)
9. [Financial Operations](#section-9)
10. [Quality Assurance](#section-10)

---

<a name="section-1"></a>

## SECTION 1: PURPOSE AND SCOPE

### 1.1 Purpose

This Standard Operating Procedures (SOP) document governs the daily operations of the Sports Media Charter platform operated by Sports Media, Inc. It establishes consistent processes for:

- Processing charter requests
- Managing broker communications
- Supporting clients
- Maintaining compliance
- Handling incidents
- Financial reconciliation

### 1.2 Scope

These procedures apply to:

- All Sports Media personnel involved in Sports Media Charter operations
- Interactions with Chief Executive Air (broker partner)
- Client-facing activities and support
- Internal administrative functions

### 1.3 Document Control

| Version | Date       | Author     | Changes         |
| ------- | ---------- | ---------- | --------------- |
| 1.0     | 01/24/2026 | Operations | Initial release |
|         |            |            |                 |
|         |            |            |                 |

---

<a name="section-2"></a>

## SECTION 2: ORGANIZATIONAL STRUCTURE

### 2.1 Roles and Responsibilities

#### Travel Director

- Overall program oversight
- Executive relationship management
- Strategic decisions and escalations
- Broker relationship management
- Performance reviews

#### Account Manager

- Day-to-day client communications
- Booking oversight and quality checks
- First-level escalation point
- Client onboarding
- Feedback collection

#### Broker Liaison

- Primary contact with Chief Executive Air
- Request routing and tracking
- Quote review and presentation
- SLA monitoring
- Issue resolution with broker

#### Compliance Reviewer

- Documentation verification
- Operator vetting review
- Insurance certificate review
- Incident documentation
- Audit preparation

#### Support Specialist

- Client inquiries and support tickets
- Platform assistance
- Booking modifications
- After-hours coverage (as scheduled)

### 2.2 Organizational Chart

```
                    ┌─────────────────┐
                    │ Travel Director │
                    │   (Dan Kost)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────┴───────┐   ┌───────┴───────┐   ┌───────┴───────┐
│Account Manager│   │Broker Liaison │   │  Compliance   │
│               │   │               │   │   Reviewer    │
└───────┬───────┘   └───────────────┘   └───────────────┘
        │
┌───────┴───────┐
│   Support     │
│  Specialist   │
└───────────────┘
```

### 2.3 Contact Matrix

| Role                | Primary | Backup | Hours          |
| ------------------- | ------- | ------ | -------------- |
| Travel Director     | TBD     | TBD    | Business hours |
| Account Manager     | TBD     | TBD    | Extended hours |
| Broker Liaison      | TBD     | TBD    | Business hours |
| Compliance Reviewer | TBD     | TBD    | Business hours |
| Support Specialist  | TBD     | TBD    | 24/7 rotation  |

---

<a name="section-3"></a>

## SECTION 3: REQUEST INTAKE AND PROCESSING

### 3.1 Request Channels

| Channel                | Priority | Response Target   |
| ---------------------- | -------- | ----------------- |
| Platform (web/mobile)  | Standard | Immediate routing |
| Email                  | Standard | 15 minutes        |
| Phone (urgent hotline) | Urgent   | Immediate         |
| Slack/Teams            | Internal | 5 minutes         |

### 3.2 Request Classification

| Type         | Definition            | SLA          |
| ------------ | --------------------- | ------------ |
| **Urgent**   | Departure < 6 hours   | 30 min quote |
| **Same-Day** | Departure 6-24 hours  | 45 min quote |
| **Standard** | Departure 24-72 hours | 2 hour quote |
| **Advance**  | Departure > 72 hours  | 4 hour quote |

### 3.3 Request Intake Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST INTAKE WORKFLOW                       │
└─────────────────────────────────────────────────────────────────┘

Step 1: RECEIVE REQUEST
        ├── Platform submission (automatic)
        ├── Email submission (manual entry)
        └── Phone submission (manual entry)
                    │
                    ▼
Step 2: VALIDATE REQUEST
        ├── Required fields complete?
        │   ├── YES → Continue
        │   └── NO → Contact client for details
        ├── Client account active?
        │   ├── YES → Continue
        │   └── NO → Escalate to Account Manager
        └── Payment method on file?
            ├── YES → Continue
            └── NO → Request payment setup
                    │
                    ▼
Step 3: CLASSIFY REQUEST
        ├── Determine urgency level
        ├── Identify aircraft requirements
        └── Note special requirements
                    │
                    ▼
Step 4: ROUTE TO BROKER
        ├── Submit via broker portal
        ├── Send email notification
        └── Start SLA timer
                    │
                    ▼
Step 5: CONFIRM RECEIPT
        ├── Client receives confirmation
        ├── Broker acknowledges receipt
        └── Log timestamp in system
```

### 3.4 Required Request Information

| Field                | Required      | Notes                         |
| -------------------- | ------------- | ----------------------------- |
| Client name          | Yes           | Account holder                |
| Contact phone        | Yes           | For day-of communications     |
| Contact email        | Yes           | For documentation             |
| Departure date       | Yes           |                               |
| Departure time       | Yes           | Local time, flexible if noted |
| Origin airport       | Yes           | ICAO or city                  |
| Destination airport  | Yes           | ICAO or city                  |
| Passenger count      | Yes           | Including crew if applicable  |
| Passenger names      | Before flight | For manifest                  |
| Aircraft preference  | No            | Category or specific type     |
| Special requirements | No            | Pets, catering, medical, etc. |

### 3.5 Request Verification Checklist

- [ ] All required fields populated
- [ ] Date/time is in the future
- [ ] Airports are valid
- [ ] Passenger count is reasonable for request
- [ ] Client account is in good standing
- [ ] No conflicting bookings for same client

---

<a name="section-4"></a>

## SECTION 4: QUOTE MANAGEMENT

### 4.1 Quote Receipt Workflow

```
Step 1: RECEIVE QUOTE FROM BROKER
        ├── Via broker portal
        └── Via email
                    │
                    ▼
Step 2: REVIEW QUOTE
        ├── Minimum 2 options provided?
        ├── All required information included?
        ├── Pricing complete and all-inclusive?
        ├── Operator safety ratings verified?
        └── Terms and conditions clear?
                    │
                    ▼
Step 3: QUALITY CHECK
        ├── Pricing reasonable for market?
        ├── Aircraft appropriate for trip?
        ├── Operators meet safety standards?
        └── Any red flags or concerns?
                    │
                    ▼
Step 4: PRESENT TO CLIENT
        ├── Format for client presentation
        ├── Add platform context/notes
        └── Send via platform/email
                    │
                    ▼
Step 5: TRACK RESPONSE
        ├── Log quote sent timestamp
        ├── Set follow-up reminder
        └── Monitor for client response
```

### 4.2 Quote Quality Standards

| Element       | Standard                                       | Reject If                         |
| ------------- | ---------------------------------------------- | --------------------------------- |
| Options       | Minimum 2                                      | Only 1 option without explanation |
| Aircraft info | Type, year, configuration                      | Missing key details               |
| Operator      | Name + safety rating                           | No safety rating                  |
| Pricing       | All-inclusive, itemized                        | Hidden fees or unclear            |
| Validity      | Minimum 2 hours (urgent) / 24 hours (standard) | Expired or too short              |
| Terms         | Clear cancellation policy                      | Missing or unclear                |

### 4.3 Quote Presentation Template

```
SPORTS MEDIA CHARTER QUOTE - [CLIENT NAME]
Trip Reference: [REF#]
Date: [DATE]

TRIP DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Departure: [DATE] at [TIME] local
Route: [ORIGIN] → [DESTINATION]
Passengers: [COUNT]

OPTION 1 - [AIRCRAFT TYPE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Aircraft: [TYPE], [YEAR]
Operator: [NAME] - [ARGUS/WYVERN RATING]
Capacity: [SEATS] passengers
Price: $[AMOUNT] (all-inclusive)
Valid until: [DATE/TIME]

OPTION 2 - [AIRCRAFT TYPE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Aircraft: [TYPE], [YEAR]
Operator: [NAME] - [ARGUS/WYVERN RATING]
Capacity: [SEATS] passengers
Price: $[AMOUNT] (all-inclusive)
Valid until: [DATE/TIME]

CANCELLATION TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CANCELLATION POLICY]

To book, reply with your preferred option or call [PHONE].
```

### 4.4 Quote Follow-Up Schedule

| Quote Age           | Action                                |
| ------------------- | ------------------------------------- |
| 2 hours (urgent)    | Follow-up call                        |
| 4 hours (same-day)  | Follow-up email                       |
| 24 hours (standard) | Follow-up email                       |
| 48 hours            | Second follow-up                      |
| 72 hours            | Final follow-up, close if no response |

---

<a name="section-5"></a>

## SECTION 5: BOOKING AND FULFILLMENT

### 5.1 Booking Workflow

```
Step 1: CLIENT ACCEPTS QUOTE
        ├── Verbal acceptance (phone)
        ├── Written acceptance (email/platform)
        └── Platform booking
                    │
                    ▼
Step 2: CONFIRM WITH BROKER
        ├── Send booking confirmation request
        ├── Verify aircraft still available
        └── Confirm pricing unchanged
                    │
                    ▼
Step 3: PROCESS PAYMENT
        ├── Collect deposit (if required)
        ├── Process via platform
        └── Send receipt to client
                    │
                    ▼
Step 4: ISSUE BOOKING CONFIRMATION
        ├── Generate confirmation document
        ├── Include reference numbers
        └── Send to client within 1 hour
                    │
                    ▼
Step 5: COLLECT PASSENGER MANIFEST
        ├── Request passenger details
        ├── Verify all names and DOB
        └── Submit to broker
                    │
                    ▼
Step 6: REQUEST COMPLIANCE DOCUMENTS
        ├── Insurance certificate
        ├── Operator credentials
        └── Safety documentation
                    │
                    ▼
Step 7: PRE-FLIGHT PACKAGE
        ├── Compile all documents
        ├── Add FBO details and contacts
        └── Send to client 24 hours prior
                    │
                    ▼
Step 8: DAY-OF MONITORING
        ├── Confirm departure
        ├── Monitor flight status
        └── Be available for issues
                    │
                    ▼
Step 9: POST-FLIGHT
        ├── Confirm arrival
        ├── Request feedback
        └── Process final invoice
```

### 5.2 Pre-Flight Package Contents

| Document                          | Source       | Timing                    |
| --------------------------------- | ------------ | ------------------------- |
| Booking confirmation              | Sports Media | At booking                |
| Flight itinerary                  | Broker       | 24 hours prior            |
| FBO information                   | Broker       | 24 hours prior            |
| Pilot contact                     | Broker       | 24 hours prior            |
| Ground transportation (if booked) | Sports Media | 24 hours prior            |
| Insurance certificate             | Broker       | Within 4 hours of booking |
| Weather briefing                  | Broker       | 12 hours prior            |

### 5.3 Day-of-Flight Procedures

| Timing       | Action                                    | Owner           |
| ------------ | ----------------------------------------- | --------------- |
| T-4 hours    | Confirm with broker flight is on schedule | Broker Liaison  |
| T-2 hours    | Send client reminder with FBO details     | Account Manager |
| T-1 hour     | Confirm pilot and crew are in position    | Broker          |
| Departure    | Confirm wheels up                         | Broker Liaison  |
| En route     | Monitor flight tracking                   | Support         |
| Arrival      | Confirm wheels down                       | Broker Liaison  |
| Post-arrival | Client check-in (optional)                | Account Manager |

### 5.4 Modification Procedures

| Modification Type | Process                           | Fee                |
| ----------------- | --------------------------------- | ------------------ |
| Date/time change  | Submit to broker, get new quote   | Varies by operator |
| Route change      | Submit to broker, get new quote   | Varies by operator |
| Passenger count   | Update manifest, confirm capacity | Usually none       |
| Aircraft upgrade  | Submit to broker, get pricing     | Difference in cost |
| Cancellation      | Submit to broker, apply policy    | Per operator terms |

---

<a name="section-6"></a>

## SECTION 6: CLIENT SUPPORT

### 6.1 Support Channels

| Channel            | Hours          | Response Target                           |
| ------------------ | -------------- | ----------------------------------------- |
| Platform chat      | 24/7           | 5 minutes                                 |
| Email              | 24/7           | 1 hour (business) / 4 hours (after hours) |
| Phone              | 24/7           | Immediate                                 |
| Slack (enterprise) | Business hours | 15 minutes                                |

### 6.2 Support Tiers

| Tier   | Issues                                               | Responder          |
| ------ | ---------------------------------------------------- | ------------------ |
| Tier 1 | Basic inquiries, status checks, simple modifications | Support Specialist |
| Tier 2 | Complex modifications, complaints, billing issues    | Account Manager    |
| Tier 3 | Escalations, safety concerns, executive complaints   | Travel Director    |

### 6.3 Common Support Scenarios

#### Scenario: Client wants to modify booking

1. Receive modification request
2. Document requested changes
3. Submit to broker for feasibility/pricing
4. Present options to client
5. Process change if approved
6. Update booking and notify all parties

#### Scenario: Flight is delayed

1. Receive delay notification from broker
2. Assess impact and new timing
3. Notify client immediately
4. Provide updates every 30 minutes
5. Offer alternatives if delay is significant
6. Document for post-flight review

#### Scenario: Client complaint

1. Acknowledge complaint immediately
2. Document details thoroughly
3. Investigate with broker if needed
4. Determine root cause
5. Propose resolution
6. Follow up to ensure satisfaction
7. Log for quality review

### 6.4 Escalation Matrix

| Issue Type           | Tier 1 | Tier 2 | Tier 3 |
| -------------------- | ------ | ------ | ------ |
| Status inquiry       | X      |        |        |
| Simple modification  | X      |        |        |
| Pricing question     | X      |        |        |
| Complex modification |        | X      |        |
| Billing dispute      |        | X      |        |
| Service complaint    |        | X      |        |
| Safety concern       |        |        | X      |
| Executive complaint  |        |        | X      |
| Legal/regulatory     |        |        | X      |

---

<a name="section-7"></a>

## SECTION 7: COMPLIANCE AND DOCUMENTATION

### 7.1 Required Documentation Per Booking

| Document              | Source       | Timing          | Retention |
| --------------------- | ------------ | --------------- | --------- |
| Charter request       | Client       | At submission   | 7 years   |
| Quote                 | Broker       | Within SLA      | 7 years   |
| Booking confirmation  | Sports Media | At booking      | 7 years   |
| Passenger manifest    | Client       | Before flight   | 7 years   |
| Insurance certificate | Broker       | Within 4 hours  | 7 years   |
| Operator certificate  | Broker       | Upon request    | 7 years   |
| Invoice               | Broker       | Within 48 hours | 7 years   |
| Payment receipt       | Sports Media | At payment      | 7 years   |

### 7.2 Operator Verification Checklist

Before each booking, verify:

- [ ] Operator holds valid FAA Part 135 certificate
- [ ] Certificate not suspended or revoked (check FAA database)
- [ ] ARGUS rating is Gold or Platinum, OR
- [ ] Wyvern rating is Registered or Wingman
- [ ] Insurance certificate is current
- [ ] Insurance limits meet requirements ($25M-$50M)
- [ ] No pending enforcement actions

### 7.3 Part 295 Compliance

Ensure all client communications include:

- Disclosure that Sports Media is NOT an air carrier
- Disclosure that broker arranges flights with certificated operators
- Operator identity when available
- Cancellation terms

### 7.4 Record Retention Schedule

| Record Type              | Retention Period | Storage          |
| ------------------------ | ---------------- | ---------------- |
| Contracts and agreements | Permanent        | Cloud + physical |
| Booking records          | 7 years          | Cloud            |
| Financial records        | 7 years          | Cloud            |
| Insurance certificates   | 7 years          | Cloud            |
| Correspondence           | 3 years          | Cloud            |
| Incident reports         | Permanent        | Cloud + physical |

---

<a name="section-8"></a>

## SECTION 8: INCIDENT MANAGEMENT

### 8.1 Incident Classification

| Level        | Definition                                | Examples                                     |
| ------------ | ----------------------------------------- | -------------------------------------------- |
| **Critical** | Safety of life, major service failure     | Accident, injury, flight unable to complete  |
| **High**     | Significant impact, executive involvement | Major delay (>4 hrs), stranded passengers    |
| **Medium**   | Service impact, client dissatisfaction    | Moderate delay, wrong catering, minor issues |
| **Low**      | Minor inconvenience                       | Cosmetic issues, minor timing changes        |

### 8.2 Incident Response Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCIDENT RESPONSE WORKFLOW                    │
└─────────────────────────────────────────────────────────────────┘

Step 1: IDENTIFY AND CLASSIFY
        ├── Receive incident report
        ├── Assess severity level
        └── Notify appropriate personnel
                    │
                    ▼
Step 2: IMMEDIATE RESPONSE
        ├── Critical: Travel Director + CEO immediately
        ├── High: Travel Director within 15 minutes
        ├── Medium: Account Manager within 1 hour
        └── Low: Support Specialist within 4 hours
                    │
                    ▼
Step 3: CONTAIN AND MITIGATE
        ├── Take immediate actions to limit impact
        ├── Communicate with affected parties
        └── Coordinate with broker/operator
                    │
                    ▼
Step 4: DOCUMENT
        ├── Complete incident report form
        ├── Collect statements and evidence
        └── Preserve all communications
                    │
                    ▼
Step 5: RESOLVE
        ├── Implement solution
        ├── Verify resolution with client
        └── Close incident
                    │
                    ▼
Step 6: REVIEW
        ├── Conduct post-incident review
        ├── Identify root cause
        ├── Implement preventive measures
        └── Update procedures if needed
```

### 8.3 Incident Notification Requirements

| Level    | Internal          | Broker         | Client         | League           |
| -------- | ----------------- | -------------- | -------------- | ---------------- |
| Critical | Immediate         | Immediate      | Immediate      | Within 24 hours  |
| High     | 15 minutes        | 15 minutes     | 30 minutes     | Weekly report    |
| Medium   | 1 hour            | 1 hour         | As appropriate | Monthly report   |
| Low      | Next business day | As appropriate | If needed      | Quarterly report |

### 8.4 Incident Report Template

```
INCIDENT REPORT

Reference: INC-[YYYY]-[####]
Date/Time: [TIMESTAMP]
Reported By: [NAME]

CLASSIFICATION
Level: [ ] Critical [ ] High [ ] Medium [ ] Low

BOOKING INFORMATION
Trip Reference: [REF#]
Client: [NAME]
Route: [ORIGIN] → [DESTINATION]
Date: [DATE]

INCIDENT DESCRIPTION
[Detailed description of what occurred]

IMMEDIATE ACTIONS TAKEN
[Actions taken to address incident]

ROOT CAUSE (if known)
[Analysis of why incident occurred]

RESOLUTION
[How incident was resolved]

PREVENTIVE MEASURES
[Steps to prevent recurrence]

ATTACHMENTS
[ ] Communications
[ ] Photos/documentation
[ ] Statements

Completed By: _______________
Date: _______________
Reviewed By: _______________
Date: _______________
```

---

<a name="section-9"></a>

## SECTION 9: FINANCIAL OPERATIONS

### 9.1 Payment Processing

| Payment Type      | Timing                    | Method                   |
| ----------------- | ------------------------- | ------------------------ |
| Client deposit    | At booking                | Credit card via platform |
| Client balance    | 48 hours before departure | Credit card or wire      |
| Urgent booking    | At booking (full amount)  | Credit card              |
| Subscription fees | Annually                  | Credit card or invoice   |

### 9.2 Invoice Processing

#### Client Invoicing

1. Receive invoice from broker (within 48 hours)
2. Verify against booking details
3. Add platform fees
4. Generate client invoice
5. Send to client billing contact
6. Track payment

#### Broker Payment

1. Receive monthly booking statement
2. Reconcile against records
3. Verify aircraft categories and fees
4. Calculate fixed fees owed
5. Apply retainer recovery (if applicable)
6. Process payment within 15 days

### 9.3 Financial Reconciliation

| Activity                     | Frequency | Owner                     |
| ---------------------------- | --------- | ------------------------- |
| Daily booking reconciliation | Daily     | Support                   |
| Weekly payment review        | Weekly    | Account Manager           |
| Monthly broker statement     | Monthly   | Travel Director           |
| Quarterly financial review   | Quarterly | Travel Director + Finance |

### 9.4 Dispute Resolution

1. Document dispute in writing
2. Notify counterparty within 10 days
3. Provide supporting documentation
4. Allow 30 days for resolution
5. Escalate if unresolved
6. Mediation if required

---

<a name="section-10"></a>

## SECTION 10: QUALITY ASSURANCE

### 10.1 Quality Metrics

| Metric                     | Target    | Measurement        |
| -------------------------- | --------- | ------------------ |
| Quote SLA compliance       | 95%       | Automated tracking |
| Booking accuracy           | 99%       | Monthly audit      |
| Client satisfaction        | 4.5/5     | Post-flight survey |
| First-response time        | <15 min   | System logs        |
| Issue resolution           | <24 hours | Ticket tracking    |
| Documentation completeness | 100%      | Monthly audit      |

### 10.2 Quality Reviews

| Review Type               | Frequency | Participants       |
| ------------------------- | --------- | ------------------ |
| Daily standup             | Daily     | Operations team    |
| Weekly operations review  | Weekly    | All staff          |
| Monthly quality audit     | Monthly   | Travel Director    |
| Quarterly business review | Quarterly | Executive + Broker |

### 10.3 Continuous Improvement

1. Collect feedback from all sources
2. Identify recurring issues
3. Analyze root causes
4. Develop improvement plans
5. Implement changes
6. Measure results
7. Document lessons learned

### 10.4 Training Requirements

| Role           | Initial Training            | Ongoing Training            |
| -------------- | --------------------------- | --------------------------- |
| All staff      | Platform operations (8 hrs) | Quarterly refresher (2 hrs) |
| Support        | Customer service (4 hrs)    | Monthly scenarios (1 hr)    |
| Broker Liaison | Aviation compliance (4 hrs) | Annual certification        |
| Compliance     | Regulatory training (8 hrs) | Annual recertification      |

---

## APPENDIX A: QUICK REFERENCE CARDS

### SLA Quick Reference

| Request Type    | Response | Quote  | Confirmation |
| --------------- | -------- | ------ | ------------ |
| Urgent (<6 hrs) | 10 min   | 30 min | 1 hour       |
| Same-Day        | 15 min   | 45 min | 1 hour       |
| Standard        | 30 min   | 2 hrs  | 1 hour       |
| Advance         | 1 hr     | 4 hrs  | 1 hour       |

### Escalation Quick Reference

| Issue             | Contact         | Phone   |
| ----------------- | --------------- | ------- |
| Safety emergency  | Travel Director | [PHONE] |
| Client escalation | Account Manager | [PHONE] |
| Broker issue      | Broker Liaison  | [PHONE] |
| System outage     | Tech Support    | [PHONE] |

### Key Contacts

| Role                | Name            | Phone | Email |
| ------------------- | --------------- | ----- | ----- |
| Travel Director     | TBD             |       |       |
| Chief Executive Air | Jeffrey Menaged |       |       |
| 24/7 Support        |                 |       |       |

---

## DOCUMENT APPROVAL

| Role     | Name     | Signature | Date |
| -------- | -------- | --------- | ---- |
| Author   |          |           |      |
| Reviewer |          |           |      |
| Approver | Dan Kost |           |      |

---

_This SOP is a living document. Updates require Travel Director approval._

_Version 1.0 - Effective January 24, 2026_
