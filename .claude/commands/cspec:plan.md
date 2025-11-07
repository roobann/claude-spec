---
name: cspec:plan
description: Start a new feature with comprehensive planning in plan mode
---

Plan and create a specification for a new feature.

**Usage:** `/plan [feature-name]`

**Example:** `/plan user-authentication`

## Process

### 1. Review Project Configuration

**IMPORTANT:** Before starting, read `CLAUDE.md` to understand:
- Project structure and conventions
- App folder configuration (if specified in Tech Stack section)
- Code style guidelines
- Existing patterns and conventions

**App Folder Awareness:**
If the Tech Stack section in CLAUDE.md specifies an "App Folder" (e.g., `backend/`, `frontend/`), all new application code should be created within that folder. Keep this in mind when:
- Researching existing code (search within the app folder)
- Planning file locations in the spec
- Creating directory paths in the technical design

### 2. Clarify Requirements

Ask the user clarifying questions about the feature:

- What problem does this solve?
- Who is this for? (users, admins, developers, etc.)
- What are the key functional requirements?
- Are there any technical constraints?
- Are there any design requirements (UI/UX)?
- What are the success criteria?
- Any dependencies on other features?
- Priority level? (must-have, should-have, nice-to-have)

**Use AskUserQuestion for Test-Driven Development approach:**

```
Should this feature use Test-Driven Development (TDD)?
```
Options:
- "Yes - Write tests first (TDD approach)"
- "No - Focus on implementation, minimal tests"
- "Balanced - Tests alongside implementation"

**Impact on task breakdown:**
- **TDD (Yes)**: Each phase includes test writing BEFORE implementation
- **Minimal (No)**: Single test phase at the end, focus on functionality
- **Balanced**: Tests integrated into implementation phases

**Use AskUserQuestion for Multi-Agent Mode:**

```
Does this feature span multiple domains (backend, frontend, DevOps)?
```
Options:
- "Yes - Enable multi-agent mode with domain experts"
- "No - Standard single-agent implementation"

**Impact on planning:**
- **Multi-Agent Mode (Yes)**:
  - Identify all domains involved (backend, frontend, devops, database, infrastructure)
  - Create domain-specific technical design sections
  - Label tasks with domain assignments
  - Enable agent coordination for spawning domain experts during implementation
- **Standard (No)**:
  - Use standard technical_design structure
  - Tasks run sequentially by single agent

**Use AskUserQuestion for MCP Integration:**

If Multi-Agent Mode is enabled, ask:

```
Use MCP-based domain experts with specialized tools (database queries, browser automation, Docker management)?
```
Options:
- "Yes - Use MCP servers for domain experts (requires installation)"
- "No - Use prompt-based domain experts (no installation needed)"
- "Fallback - Try MCP, fallback to prompt-based if unavailable"

**Impact on spec.yml:**
- **MCP Enabled (Yes)**:
  - Set `metadata.mcp_integration.enabled: true`
  - Set `metadata.mcp_integration.fallback_to_prompt: false`
  - List MCP server names for each domain
  - Requires: `npm install -g @claude-spec/[domain]-mcp-server`
  - Benefits: Direct tool access (query_database, run_browser, check_container_status, etc.)
- **Prompt-Based (No)**:
  - Set `metadata.mcp_integration.enabled: false`
  - No installation required
  - Domain experts use general tools only
- **Fallback (Recommended)**:
  - Set `metadata.mcp_integration.enabled: true`
  - Set `metadata.mcp_integration.fallback_to_prompt: true`
  - Automatically uses MCP if available, otherwise uses prompt-based
  - Best of both worlds

**Available MCP Servers:**
- `@claude-spec/backend-mcp-server` - Database queries, API testing, migrations
- `@claude-spec/frontend-mcp-server` - Browser automation, UI testing, screenshots
- `@claude-spec/devops-mcp-server` - Docker management, deployment, logs

See `docs/MCP_INTEGRATION.md` for installation instructions.

Get enough information to create a complete specification.

### 3. Research Existing Code with Plan Agent

**IMPORTANT:** Use the Task tool with Plan subagent (very thorough) to comprehensively analyze the codebase before planning.

Launch Plan agent with this prompt structure:

```
Analyze the codebase to prepare for implementing [feature-name]:

1. **App Folder Context**: Read CLAUDE.md to identify the app folder (if specified in Tech Stack section)
2. **Search Strategy**: Focus all searches within the app folder if specified
3. **Related Features**: Find similar features or patterns already implemented
4. **Reusable Components**: Identify existing components/utilities that can be reused
5. **Conventions**: Check established conventions:
   - API patterns and endpoint structure
   - Component/class naming conventions
   - Database schema patterns
   - Error handling approaches
   - Testing patterns
6. **Code Location**: Identify where new code should live based on existing structure
7. **Dependencies**: Check what dependencies are already available
8. **Test Patterns**: Find existing test examples to follow

Provide a comprehensive summary including:
- Key files/patterns to reference
- Reusable components
- Recommended file locations (respecting app folder)
- Conventions to follow
- Any potential conflicts or considerations
```

**Thoroughness Level:** very thorough

This ensures comprehensive codebase understanding before creating the specification.

### 4. Handle Active Task

Check if `.specs/active-task/` exists and contains files:
- If it does, ask user: "There's already an active task. Do you want to:
  1. Archive it first (recommended)
  2. Overwrite it
  3. Cancel and continue with current task"

Create or clear directory: `.specs/active-task/`

**Note on feature naming:**
- Feature name from command (e.g., `user-authentication`) is used for:
  - Archive folder name when task is completed: `.specs/completed-tasks/user-authentication/`
  - Documentation and reference
- Use kebab-case (lowercase with hyphens)
- Keep it concise and descriptive
- No dates needed (tracked in spec.md metadata)

### 5. Create Specification (spec.yml)

**Use the YAML template** at `.specs/template/spec.yml.template` as the base structure.

**Key sections to fill in:**

- `metadata`: Feature name, date, status, priority
  - **Multi-Agent Mode**: Set `agent_coordination: true` and list `domains` (e.g., [backend, frontend, devops])
- `overview`: Description, user problem, user stories
- `requirements.functional`: List functional requirements with IDs and acceptance criteria
- `requirements.non_functional`: Performance, security (reference CLAUDE.md), accessibility
- `requirements.non_functional.security`: Document applicable OWASP Top 10 mitigations (see CLAUDE.md "Security - OWASP Top 10")
- `technical_design`: Architecture, components, data models, API endpoints, dependencies
  - **Standard Mode**: Use top-level `architecture`, `components`, `api_endpoints`, etc.
  - **Multi-Agent Mode**: Fill in `domain_design` section with domain-specific subsections (backend, frontend, devops, etc.)
- `technical_design.logging`: Debug logging config (see CLAUDE.md "Development Best Practices")
- `testing`: Strategy (TDD/minimal/balanced), test cases
- `testing.test_credentials`: Test users and credentials (see CLAUDE.md "Test Credentials & Data")
- `success_criteria`: How we know feature is complete
- `risks`: Potential issues and mitigations
- `out_of_scope`: What's explicitly excluded
- `future_enhancements`: Ideas for later

**IMPORTANT Guidelines:**
- Ensure all file paths respect the app folder structure from CLAUDE.md
- Reference CLAUDE.md sections for security, test credentials, and Docker rules (don't duplicate)
- Use structured YAML format for better token efficiency
- Include specific acceptance criteria for each requirement
- Document OWASP security considerations relevant to this feature

**Multi-Agent Mode Specifics:**

When `agent_coordination: true`, populate `technical_design.domain_design` with sections for each domain:

```yaml
domain_design:
  backend:
    architecture:
      approach: "JWT-based authentication"
    components:
      created:
        - name: "AuthController"
          location: "backend/src/controllers/auth.controller.ts"
    api_endpoints:
      - method: "POST"
        path: "/api/auth/login"
    dependencies:
      external:
        - name: "jsonwebtoken"
          version: "^9.0.0"

  frontend:
    architecture:
      approach: "React Context for auth state"
    components:
      created:
        - name: "LoginForm"
          location: "frontend/src/components/LoginForm.tsx"
    ui_components:
      - "LoginForm with validation"
      - "AuthContext provider"
    state_management: "React Context API"
```

This enables domain experts to understand their specific responsibilities.

### 6. Create Progress Tracker (progress.yml)

**Use the YAML template** at `.specs/template/progress.yml.template` as the base structure.

**Key sections to fill in:**

- `metadata`: Feature name, status (not_started), dates, current phase (0=planning), testing approach
  - **Multi-Agent Mode**: Set `agent_coordination: true`, `current_domain: null`, list `domains`
- `progress_summary`: Total phases (usually 3), task counts (will update as work progresses)
  - **Multi-Agent Mode**: Include `by_domain` with per-domain task counts
- `phases`: Array of 3 phases with tasks broken down based on testing approach:
  - **Phase 1**: Setup & Foundation (dependencies, structure, test framework if TDD)
  - **Phase 2**: Core Implementation (main feature logic, with or without tests depending on approach)
  - **Phase 3**: Testing & Polish (final tests, edge cases, optimization)
  - **Multi-Agent Mode**: Add `domain`, `assigned_agent`, and `dependencies` fields to each task
- `current_work`: Initially null (will be filled during implementation)
- `next_steps`: Initial actions (review spec, begin Phase 1)
- `decisions`: Log planning decisions made
- `time_tracking`: Estimated hours for the feature

**Task Breakdown Strategy by Testing Approach:**

**If TDD (Write tests first):**
- Phase 1: Set up test environment and fixtures, write tests for components
- Phase 2: Implement components to pass tests, refactor and optimize
- Phase 3: Integration tests, edge cases, performance optimization

**If Minimal Testing (Focus on implementation):**
- Phase 1: Set up basic structure, configure dependencies
- Phase 2: Implement all feature components, add error handling
- Phase 3: Add essential tests for critical paths, manual testing, docs

**If Balanced (Tests alongside implementation):**
- Phase 1: Set up structure and test framework, basic configuration
- Phase 2: Implement components + unit tests together, integration tests
- Phase 3: Edge case tests, performance tests, refinement

**Each task should have:**
- Unique ID (T1, T2, T3, etc.)
- Clear description
- Status (pending initially)
- Progress (0 initially)
- **Multi-Agent Mode**: Add `domain` (backend/frontend/devops/etc), `assigned_agent` (backend-expert, frontend-expert, etc), `dependencies` (array of task IDs)

**Multi-Agent Mode Task Assignment:**

When `agent_coordination: true`, assign each task to a domain and identify dependencies:

```yaml
tasks:
  - id: "T1"
    description: "Set up JWT authentication service"
    status: "pending"
    domain: "backend"
    assigned_agent: "backend-expert"
    dependencies: []  # No dependencies, can start immediately

  - id: "T2"
    description: "Create login form component"
    status: "pending"
    domain: "frontend"
    assigned_agent: "frontend-expert"
    dependencies: ["T1"]  # Depends on backend API being complete

  - id: "T3"
    description: "Configure JWT secret in environment"
    status: "pending"
    domain: "devops"
    assigned_agent: "devops-expert"
    dependencies: []
```

**Domain Expert Agents:**
- `backend-expert`: Backend/API implementation, database, business logic
- `frontend-expert`: UI components, state management, user interactions
- `devops-expert`: Infrastructure, deployment, secrets, CI/CD
- `database-expert`: Schema design, migrations, indexes, queries
- `infrastructure-expert`: Cloud resources, networking, scaling

### 7. Create Context Files (context.yml + context.md)

**Hybrid Approach:** Use both YAML for structured metadata and Markdown for human narrative.

**A) Create context.yml** - Use template at `.specs/template/context.yml.template`

**Key sections to fill in:**
- `metadata`: Feature name, dates, status (planning), testing approach
  - **Multi-Agent Mode**: Set `agent_coordination: true`, `current_domain: null`, list `domains`
- `session.focus`: Current focus summary, phase (0=planning), next action
- `session.docker`: rebuild_needed (false initially)
- `session.git`: branch (null initially), file counts (0)
- `files`: active/modified/next_to_modify (all empty initially)
- `status`: working/needs_work (empty initially)
- `architecture`: patterns, related_code, tech_stack (from codebase research)
- **Multi-Agent Mode**: Populate `domain_context` with empty structures for each domain
- `next_session.immediate_actions`: List of next steps with priorities
  - **Multi-Agent Mode**: Add `by_domain` with domain-specific next actions
- `next_session.docker_reminder`: Reference to CLAUDE.md Docker rules

**B) Create context.md** - Use template at `.specs/template/context.md.template`

**Key sections to fill in:**
- Header with dates and status
- "What We're Building": One paragraph summary
- "Current State": Files created, testing strategy, next action
- "Architecture Context": Key decisions and patterns from research
- "Related Files/Patterns": Files to reference from codebase
- "For Next Session": Step-by-step instructions for resuming
- "App Folder Structure": Document app folder from CLAUDE.md
- "Technical Context": Tech stack details
- "Notes": Any additional helpful context

**IMPORTANT:**
- Both files work together: context.yml for machine processing, context.md for human reading
- Document app folder structure from CLAUDE.md in context.md
- Include architecture insights from codebase research in Phase 3
- Reference CLAUDE.md sections (don't duplicate Docker rules, security guidelines, etc.)

### 8. Update CLAUDE.md if Needed

**HIGH PRIORITY:** Review if CLAUDE.md needs updates based on this feature:

**Update CLAUDE.md if:**
- Adding new dependencies not listed
- Introducing new project structure directories
- Adding new commands or scripts
- Establishing new code patterns/conventions
- Adding new testing approaches

**How to update:**
1. Read current CLAUDE.md
2. Identify what section needs updating (Dependencies, Project Structure, Commands, etc.)
3. Make minimal, focused updates
4. Keep changes relevant and concise
5. Don't remove existing important information

**Report what was updated:**
```
📝 Updated CLAUDE.md:
- Added [dependency] to Dependencies section
- Updated Project Structure with [new directory]
```

If no updates needed, skip this step.

### 9. Present Plan

Show the user:
1. Summary of what will be built
2. Key technical decisions
3. Task breakdown with estimated phases
4. Files created (spec.yml, progress.yml, context.yml, context.md)
5. Any CLAUDE.md updates made

**IMPORTANT:** Do NOT start implementation. Present the plan and stop.

### 10. Complete Planning

Once all files are created:
1. Present a concise summary of the plan
2. Show the user the file locations
3. Report any CLAUDE.md updates
4. End with this message:

```
✅ Plan created successfully!

Files created:
- .specs/active-task/spec.yml (specification - YAML format)
- .specs/active-task/progress.yml (task breakdown - YAML format)
- .specs/active-task/context.yml (structured metadata - YAML format)
- .specs/active-task/context.md (human-readable context - Markdown)

Review the plan and run `/cspec:implement` when ready to begin implementation.
```

**DO NOT proceed with implementation.** The user will review and run `/cspec:implement` when ready.

## Tips for Good Specifications

- **Be specific:** Clear, measurable requirements
- **Be realistic:** Don't over-commit on scope
- **Be organized:** Logical task breakdown
- **Be thorough:** Cover edge cases and error states
- **Reference existing code:** Reuse established patterns
- **Think about testing:** Plan for testability from the start

## Edge Cases

**If feature is very small:**
- Create simplified spec with just requirements and tasks
- Skip sections that aren't relevant

**If feature is very large:**
- Consider breaking into multiple smaller features
- Create this spec for Phase 1 only
- Plan future phases separately

**If unclear requirements:**
- Ask more questions before creating spec
- Mark unclear items with `[NEEDS CLARIFICATION]`
- Don't proceed with implementation until clear

## Success Criteria

- Spec.md contains clear, complete requirements
- Progress.md has actionable task breakdown
- Context.md enables easy resumption
- User understands and approves the plan
- Ready to begin implementation
