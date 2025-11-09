---
name: cspec:architect
description: Design project architecture or add new features to existing architecture
---

Design project-wide architecture OR add new features to an existing architecture.

**Usage:**
- `/cspec:architect` - Create project architecture OR add feature to existing
- `/cspec:architect [feature-name]` - Add specific feature to existing architecture

**Purpose:**
- **First time:** Create the master architecture, feature roadmap, and development guidelines
- **Subsequent times:** Add new features to the existing architecture

## What This Creates

**First time (no architecture exists):**
```
.specs/
├── architecture.md       # Master project architecture
├── roadmap.yml          # Feature roadmap with priorities
└── guidelines.md        # Development standards and patterns
```

**Subsequent times (architecture exists):**
- Adds feature to `.specs/roadmap.yml`
- Updates `.specs/architecture.md` with new ADRs if needed
- Updates `.specs/guidelines.md` if new patterns introduced
- Optionally creates task in `tasks/` to start immediately (via /cspec:task)

## Process

### 1. Check for Existing Architecture

**If `.specs/architecture.md` does NOT exist:**
- Skip to Step 2 (Create Full Project Architecture)

**If `.specs/architecture.md` EXISTS:**

```
✓ Project architecture exists.

What would you like to do?

Options:
1. Add a new feature to the roadmap
2. Review and update the entire architecture
3. Overwrite with new architecture (destructive - loses ADRs)
4. Cancel
```

Use **AskUserQuestion** to get choice.

**If Option 1 selected:** Go to Step 1A (Add Feature Mode)
**If Option 2 selected:** Go to Step 2 (create full architecture, but read existing first)
**If Option 3 selected:** Go to Step 2 (overwrite)
**If Option 4 selected:** Stop

---

### 1A. Add Feature Mode (When Architecture Exists)

This mode adds a new feature to an existing architecture.

#### 1A.1. Get Feature Name

**If feature name provided in command** (e.g., `/cspec:architect real-time-notifications`):
- Use that name
- Skip to Step 1A.2

**If NO feature name provided:**

Ask user for the feature name:
```
What feature would you like to add?

Enter feature name (kebab-case):
```

Wait for user input. Convert to kebab-case if needed.

#### 1A.2. Read Existing Project Context

Read these files to understand the project:

**A) Read `.specs/architecture.md`**
- Understand current architecture pattern
- Note all existing ADRs
- Identify current tech stack
- Note security approach
- Understand domain model

**B) Read `.specs/roadmap.yml`**
- Count existing features
- Find next feature ID (e.g., if F12 exists, next is F13)
- Identify existing phases
- Check for similar features

**C) Read `.specs/guidelines.md`**
- Understand coding standards
- Note testing requirements
- Review security checklist

**D) Read `CLAUDE.md`**
- App folder configuration
- Current dependencies
- Project structure

#### 1A.3. Feature Planning Questions

Ask targeted questions about the NEW feature using **AskUserQuestion**:

**Batch 1: Feature Context**
```
Question 1: What problem does this feature solve?
Options:
- New user-facing functionality
- Performance improvement
- Security enhancement
- Integration with external service
- Developer experience improvement
- Technical debt reduction

Question 2: What is the priority of this feature?
Options:
- Critical (blocks other work)
- High (important for upcoming release)
- Medium (nice to have)
- Low (future consideration)

Question 3: Estimated complexity?
Options:
- Small (1-3 days)
- Medium (4-7 days)
- Large (1-2 weeks)
- Very Large (2+ weeks)
```

**Batch 2: Integration & Dependencies**
```
Question 4: Does this feature depend on any existing features?
Options (multi-select):
- [List existing features from roadmap]
- No dependencies

Question 5: Does this feature span multiple domains?
Options:
- Yes - Backend + Frontend
- Yes - Backend + Frontend + DevOps
- No - Single domain only

Question 6: Does this introduce new architectural patterns?
Options:
- Yes - Uses new technology/pattern
- No - Uses existing patterns
```

#### 1A.4. Analyze Feature Requirements

Use the **Task tool with Plan subagent** to analyze what this feature needs:

```
Analyze requirements for the new feature: [feature-name]

**Existing Project Architecture:**
[Include relevant sections from architecture.md]

**Feature Description:**
[From user's answers]

**Your Task:**
1. **Architecture Alignment:**
   - Does this fit existing architecture pattern?
   - Which existing ADRs apply?
   - Does this require new ADRs?

2. **Integration Analysis:**
   - How does this integrate with existing features?
   - What existing components can be reused?
   - What new components are needed?

3. **Technical Approach:**
   - Recommended implementation approach
   - Data model changes (if any)
   - API endpoints needed (if any)
   - Frontend components needed (if any)

4. **Risk Assessment:**
   - Breaking changes?
   - Performance impact?
   - Security considerations?
   - Migration needs?

5. **Testing Strategy:**
   - What needs to be tested?
   - Integration test requirements?
   - E2E test scenarios?

Provide comprehensive analysis for adding this feature to the existing architecture.
```

**Thoroughness Level:** very thorough

#### 1A.5. Create or Update ADRs

**If new architectural patterns are introduced:**

Add new ADR to `.specs/architecture.md`:

```markdown
### ADR-0XX: [New Decision Title]

**Status:** Accepted
**Date:** [Current Date]
**Context:** Adding [feature-name] requires [new approach/technology]

**Decision:**
We will use [approach] for [reason].

**Consequences:**
- **Positive:** [Benefits]
- **Negative:** [Trade-offs]

**Alternatives Considered:**
- [Alternative 1]: [Why rejected]
- [Alternative 2]: [Why rejected]

**Related Features:**
- [feature-name] (the feature introducing this)
```

**If using existing patterns:**
- Note which ADRs this feature follows
- No new ADRs needed

#### 1A.6. Add Feature to Roadmap

**Update `.specs/roadmap.yml`:**

1. Find the appropriate phase (or create new phase if needed)
2. Generate next feature ID (F13, F14, etc.)
3. Add the feature entry:

```yaml
features:
  - id: "F13"
    name: "[feature-name]"
    description: "[Brief description from planning]"
    priority: "[critical/high/medium/low]"
    estimated_days: [From complexity estimate]
    status: "not_started"
    started: null
    completed: null
    dependencies: [List of feature IDs from Question 4]
    domains: [List from Question 5]
    tags: []
    assigned_to: null
    notes: "[Any special notes from analysis]"
```

4. Update `progress_summary`:
   - Increment `total_features`
   - Increment `not_started_features`
   - Recalculate totals

#### 1A.7. Update Guidelines (If Needed)

**If new patterns or technologies introduced:**

Update `.specs/guidelines.md` with:
- New code organization patterns
- New naming conventions (if applicable)
- New testing patterns
- New dependencies to manage
- Security considerations for new tech

**Example addition:**
```markdown
### WebSocket Connections (Added for real-time-notifications)

**Connection Management:**
- Use Socket.IO library
- Authenticate on connection
- Heartbeat every 30s
- Reconnect with exponential backoff

**Testing:**
- Mock Socket.IO in unit tests
- Integration tests with test WebSocket server
```

#### 1A.8. Present Feature Addition

Show the user what was added:

```
✅ Feature Added to Architecture

📋 Feature Details:
- ID: F13
- Name: [feature-name]
- Priority: [priority]
- Estimated: [X days]
- Dependencies: [list or "None"]
- Phase: [phase name]

📐 Architecture Updates:
[If new ADRs]
- Added ADR-0XX: [Decision title]

[If no new ADRs]
- Follows existing ADR-003 ([existing decision])
- Uses established [pattern name] pattern

📝 Files Updated:
- .specs/roadmap.yml (added F13)
[If ADRs added]
- .specs/architecture.md (added ADR-0XX)
[If guidelines updated]
- .specs/guidelines.md (added [pattern] guidelines)

---

🎯 Next Steps:

Option 1: Start working on this feature now
  Run: /cspec:task [feature-name]

Option 2: Continue adding more features
  Run: /cspec:architect [another-feature-name]

Option 3: Review the roadmap
  Open: .specs/roadmap.yml

✅ Feature successfully added to project architecture!
```

**Stop here.** User can now use `/cspec:task [feature-name]` to start work.

---

### 2. Review Project Configuration

**IMPORTANT:** Read `CLAUDE.md` (if exists) to understand:
- Current project structure and conventions
- App folder configuration
- Tech stack in use
- Existing patterns

This informs the architecture creation.

### 3. Comprehensive Project Questions (Plan Mode)

Ask the user questions about the **entire project** using **AskUserQuestion with batched questions**.

**Batch 1: Project Context**

```
Question 1: What type of project is this?
Options:
- Web Application (Full-stack)
- REST API / Backend Service
- Frontend Application (SPA/PWA)
- Mobile Application
- Desktop Application
- Library/Package
- Microservices System

Question 2: What is the primary business goal?
Options:
- E-commerce platform
- SaaS product
- Internal tool/dashboard
- Content management
- Social/community platform
- Data analytics platform
- Other (describe)

Question 3: Who are the primary users?
Options:
- End consumers (public)
- Business users (B2B)
- Internal employees
- Developers (API consumers)
- Mixed audience
```

**Batch 2: Technical Foundation**

```
Question 4: What is the current project state?
Options:
- Brand new (greenfield)
- Existing project (add architecture)
- Partial implementation (document & extend)

Question 5: What is the expected scale?
Options:
- Small (< 1K users, simple data)
- Medium (1K-100K users, moderate complexity)
- Large (100K-1M users, high complexity)
- Enterprise (1M+ users, very high complexity)

Question 6: What are the critical non-functional requirements?
Options (multi-select):
- High performance (< 100ms response)
- High availability (99.9%+ uptime)
- Strong security (compliance required)
- Scalability (handle traffic spikes)
- Offline support
- Real-time features
```

**Batch 3: Development Approach**

```
Question 7: What testing strategy should the project follow?
Options:
- TDD (Test-driven development)
- Balanced (Tests alongside features)
- Minimal (Essential tests only)

Question 8: Will features span multiple domains?
Options:
- Yes - Enable multi-agent mode (backend + frontend + devops)
- No - Standard single-agent implementation

[If Yes to Question 8]
Question 9: Use MCP servers for enhanced domain expert tools?
Options:
- Yes - Use MCP servers (requires installation)
- Fallback - Try MCP, fallback to prompt-based (recommended)
- No - Prompt-based only
```

### 4. Codebase Analysis (If Existing Project)

**If project state is "Existing project" or "Partial implementation":**

Use the Task tool with Plan subagent (very thorough) to analyze the entire codebase:

```
Analyze the entire codebase to understand the current architecture:

1. **Project Structure**: Identify all major directories and their purposes
2. **Tech Stack Detection**:
   - Language(s) and versions
   - Frameworks and libraries
   - Database systems
   - Build tools and package managers
3. **Current Architecture**:
   - Application architecture pattern (MVC, layered, microservices, etc.)
   - Component organization
   - Module boundaries
4. **Existing Patterns**:
   - API design patterns
   - Database patterns (ORM, queries, migrations)
   - Authentication/authorization approach
   - Error handling patterns
   - Testing patterns
5. **Integration Points**:
   - External services
   - Third-party APIs
   - Internal service communication
6. **Code Quality Assessment**:
   - Test coverage (if tests exist)
   - Documentation level
   - Code organization quality
   - Technical debt areas
7. **Security Posture**:
   - Authentication mechanisms
   - Authorization patterns
   - Data protection approaches
   - Identified vulnerabilities
8. **Feature Inventory**:
   - List all implemented features
   - Identify incomplete features
   - Suggest potential new features

Provide a comprehensive analysis that will inform the architecture design.
```

**Thoroughness Level:** very thorough

**If brand new project:** Skip analysis, proceed to Step 5.

### 5. Create Project Architecture

**Create: `.specs/architecture.md`**

Use insights from Steps 3-4 to create a comprehensive project architecture.

**Structure:**

```markdown
# Project Architecture: [Project Name]

**Created:** [Date]
**Status:** Planning
**Project Type:** [From questions]
**Scale:** [From questions]

---

## Executive Summary

**Vision:** [What this project aims to achieve]

**Core Objectives:**
- [Objective 1]
- [Objective 2]
- [Objective 3]

**Key Constraints:**
- [Constraint 1: e.g., Must support offline mode]
- [Constraint 2: e.g., Must comply with GDPR]
- [Constraint 3: e.g., Budget: $X/month infrastructure]

**Success Metrics:**
- [Metric 1: e.g., Handle 10K concurrent users]
- [Metric 2: e.g., < 200ms API response time]
- [Metric 3: e.g., 99.9% uptime]

---

## System Architecture

### High-Level Architecture

[Text-based architecture diagram]

```
┌─────────────────────────────────────────────────────┐
│                  Client Layer                       │
│  (Web Browser / Mobile App / API Consumers)         │
└────────────────┬────────────────────────────────────┘
                 │ HTTPS/WebSocket
┌────────────────▼────────────────────────────────────┐
│              API Gateway / Load Balancer            │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│             Application Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Auth      │  │  Business   │  │   Admin     │ │
│  │  Service    │  │   Logic     │  │   Panel     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  PostgreSQL │  │    Redis    │  │  S3/Blob    │ │
│  │  (Primary)  │  │   (Cache)   │  │  Storage    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Architecture Pattern

**Chosen Pattern:** [e.g., Layered Architecture / Microservices / Monolith]

**Rationale:** [Why this pattern fits the project requirements]

**Trade-offs:**
- **Pros:** [Benefits of this approach]
- **Cons:** [Drawbacks and how we'll mitigate]

### Core Components

#### 1. [Component Name]
**Purpose:** [What it does]
**Responsibilities:**
- [Responsibility 1]
- [Responsibility 2]

**Technologies:** [Tech stack for this component]
**Interfaces:** [How other components interact with it]

[Repeat for each major component]

### Data Flow

**Primary User Flow:**
```
1. User authenticates → JWT issued
2. User requests resource → Token validated
3. Business logic executes → Data queried
4. Response formatted → Sent to client
```

**Background Processes:**
```
1. Scheduled jobs (cron/queue)
2. Event handlers
3. Webhooks
```

### Integration Architecture

**External Services:**
- **[Service Name]:** [Purpose, how integrated]
- **[Service Name]:** [Purpose, how integrated]

**API Design:**
- REST endpoints for CRUD operations
- WebSocket for real-time features
- GraphQL for complex queries (if applicable)

---

## Technical Decisions (ADRs)

### ADR-001: Programming Language Selection

**Status:** Accepted
**Date:** [Date]

**Context:**
[Why we needed to make this decision]

**Decision:**
We will use [Language] for [reasons].

**Consequences:**
- **Positive:** [Benefits]
- **Negative:** [Trade-offs]

**Alternatives Considered:**
- **[Alternative 1]:** [Why rejected]
- **[Alternative 2]:** [Why rejected]

---

### ADR-002: Database Choice

**Status:** Accepted
**Date:** [Date]

**Context:**
[Data requirements, scale, consistency needs]

**Decision:**
We will use [Database] because [rationale].

**Consequences:**
- **Positive:** [Benefits]
- **Negative:** [Trade-offs]

---

### ADR-003: Authentication Strategy

**Status:** Accepted
**Date:** [Date]

**Context:**
[Security requirements, user experience needs]

**Decision:**
We will use [JWT/Session/OAuth2] for authentication.

**Consequences:**
- **Positive:** [Benefits]
- **Negative:** [Trade-offs]

---

[Continue with more ADRs covering:]
- API design (REST vs GraphQL)
- State management (frontend)
- Deployment strategy
- Testing approach
- Error handling
- Logging/monitoring
- etc.

---

## Domain Model

### Core Entities

**User**
```yaml
User:
  id: uuid
  email: string (unique)
  password_hash: string
  role: enum [admin, user, guest]
  created_at: timestamp
  updated_at: timestamp

Relationships:
  - has_many: UserSessions
  - has_many: UserProfiles
```

**[Other Core Entities]**
[Define all major entities]

### Business Rules

1. **Authentication:**
   - Users must verify email before accessing features
   - Sessions expire after 24 hours
   - Failed login attempts lock account after 5 tries

2. **Authorization:**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - Admin can access all resources

3. **Data Integrity:**
   - Soft deletes for user data
   - Audit trail for sensitive operations
   - Foreign key constraints enforced

---

## Security Architecture

### OWASP Top 10 Compliance

**A01 - Broken Access Control**
- Middleware validates JWT on all protected endpoints
- Role-based authorization checks
- Resource ownership verification
- API rate limiting per user

**A02 - Cryptographic Failures**
- Passwords hashed with bcrypt (cost 12)
- Sensitive data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- Secrets in environment variables (never in code)

**A03 - Injection**
- Parameterized queries (ORM prevents SQL injection)
- Input validation with schema validators
- Output encoding prevents XSS
- Content Security Policy headers

**A04-A10:** [Document mitigations for all applicable OWASP items]

### Authentication & Authorization

**Authentication Flow:**
```
1. User submits credentials
2. Backend validates (bcrypt compare)
3. JWT generated with claims {userId, role, exp}
4. Token returned to client
5. Client includes token in Authorization header
6. Middleware validates signature and expiration
```

**Authorization Strategy:**
- JWT contains role claim
- Endpoint middleware checks required role
- Resource access checks ownership
- Admin bypass for support purposes

### Data Protection

**PII Handling:**
- Minimal data collection
- Encrypted at rest
- Access logging
- Automatic purging after retention period

**Secrets Management:**
- Environment variables for all secrets
- Different secrets per environment
- Rotation policy: every 90 days
- No secrets in version control

---

## Infrastructure Architecture

### Deployment Architecture

**Environments:**
- **Development:** Local Docker Compose
- **Staging:** [Cloud provider] with production parity
- **Production:** [Cloud provider] with redundancy

**Components:**
- **Application Servers:** [Technology, scaling strategy]
- **Database:** [Managed service, backup strategy]
- **Cache:** [Redis/Memcached, invalidation strategy]
- **Storage:** [S3/Blob, CDN integration]
- **Queue:** [RabbitMQ/SQS, worker configuration]

**Scaling Strategy:**
- Horizontal scaling for app servers
- Read replicas for database
- CDN for static assets
- Auto-scaling based on CPU/memory

### CI/CD Pipeline

**Continuous Integration:**
```
1. Code pushed to Git
2. Linting and type checking
3. Unit tests run
4. Integration tests run
5. Security scanning (dependencies, SAST)
6. Build artifacts created
```

**Continuous Deployment:**
```
Staging:
1. Auto-deploy on merge to develop
2. Smoke tests
3. Notify team

Production:
1. Manual approval required
2. Blue-green deployment
3. Health checks
4. Rollback capability
```

### Monitoring & Observability

**Logging:**
- Structured JSON logs
- Log levels: DEBUG (dev), INFO (prod)
- Centralized logging ([ELK/CloudWatch/etc.])
- Log retention: 30 days

**Metrics:**
- Application metrics (response time, error rate)
- Infrastructure metrics (CPU, memory, disk)
- Business metrics (signups, conversions)
- Alerting thresholds defined

**Tracing:**
- Distributed tracing for requests
- Performance profiling
- Error tracking ([Sentry/Rollbar])

---

## Development Standards

### Code Organization

**Directory Structure:**
```
[app-folder]/
├── src/
│   ├── api/              # API endpoints
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── middleware/       # Express/framework middleware
│   ├── utils/            # Utility functions
│   └── config/           # Configuration
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                 # Documentation
└── scripts/              # Build/deployment scripts
```

### Naming Conventions

**Files:**
- `kebab-case.ts` for files
- `PascalCase.tsx` for React components

**Code:**
- `camelCase` for variables and functions
- `PascalCase` for classes and types
- `UPPER_CASE` for constants
- `_privateMethod` for private methods (prefix underscore)

**Database:**
- `snake_case` for table and column names
- Plural table names (`users`, not `user`)

### Testing Requirements

**Coverage Targets:**
- Overall: 80% minimum
- Critical paths: 100%
- New code: Must include tests

**Test Pyramid:**
- 60% Unit tests (fast, isolated)
- 30% Integration tests (API, database)
- 10% E2E tests (critical flows)

**Test Patterns:**
- AAA pattern (Arrange, Act, Assert)
- One assertion per test (where possible)
- Descriptive test names (`it('should reject invalid email format')`)

### Documentation Standards

**Code Documentation:**
- JSDoc/docstrings for all public functions
- README in each major module
- Inline comments for complex logic

**API Documentation:**
- OpenAPI/Swagger spec
- Example requests/responses
- Error codes documented

---

## Performance Requirements

### Response Time Targets

| Operation Type | Target | Maximum |
|---------------|--------|---------|
| API Read | < 100ms | < 200ms |
| API Write | < 200ms | < 500ms |
| Page Load | < 1s | < 2s |
| Search | < 300ms | < 1s |

### Scalability Targets

- **Concurrent Users:** [Target number]
- **Requests Per Second:** [Target RPS]
- **Database Size:** [Expected max size]
- **Storage Growth:** [Expected growth rate]

### Optimization Strategies

- Database query optimization (indexes, query analysis)
- Response caching (Redis)
- CDN for static assets
- Lazy loading for frontend
- Database connection pooling
- Pagination for large datasets

---

## Risk Assessment

### Technical Risks

**High Priority:**

**Risk:** Database scalability limitations
- **Impact:** Performance degradation at scale
- **Probability:** Medium
- **Mitigation:**
  - Start with proper indexing
  - Plan for read replicas
  - Monitor query performance
- **Contingency:** Consider sharding or NoSQL for specific use cases

**Risk:** Third-party API dependency failure
- **Impact:** Feature unavailable
- **Probability:** Low
- **Mitigation:**
  - Circuit breaker pattern
  - Fallback mechanisms
  - Status page monitoring
- **Contingency:** Manual processing workflow

**Medium Priority:**
[Additional risks...]

**Low Priority:**
[Additional risks...]

---

## Implementation Roadmap

See `.specs/roadmap.yml` for detailed feature breakdown and timeline.

**High-Level Phases:**

1. **Foundation** (Weeks 1-2)
   - Project setup and configuration
   - Database schema
   - Authentication system
   - Development environment

2. **Core Features** (Weeks 3-8)
   - [Feature 1]
   - [Feature 2]
   - [Feature 3]

3. **Advanced Features** (Weeks 9-12)
   - [Feature 4]
   - [Feature 5]

4. **Polish & Launch** (Weeks 13-14)
   - Performance optimization
   - Security audit
   - Documentation
   - Production deployment

---

## Future Considerations

**Not in Initial Scope:**
- [Feature X] - Planned for v2.0
- [Feature Y] - Requires more user research
- [Feature Z] - Nice to have, low priority

**Technology Evolution:**
- [Potential migration to X]
- [Consider adopting Y when mature]

---

**Document Version:** 1.0
**Last Updated:** [Date]
**Next Review:** [Date]
**Owner:** [Team/Person]
```

### 6. Create Feature Roadmap

**Create: `.specs/roadmap.yml`**

Based on project scope and architecture, create a comprehensive feature roadmap.

Use the template at `.specs/template/roadmap.yml.template` as the base structure.

**Key sections:**
- `metadata`: Project info, timeline
- `phases`: Group features by phase (Foundation, Core, Polish)
- `features`: Each feature with:
  - `id`: Unique identifier (F1, F2, F3...)
  - `name`: Kebab-case feature name
  - `description`: Brief description
  - `priority`: critical/high/medium/low
  - `estimated_days`: Time estimate
  - `status`: not_started/in_progress/completed
  - `dependencies`: Array of feature IDs this depends on
  - `domains`: Array of domains (if multi-agent mode)

**IMPORTANT:** Base features on:
- Questions answered in Step 3
- Codebase analysis from Step 4
- Architecture created in Step 5

### 7. Create Development Guidelines

**Create: `.specs/guidelines.md`**

Extract and formalize development standards from the architecture.

Use the template at `.specs/template/guidelines.md.template` as the base structure.

**Key sections:**
- Code organization and structure
- Naming conventions (from architecture)
- Testing requirements (from architecture)
- Security checklist (OWASP from architecture)
- Performance budgets
- Documentation requirements
- Git workflow
- Code review process

### 8. Update CLAUDE.md if Needed

**If CLAUDE.md does not exist:**
- Inform user: "No CLAUDE.md found. Run `/cspec:configure` or `/cspec:create` first."

**If CLAUDE.md exists:**
- Review if updates are needed based on architecture decisions
- Update Dependencies section if new tech added
- Update Project Structure if new directories planned
- Keep changes minimal and focused

### 9. Present Architecture & Roadmap

Show the user a comprehensive summary:

```
✅ Project Architecture Complete: [Project Name]

📐 System Architecture:
- Pattern: [Architecture pattern]
- Components: [X major components]
- Tech Stack: [Summary]

🎯 Key Decisions (ADRs):
- ADR-001: [Decision summary]
- ADR-002: [Decision summary]
- ADR-003: [Decision summary]
[List first 5 ADRs]

🔐 Security:
- OWASP Top 10 compliance strategy
- [Authentication approach]
- [Data protection approach]

📋 Feature Roadmap:
Phase 1 - Foundation ([X features]):
  - F1: [feature-name] ([priority], [X days])
  - F2: [feature-name] ([priority], [X days])

Phase 2 - Core Features ([Y features]):
  - F3: [feature-name] ([priority], [X days])
  - F4: [feature-name] ([priority], [X days])

Phase 3 - Polish ([Z features]):
  - F5: [feature-name] ([priority], [X days])

Total: [N features] across [M phases]
Estimated: [X weeks/months]

📂 Files Created:
- .specs/architecture.md (master architecture & ADRs)
- .specs/roadmap.yml (feature roadmap)
- .specs/guidelines.md (development standards)

📝 CLAUDE.md Updates:
- [Any updates made, or "No updates needed"]

---

📖 Next Steps:
1. Review architecture.md for complete technical design
2. Review roadmap.yml to see all planned features
3. Run `/cspec:task [feature-name]` to start working on a feature

Example:
  /cspec:task user-authentication

✅ Project architecture complete. Ready to begin feature development!
```

**DO NOT start any implementation.** Present the architecture and stop.

### 10. Complete Planning

Once all files are created, the project architecture is complete.

Users can now:
1. Review the master architecture
2. Understand the full feature scope
3. Start working on features with `/cspec:task [feature-name]`

## Tips for Good Project Architecture

- **Be comprehensive:** Cover all major aspects of the project
- **Be realistic:** Don't over-architect for current needs
- **Be flexible:** Architecture should guide, not constrain
- **Be specific:** Concrete decisions with clear rationale
- **Think long-term:** Consider evolution and scaling
- **Document decisions:** ADRs explain the "why"
- **Consider security:** OWASP compliance from day one
- **Plan for observability:** Monitoring and logging built in

## Edge Cases

**If project is very large:**
- Create high-level roadmap with epics
- Each epic can be broken down further with `/cspec:task`
- Keep initial architecture focused on foundation

**If project is already built:**
- Document existing architecture
- Create roadmap for remaining/new features
- Note technical debt and refactoring needs

**If unclear requirements:**
- Ask more questions
- Mark unclear items with `[NEEDS INVESTIGATION]`
- Create minimal roadmap with known features

## Success Criteria

- Architecture.md contains comprehensive project design
- Roadmap.yml has complete feature breakdown
- Guidelines.md establishes clear standards
- All ADRs have clear rationale
- Security considerations documented (OWASP)
- Infrastructure and deployment strategy defined
- Ready to start feature development with `/cspec:task`
