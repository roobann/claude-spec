---
name: cspec:architect
description: Design feature architecture with comprehensive planning in plan mode
---

Design and create a complete architecture specification for a new feature.

**Usage:** `/cspec:architect [feature-name] [--quick]`

**Examples:**
- `/cspec:architect user-authentication` (full architectural planning)
- `/cspec:architect add-loading-spinner --quick` (streamlined for simple features)

## Parameters

- `feature-name` (required): Kebab-case name for the feature
- `--quick` (optional): Streamlined mode for simple features
  - Skips deep Plan agent analysis
  - Creates simplified architecture.md
  - Asks fewer questions
  - Faster turnaround (~5-10 min vs ~15-30 min)

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
- Planning file locations in the architecture
- Creating directory paths in the technical design

### 2. Comprehensive Requirements Gathering (Plan Mode)

Ask the user clarifying questions about the feature using **AskUserQuestion with batched questions**.

**Batch 1: Feature Context (always ask)**

```
Question 1: What problem does this feature solve?
Options:
- Business value it provides
- User pain point it addresses
- Technical debt it resolves
- Compliance/security requirement

Question 2: Who is the primary user of this feature?
Options:
- End users (customers)
- Administrators
- Developers (API/SDK users)
- System/automation
```

**Batch 2: Technical Approach (always ask)**

```
Question 3: What testing approach should we use?
Options:
- TDD (Write tests first, then implementation)
- Balanced (Tests alongside implementation)
- Minimal (Implementation first, essential tests after)

Question 4: Does this feature span multiple domains?
Options:
- Yes - Enable multi-agent mode (backend + frontend + devops)
- No - Standard single-agent implementation

[If Yes to Question 4]
Question 5: Use MCP servers for enhanced domain expert tools?
Options:
- Yes - Use MCP servers (requires installation, provides direct DB/API/Docker tools)
- Fallback - Try MCP, fallback to prompt-based if unavailable (recommended)
- No - Use prompt-based domain experts only
```

**Batch 3: Architecture Preferences (skip if --quick flag)**

```
Question 6: What is the priority level of this feature?
Options:
- Critical (Production, security-sensitive, customer-facing)
- High (Important feature, moderate impact)
- Medium (Nice to have, low risk)

Question 7: What are the performance requirements?
Options:
- High (< 100ms response time, real-time)
- Medium (< 500ms, interactive)
- Standard (< 2s, acceptable delay)

Question 8: What is the integration complexity?
Options:
- Simple (Isolated feature, minimal dependencies)
- Medium (Integrates with 2-3 existing features)
- Complex (Touches multiple systems, high coupling)
```

Get enough information to create a complete architecture specification.

### 3. Codebase Analysis

**If NOT --quick mode:**

Use the Task tool with Plan subagent (very thorough) to comprehensively analyze the codebase:

```
Analyze the codebase to prepare for implementing [feature-name]:

1. **App Folder Context**: Read CLAUDE.md to identify the app folder (if specified in Tech Stack section)
2. **Search Strategy**: Focus all searches within the app folder if specified
3. **Similar Features**: Find existing patterns already implemented (both good patterns to follow and anti-patterns to avoid)
4. **Reusable Components**: Identify existing components/utilities that can be reused
5. **Conventions**: Check established conventions:
   - API patterns and endpoint structure
   - Component/class naming conventions
   - Database schema patterns (migrations, indexes, foreign keys)
   - Error handling approaches
   - Testing patterns and test file locations
   - Security patterns (OWASP compliance)
6. **Integration Points**: Identify where this feature connects to existing systems
7. **File Locations**: Identify where new code should live based on existing structure
8. **Dependencies**: Check what dependencies are already available (package.json, go.mod, etc.)
9. **Test Patterns**: Find existing test examples to follow
10. **Risks**: Identify potential conflicts, breaking changes, or technical debt

Provide a comprehensive summary including:
- Recommended architecture approach
- Reusable components with file paths
- Recommended file locations (respecting app folder)
- Conventions to follow (with examples)
- Integration strategy
- Risk assessment with mitigations
- Reference files to study (with file:line patterns)
```

**Thoroughness Level:** very thorough

**If --quick mode:**

Perform quick analysis using Grep/Glob:
- Find one similar feature example
- Check app folder from CLAUDE.md
- Identify basic patterns
- Quick scan for dependencies

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
- No dates needed (tracked in spec.yml metadata)

### 5. Create Architecture Document

**Create: `.specs/active-task/architecture.md`**

Use the template at `.specs/template/architecture.md.template` as the base structure.

**For Standard Mode (default):**

Fill in comprehensive architecture document with:
- **Overview**: Problem statement, users, priority, user stories
- **Architecture Decision Records (ADRs)**: Key decisions with rationale, alternatives, trade-offs
- **System Design**: Component architecture, data flow, state management, integration points
- **Technical Specifications**: API endpoints, data models, component interfaces, dependencies
- **Security Architecture**: OWASP Top 10 mitigations, auth flow, authorization strategy
- **Testing Strategy**: Test pyramid, key scenarios, test data requirements
- **Multi-Agent Coordination** (if enabled): Domain breakdown, dependency graph, handoff points
- **Implementation Phases**: Phase breakdown with tasks, dependencies, critical path, risks
- **Risk Assessment**: High/Medium/Low risks with impact and mitigation
- **File Structure**: Where code will live (respecting app folder)
- **References**: Similar features, patterns to follow, components to reuse

**For Quick Mode (--quick flag):**

Create simplified architecture.md with:
- Overview (brief)
- Components (list)
- Implementation phases (basic task breakdown)
- Files to create
- References (one example)

**IMPORTANT Guidelines:**
- Ensure all file paths respect the app folder structure from CLAUDE.md
- Reference insights from codebase analysis (Step 3)
- Include specific Architecture Decision Records (ADRs) for key choices
- Document OWASP security considerations relevant to this feature
- Link related files from codebase (use file:line notation)
- Create task breakdown that maps to implementation phases

### 6. Create Specification (spec.yml)

**Use the YAML template** at `.specs/template/spec.yml.template` as the base structure.

**Key sections to fill in:**

- `metadata`: Feature name, date, status, priority
  - **NEW**: Add `architecture_doc: "architecture.md"` reference
  - **Multi-Agent Mode**: Set `agent_coordination: true` and list `domains`
  - **MCP Integration**: Set `mcp_integration.enabled` based on user answer
- `overview`: Description, user problem, user stories (from architecture.md)
- `requirements.functional`: List functional requirements with IDs and acceptance criteria
- `requirements.non_functional`: Performance, security (reference CLAUDE.md), accessibility
- `requirements.non_functional.security`: Document applicable OWASP Top 10 mitigations (see architecture.md)
- `technical_design`: Architecture, components, data models, API endpoints, dependencies
  - **NEW**: Add `architecture_reference: "See architecture.md for detailed design"`
  - **NEW**: Add `architecture_decisions` array with ADR summaries from architecture.md
  - **Standard Mode**: Use top-level `architecture`, `components`, `api_endpoints`, etc.
  - **Multi-Agent Mode**: Fill in `domain_design` section with domain-specific subsections
- `technical_design.logging`: Debug logging config (see CLAUDE.md "Development Best Practices")
- `testing`: Strategy (TDD/minimal/balanced), test cases (from architecture.md)
- `testing.test_credentials`: Test users and credentials (see CLAUDE.md "Test Credentials & Data")
- `success_criteria`: How we know feature is complete (from architecture.md)
- `risks`: Potential issues and mitigations (from architecture.md risk assessment)
- `out_of_scope`: What's explicitly excluded
- `future_enhancements`: Ideas for later

**IMPORTANT:**
- Reference architecture.md throughout (don't duplicate, just link)
- Use ADRs from architecture.md to fill in architecture_decisions
- Ensure alignment between architecture.md and spec.yml

### 7. Create Progress Tracker (progress.yml)

**Use the YAML template** at `.specs/template/progress.yml.template` as the base structure.

**Key sections to fill in:**

- `metadata`: Feature name, status (not_started), dates, current phase (0=planning), testing approach
  - **NEW**: Add `architecture_doc: "architecture.md"` reference
  - **Multi-Agent Mode**: Set `agent_coordination: true`, `current_domain: null`, list `domains`
- `progress_summary`: Total phases (from architecture.md), task counts
  - **Multi-Agent Mode**: Include `by_domain` with per-domain task counts
- `phases`: Array of phases **directly from architecture.md Implementation Phases section**
  - Use exact task IDs, descriptions, and dependencies from architecture.md
  - **Multi-Agent Mode**: Add `domain`, `assigned_agent`, and `dependencies` fields to each task
- `current_work`: Initially null (will be filled during implementation)
- `next_steps`: Initial actions (review architecture, review spec, begin Phase 1)
- `decisions`: Log planning decisions made (reference ADRs from architecture.md)
- `time_tracking`: Estimated hours for the feature

**IMPORTANT:**
- Task breakdown comes from architecture.md (single source of truth)
- Ensure task IDs match between architecture.md and progress.yml
- Dependencies should form a valid DAG (no circular dependencies)

### 8. Create Context Files (context.yml + context.md)

**Hybrid Approach:** Use both YAML for structured metadata and Markdown for human narrative.

**A) Create context.yml** - Use template at `.specs/template/context.yml.template`

**Key sections to fill in:**
- `metadata`: Feature name, dates, status (planning), testing approach
  - **NEW**: Add `architecture_doc: "architecture.md"` reference
  - **Multi-Agent Mode**: Set `agent_coordination: true`, `current_domain: null`, list `domains`
- `session.focus`: Current focus ("Architecture & Planning Complete"), phase (0=planning), next action
- `session.docker`: rebuild_needed (false initially)
- `session.git`: branch (null initially), file counts (0)
- `files`: active/modified/next_to_modify (all empty initially)
- `status`: working/needs_work (empty initially)
- `architecture`: patterns, related_code, tech_stack (from codebase research)
  - **NEW**: Add `reference_doc: "architecture.md"`
  - **NEW**: Add `key_decisions` array with ADR summaries
  - **NEW**: Add `integration_points` from architecture.md
- **Multi-Agent Mode**: Populate `domain_context` with empty structures for each domain
- `next_session.immediate_actions`: List of next steps with priorities
  - Action 1: "Review architecture.md for detailed design"
  - Action 2: "Review spec.yml for requirements"
  - Action 3: "Run /cspec:implement to begin implementation"
  - **Multi-Agent Mode**: Add `by_domain` with domain-specific next actions
- `next_session.docker_reminder`: Reference to CLAUDE.md Docker rules

**B) Create context.md** - Use template at `.specs/template/context.md.template`

**Key sections to fill in:**
- Header with dates and status
- "What We're Building": One paragraph summary (from architecture.md Overview)
- "Architecture": Reference to architecture.md with key highlights
  - Link to ADRs
  - Mention key architectural approach
- "Current State": Planning complete, architecture designed, ready to implement
- "Architecture Context": Key decisions and patterns from architecture.md
  - List 3-5 most important ADRs
  - Integration points
  - Risk mitigations
- "Related Files/Patterns": Files to reference from codebase (from analysis in Step 3)
- "For Next Session": Step-by-step instructions for resuming
  - "1. Read architecture.md for complete design"
  - "2. Review spec.yml for requirements"
  - "3. Run /cspec:implement to start"
- "App Folder Structure": Document app folder from CLAUDE.md
- "Technical Context": Tech stack details
- "Notes": Any additional helpful context

### 9. Update CLAUDE.md if Needed

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

### 10. Present Architecture & Plan

Show the user a comprehensive summary:

```
✅ Architecture Complete: [Feature Name]

📐 Architecture Approach:
- [Key architectural decision]
- [Main components/patterns]
- [Integration strategy]

🎯 Key Decisions (ADRs):
- ADR-001: [Decision summary]
- ADR-002: [Decision summary]
- ADR-003: [Decision summary]

🔐 Security:
- [OWASP mitigations implemented]
- [Authentication/authorization approach]

📋 Implementation Plan:
- Phase 1: [Name] - [X tasks] - [Purpose]
- Phase 2: [Name] - [Y tasks] - [Purpose]
- Phase 3: [Name] - [Z tasks] - [Purpose]

🔗 Integration Points:
- [System A integration]
- [System B integration]

⚠️ Risks & Mitigations:
- [High risk]: [Mitigation]
- [Medium risk]: [Mitigation]

📂 Files Created:
- .specs/active-task/architecture.md (detailed design & ADRs)
- .specs/active-task/spec.yml (requirements - references architecture.md)
- .specs/active-task/progress.yml (task breakdown - from architecture.md)
- .specs/active-task/context.yml (structured metadata)
- .specs/active-task/context.md (human-readable context)

📝 CLAUDE.md Updates:
- [Any updates made, or "No updates needed"]

---

📖 Next Steps:
1. Review architecture.md for complete technical design
2. Review ADRs to understand key decisions
3. Run `/cspec:implement` when ready to begin implementation

✅ Architecture design complete. Ready for implementation.
```

**IMPORTANT:** Do NOT start implementation. Present the architecture and plan, then stop.

### 11. Complete Planning

Once all files are created, end with this message:

```
✅ Architecture & Planning Complete!

Files created:
- .specs/active-task/architecture.md (comprehensive design)
- .specs/active-task/spec.yml (requirements)
- .specs/active-task/progress.yml (task tracking)
- .specs/active-task/context.yml (metadata)
- .specs/active-task/context.md (resumption context)

Review the architecture and run `/cspec:implement` when ready to begin implementation.
```

**DO NOT proceed with implementation.** The user will review and run `/cspec:implement` when ready.

## Tips for Good Architecture

- **Be specific:** Clear, measurable requirements and acceptance criteria
- **Be realistic:** Don't over-commit on scope
- **Be organized:** Logical task breakdown with clear dependencies
- **Be thorough:** Cover edge cases, security, and error states
- **Document decisions:** Use ADRs to explain "why" not just "what"
- **Reference existing code:** Reuse established patterns
- **Think about testing:** Plan for testability from the start
- **Consider security:** OWASP Top 10 from day one

## Edge Cases

**If feature is very small:**
- Use `--quick` flag for streamlined planning
- Create simplified architecture.md
- Skip detailed ADRs and risk assessment

**If feature is very large:**
- Consider breaking into multiple smaller features
- Create this architecture for Phase 1 only
- Plan future phases separately
- Note dependencies in architecture.md

**If unclear requirements:**
- Ask more questions before creating architecture
- Mark unclear items with `[NEEDS CLARIFICATION]` in architecture.md
- Don't proceed with implementation until clear

**If multi-agent mode with MCP:**
- Verify MCP servers are installed (check /mcp command)
- Document MCP server requirements in architecture.md
- Plan for fallback to prompt-based if MCP unavailable

## Success Criteria

- Architecture.md contains comprehensive design with ADRs
- Spec.yml references architecture.md (no duplication)
- Progress.yml tasks match architecture.md phases
- Context files enable easy resumption
- User understands and approves the architecture
- All security considerations documented (OWASP)
- Implementation path is clear and actionable
- Ready to begin implementation with `/cspec:implement`
