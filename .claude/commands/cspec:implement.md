---
name: cspec:implement
description: Implement the planned feature by reading spec/progress/context and executing tasks
---

Start or continue implementation of the current task.

**Usage:**
```
/implement                    # Autonomous mode (default) - runs to completion
/implement mode=interactive   # Interactive mode - asks questions during execution
```

**Modes:**

- **Autonomous (default)**: Runs all phases to completion without interruption
  - Completes all tasks including polish phase
  - No interactive questions
  - Stops only when all phases done or error occurs
  - Best for: Letting Claude complete features end-to-end

- **Interactive**: Asks questions during execution
  - Prompts after Phase 2 about polish phase
  - Allows skipping optional tasks
  - User controls what gets done
  - Best for: Time-constrained development, MVP features

This command handles both:
- **Fresh start:** Beginning implementation after `/architect`
- **Resuming work:** Continuing after breaks

## Process

### 0. Check Version Context

**Read `.specs/project.yml` to get current version:**

1. Read `versioning.current_version` (e.g., "v1", "v2")
2. Set file paths for this session:
   ```
   VERSION_PATH = .specs/versions/{current_version}
   TASKS_PATH = {VERSION_PATH}/tasks
   TASKS_PROGRESS_PATH = {VERSION_PATH}/tasks/progress.yml
   ```

**If `.specs/project.yml` does NOT exist:**
```
❌ No project manifest found.

Run /cspec:architect first to initialize the project.
```

### 1. Parse Command Parameters

Check if `mode` parameter is provided:
- No parameter → **Autonomous mode** (default)
- `mode=interactive` → **Interactive mode**

Store this for use during Phase 2 completion check.

### 2. Check for Active Tasks

Read `{TASKS_PROGRESS_PATH}` to find in_progress tasks.

**If no in_progress tasks found:**
```
❌ No active task found.

To start a new feature, run: /cspec:task [feature-name]
To see all tasks, run: /cspec:status
```

**If exactly one in_progress task found:**
Automatically select and proceed with that task. No user interaction needed.

**If multiple in_progress tasks found:**

Show formatted task selection with details:

```
📋 Multiple Active Tasks Found

Select a task to work on:

1. 001-user-authentication
   Name: user-authentication
   Priority: high
   Created: 2025-01-09
   Last worked: 2 days ago

2. 002-export-metrics
   Name: export-metrics
   Priority: medium
   Created: 2025-01-20
   Last worked: 5 hours ago ⭐ (most recent)

3. 003-dashboard
   Name: dashboard
   Priority: low
   Created: 2025-01-25
   Last worked: never

💡 Tip: Task #2 was most recently worked on

Enter task number (1-3):
```

**Selection Logic:**

1. **Display format:**
   - Numbered list for easy selection
   - Show: ID, name, priority, created date
   - Include "last worked" timestamp from context.md last_updated
   - Mark most recently worked task with ⭐

2. **Last worked detection:**
   - Check each task's `context.md` frontmatter `last_updated` field
   - If present, calculate time since update ("2 days ago", "5 hours ago")
   - If absent, show "never"
   - Identify most recent and mark with ⭐
   - Suggest continuing with most recent task

3. **User selection:**
   - Wait for user to enter number (1-N)
   - Validate input (must be valid number in range)
   - If invalid, show error and ask again

4. **Smart suggestions:**
   - If one task worked on recently (< 24 hours ago) and others never/old:
     ```
     💡 Suggestion: Task #2 was worked on 5 hours ago. Continue with this task? (y/n)

     If no, I'll show the full task list.
     ```
   - If user answers 'y', auto-select that task
   - If user answers 'n', show full numbered list for selection

**Auto-selection criteria (skip user prompt):**
- Only ONE task has `in_progress` status → Auto-select
- Multiple tasks but one has `last_updated` < 6 hours ago, others never worked → Auto-select recent
  - Still show brief message: "Continuing with 002-export-metrics (worked on 2 hours ago)"

**Error handling:**
```
Invalid selection. Please enter a number between 1 and 3.

Enter task number (1-3):
```

**After selection:**
Store the selected task ID for use in subsequent steps. Proceed to step 2 (Review Project Configuration).

### 2. Review Project Configuration

**IMPORTANT:** Before loading context files, read `CLAUDE.md` to understand:
- Project structure and conventions
- **App folder configuration** (if specified in Tech Stack section)
- Code style guidelines
- Existing patterns and dependencies

**App Folder Awareness:**
If the Tech Stack section specifies an "App Folder", all application code should be created within that folder. This affects:
- Where new files are created
- Import paths and references
- Test file locations

### 3. Load Context Files

Read all context files in order of importance.

**A) Read context.md** - Most important (resumption lifeline)

Contains comprehensive context including:
- **Current Focus**: What you're working on RIGHT NOW (file, line, action)
- **Session Status**: Docker rebuild status, git status, active files
- **What's Working**: Completed functionality
- **What Needs Work**: Remaining items and blockers
- **For Next Session**: Specific instructions with file paths and line numbers
- **Architecture Context**: Patterns being followed, related code
- **Technical Notes**: Tricky areas, gotchas, decisions made

**B) Read progress.yml** - Current status
- `metadata`: Status, dates, current phase, testing approach
- `progress_summary`: Completion percentages and counts
- `phases`: Array of phases with tasks and their statuses
- `current_work`: What's actively being worked on
- `next_steps`: Prioritized action items
- `decisions`: Log of decisions made
- `issues`: Problems encountered and resolutions
- `time_tracking`: Hours spent and remaining

**C) Read spec.yml** - Original requirements
- `metadata`: Feature name, status, priority
- `overview`: Description, user problem, user stories
- `requirements`: Functional and non-functional requirements
- `technical_design`: Architecture, components, dependencies
- `testing`: Strategy and test credentials
- `success_criteria`: How we know feature is complete

### 4. Check Git Status

Run `git status` to understand:
- Current branch
- Modified files
- Staged/unstaged changes
- Any uncommitted work

Compare with context.md to detect discrepancies.

### 5. Analyze Current State

Determine whether this is a **fresh start** or **resuming**:

**Fresh Start Indicators:**
- progress.yml status is "not_started" or "planning"
- No completed tasks in progress.yml (completed_tasks: 0)
- context.md says "Planning Complete" or similar
- No modified files in git related to this feature

**Resuming Indicators:**
- Some tasks marked complete in progress.yml phases
- Status is "in_progress", "testing", etc.
- Files exist that match context.md references
- Git shows related uncommitted/committed work

**Determine:**
- What phase we're in (Phase 1, 2, 3, etc.)
- What was last completed
- What's currently in progress
- What's the immediate next step
- Are there any blockers?

### 5.5. Multi-Agent Mode Detection

**Check if multi-agent mode is enabled:**

Read `metadata.agent_coordination` from spec.yml and progress.yml:
- If `agent_coordination: false` → Standard single-agent mode (skip to step 6)
- If `agent_coordination: true` → Multi-agent mode (continue below)

**Multi-Agent Mode Process:**

When multi-agent mode is enabled, you act as the **orchestrator** that spawns domain expert agents.

#### A. Identify Next Domain to Work On

**Read from progress.yml:**
- `metadata.domains`: List of all domains in this feature
- `metadata.current_domain`: Domain currently being worked on (may be null)
- `progress_summary.by_domain`: Per-domain progress tracking

**Determine next domain:**
1. Check if current_domain has unfinished tasks
2. If not, find next domain with pending tasks
3. Check task dependencies - don't work on tasks blocked by other domains
4. Prioritize based on dependencies (backend → frontend → devops pattern)

**Example logic:**
```yaml
# If progress.yml shows:
metadata:
  domains: [backend, frontend, devops]
  current_domain: null

phases:
  - id: 1
    tasks:
      - id: "T1"
        domain: "backend"
        status: "pending"
        dependencies: []
      - id: "T2"
        domain: "frontend"
        status: "pending"
        dependencies: ["T1"]  # Blocked by T1
      - id: "T3"
        domain: "devops"
        status: "pending"
        dependencies: []

# Decision: Start with "backend" (T1) since T2 is blocked by T1
```

#### A.5. Check for MCP Integration (NEW)

**Read metadata from spec.yml:**
- `metadata.mcp_integration.enabled`: Check if MCP mode requested
- `metadata.mcp_integration.fallback_to_prompt`: Allow fallback if MCP unavailable
- `metadata.mcp_integration.servers`: Map of domain to MCP server package

**Detect MCP Server Availability:**

Check if the required MCP server is installed and configured:

```markdown
**For the selected domain (e.g., "backend"):**

1. Check if MCP server exists:
   - Look for @backend-expert resource access
   - Try listing tools: /mcp to see available servers
   - Check for server in metadata.mcp_integration.servers.backend

2. Determine spawn method:
   - If MCP server available AND mcp_integration.enabled = true:
     → Use MCP-based spawning (Step B-MCP)
   - If MCP server NOT available AND fallback_to_prompt = true:
     → Use prompt-based spawning (Step B-Prompt)
     → Show installation instructions for MCP servers
   - If MCP server NOT available AND fallback_to_prompt = false:
     → Stop with error, require MCP installation

3. Log decision:
   Add to progress.yml decisions array what method was used
```

**Example Detection:**

```yaml
# spec.yml shows:
metadata:
  mcp_integration:
    enabled: true
    fallback_to_prompt: true
    servers:
      backend: "@claude-spec/backend-mcp-server"

# Detection logic:
# 1. Try to access @backend-expert server
# 2. If accessible → Use MCP-based agent (better tools)
# 3. If not accessible → Fall back to prompt-based agent (still works)
```

#### B-MCP. Spawn Domain Expert via MCP (ENHANCED - NEW)

When MCP servers are available and `mcp_integration.enabled: true`:

**Use MCP Resource Access Pattern:**

Instead of spawning via Task tool, directly use MCP tools and resources:

```markdown
**Step 1: Load Domain Context via MCP Resource**

Access the domain-specific context:
- Resource: @backend-expert:database://schema (get DB structure)
- Resource: @backend-expert:files://spec (read spec.yml for this domain)

**Step 2: Execute Domain Tasks Using MCP Tools**

For each pending task in this domain:

Example for backend domain:
```
Task T1: "Set up JWT authentication service"

1. Read domain design from spec.yml:
   technical_design.domain_design.backend

2. Use MCP tools to implement:
   - @backend-expert:query_database - Check if users table exists
   - @backend-expert:test_api_endpoint - Test authentication endpoint
   - @backend-expert:run_migration - Create auth tables if needed
   - @backend-expert:run_tests - Verify authentication tests pass

3. Update progress.yml after completion:
   - Mark T1 as complete
   - Update domain context notes in context.md
   - Add handoff notes for other domains
```

**Benefits of MCP Mode:**
- Direct database access for queries
- API endpoint testing without manual HTTP calls
- Test execution and verification
- Schema inspection for migrations
- Isolated execution environment

**After Completion:**
1. Update progress.yml (mark domain tasks complete)
2. Update context.md with domain-specific progress
3. Check for next unblocked domain
4. If more domains pending → Repeat from Step A
5. If all domains complete → Continue to Step 6

#### B-Prompt. Spawn Domain Expert via Subagents

When MCP servers are NOT available or `mcp_integration.enabled: false`:

Use the **Task tool** to invoke specialized domain expert **subagents** from `.claude/agents/`:

**Subagent mapping by domain:**
- **backend** → @backend-architect, @database-admin
- **frontend** → @frontend-developer, @ui-ux-designer, @nextjs-app-router-developer
- **devops** → @devops-troubleshooter, @deployment-engineer
- **database** → @database-admin, @database-optimizer
- **infrastructure** → @cloud-architect, @terraform-specialist, @network-engineer

**Subagent invocation structure:**
```
Invoke the @[subagent-name] subagent to work on [DOMAIN] tasks for feature: [FEATURE_NAME]

## Task Context

**Feature:** [FEATURE_NAME]
**Task ID:** [NNN-feature-name]
**Domain:** [DOMAIN]
**Status:** Multi-domain implementation (coordinated via progress.yml)

## Files to Read

Read these files in order for full context:
1. `.specs/tasks/NNN-feature-name/context.md` - Current focus and domain notes
2. `.specs/tasks/NNN-feature-name/progress.yml` - Tasks for domain=[DOMAIN]
3. `.specs/tasks/NNN-feature-name/spec.yml` - Design in technical_design.domain_design.[DOMAIN]
4. `CLAUDE.md` - Project configuration and standards

## Your Domain Tasks

From progress.yml, implement tasks where:
- `domain: "[DOMAIN]"`
- `status: "pending"` OR `"in_progress"`
- All `dependencies` are satisfied (dependency tasks completed)

**Pending tasks for [DOMAIN]:**
[List specific task IDs and descriptions from progress.yml]

## Coordination Rules

1. **Domain scope** - Only work on [DOMAIN] tasks; other domains handled by other subagents
2. **Dependencies** - Verify dependencies complete before starting each task
3. **Progress tracking** - Update progress.yml after completing each task:
   - Mark task status: `completed`
   - Add timestamp: `completed_at`
   - Update `by_domain.[DOMAIN].completed_tasks` count
4. **Context updates** - Update context.md domain section with:
   - Files created/modified
   - Decisions made
   - Blockers encountered
   - Handoff notes for dependent domains

## Quality Standards

Follow all standards from CLAUDE.md:
- **Security:** OWASP Top 10 compliance
- **Testing:** Test data via env vars, random generation
- **Docker:** Rebuild after code changes
- **Logging:** Debug mode enabled

## Deliverables

When done, provide:
1. Updated `progress.yml` (all [DOMAIN] tasks marked complete)
2. Updated `context.md` (domain-specific progress section)
3. Summary of completed work
4. Handoff notes for dependent domains (if any)
```

**Example Task tool invocation for backend domain:**
```
Task tool with:
- subagent_type: "general-purpose"
- description: "Implement backend tasks via subagents"
- prompt: "Invoke the @backend-architect subagent to work on backend tasks for feature: user-authentication

## Task Context
**Feature:** user-authentication
**Task ID:** 001-user-authentication
**Domain:** backend
**Status:** Multi-domain implementation

## Files to Read
1. `.specs/tasks/001-user-authentication/context.md`
2. `.specs/tasks/001-user-authentication/progress.yml` (focus on domain=backend tasks)
3. `.specs/tasks/001-user-authentication/spec.yml` (focus on technical_design.domain_design.backend)
4. `CLAUDE.md`

## Your Domain Tasks
- T1: Create user authentication API endpoints (POST /auth/login, POST /auth/register)
- T2: Implement JWT token generation and validation middleware
- T3: Create database models for User and Session tables

## Coordination Rules
[Include full coordination rules from above]

## Quality Standards
[Include full quality standards from above]

## Deliverables
[Include full deliverables from above]"
```

**Note on MCP Integration:**

MCP server support has been removed in favor of using community-maintained subagents from `.claude/agents/`. These subagents provide battle-tested expertise and are automatically available after running `setup.sh`.

#### C. After Agent Completes

When the domain expert agent finishes:

1. **Read updated files:**
   - progress.yml (verify tasks marked complete)
   - context.md (check domain progress updates)

2. **Update orchestration metadata:**
   - progress.yml metadata.current_domain → next domain or null

3. **Check for next domain:**
   - Are there more pending tasks in other domains?
   - Are dependencies satisfied for next domain?
   - If yes → Spawn next domain expert (go to step B)
   - If no → All domains complete, continue to step 6

#### D. Dependency Management

**CRITICAL:** Don't spawn an agent for a domain if its tasks are blocked:

```yaml
# Check dependencies before spawning:
- id: "T2"
  domain: "frontend"
  dependencies: ["T1"]  # Depends on T1

# Before spawning frontend-expert:
# 1. Check if T1 is complete
# 2. If T1 is not complete, don't spawn frontend-expert yet
# 3. Work on other unblocked domains first
```

**Handoff between domains:**
- Backend completes → Frontend can start (if dependencies met)
- Use domain_context.[domain].handoff_notes for coordination
- Document API endpoints, data formats, etc. for next domain

### 6. Present Brief Summary

Show a concise summary of what will be done:

**For Fresh Start:**
```
🚀 Starting Implementation: [Feature Name]

Phase: Phase 1 - [Phase Name]
Tasks: [X total tasks across Y phases]

📋 Phase 1 Tasks:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

🎯 Starting with: [First task description]

Continuing...
```

**For Resuming:**
```
🔄 Resuming: [Feature Name]

Status: [In Progress/Testing/etc.]
Phase: Phase [N] - [Phase Name]
Progress: [X/Y tasks complete]

✅ Recently Completed:
- [Last 2-3 completed items]

📍 Next Up:
- [Next incomplete task]

🎯 Current Focus: [From context.md]

Continuing from [specific point]...
```

### 7. Verify Files Exist

Before proceeding, verify that files mentioned in context.md still exist.

**If files are missing:**
```
⚠️ Warning: Some files mentioned in context were not found:
- [missing-file.py]

Options:
1. Search for similar files (may have been renamed)
2. Proceed anyway and recreate if needed
3. Update context to remove missing references

How would you like to proceed?
```

Wait for user response before continuing.

### 8. Execute Implementation

**DO NOT wait for user confirmation** - proceed directly with implementation.

**IMPORTANT:** Respect the app folder structure from CLAUDE.md when creating files. All application code should be created in the correct folder.

Work through tasks sequentially:

#### A. Load Relevant Files
- Files mentioned in context.md "For Next Session"
- Files being modified according to context.md
- Related files for reference

#### B. Work on Next Task
- Start with the first pending task in the current phase (check progress.yml)
- Follow the technical design from spec.yml
- Follow patterns identified in context.md
- Reference related code mentioned in context.md architecture section

#### C. After Completing Each Phase
**STOP AND UPDATE progress.yml (MANDATORY):**

⚠️ **CRITICAL**: Before continuing to the next phase, you MUST stop and update progress.yml. This is NOT optional.

**Update procedure:**
1. Read the current progress.yml file
2. Update task statuses to "complete" for finished tasks
3. Update phase status to "complete" and set completed timestamp
4. Increment current_phase if moving to next phase
5. Update progress_summary (completed_tasks, completed_phases, completion_percentage)
6. Update metadata.updated timestamp
7. Add any decisions to decisions array with timestamp
8. Add any issues to issues array
9. Write the updated progress.yml file

**Show user the update:**
Present a summary of what was completed:
```
✅ Phase [N] Complete - [Phase Name]

Completed tasks:
- Task 1 (T1) - Description ✅
- Task 2 (T2) - Description ✅
- Task 3 (T3) - Description ✅

Updated progress.yml:
- Phase status: complete
- Completion timestamp: 2025-11-07T15:30:00
- Progress: X/Y tasks complete (Z%)
```

**Example progress.yml structure after update:**
```yaml
phases:
  - id: 1
    name: "Setup & Foundation"
    status: "complete"
    completed: "2025-11-03T16:30:00"
    tasks:
      - id: "T1"
        status: "complete"
        completed: "2025-11-03T14:15:00"
```

**DO NOT proceed to the next phase until progress.yml is updated.** This ensures accurate tracking throughout implementation.

**Special: After Completing Phase 2 (Core Implementation)**

Behavior depends on execution mode:

**Autonomous Mode (default - no parameters):**
- Automatically proceed with all Phase 3 tasks
- Complete everything as planned
- No interruptions or questions
- Run to full completion

**Interactive Mode (`mode=interactive`):**

When Phase 2 is complete, use `AskUserQuestion` to determine if final polish phase is needed:

```
Phase 2 (Core Implementation) is complete!

Do you want to proceed with the final testing/polish phase?
```

Options:
- "Yes - Complete all polish tasks" → Continue with Phase 3 as planned
- "No - Feature is good enough" → Mark remaining Phase 3 tasks as skipped, mark feature complete
- "Partial - Only some tasks" → Ask which specific tasks to do

**If "No" selected:**
- Update Phase 3 tasks in progress.yml: set status to "skipped", add notes
- Update progress.yml metadata.status to "complete"
- Note in context.md: "Polish phase skipped - core functionality complete"
- Ready for `/archive`

**If "Partial" selected:**
- Show list of Phase 3 tasks
- User selects which ones to do
- Mark unselected as "[Skipped]"
- Complete only selected tasks

**Reasoning for Interactive Mode:**
- Polish/edge cases are often "nice to have" not "must have"
- Allows rapid iteration and deployment of core features
- Avoids perfectionism paralysis
- User decides based on timeline/priority

**Reasoning for Autonomous Mode (default):**
- Complete features without supervision
- Finish all planned work
- Consistent quality across all features
- Best for production-ready code

#### D. Update Context Periodically (Required)
You MUST update context.md when:
- Making important architectural decisions
- Discovering tricky areas or gotchas
- Changing approach from original plan
- Before moving to a new phase
- When stopping for any reason

**Update context.md with these sections:**
- **Current Focus**: What you're working on RIGHT NOW (summary, phase, file, line, action)
- **Session Status**: Docker rebuild status, git branch and file counts
- **Active Files**: Current files being edited with progress notes
- **Modified Files**: Files changed today with descriptions
- **Next Files**: Upcoming files to work on
- "Current Focus" - What you're working on RIGHT NOW
- "Files Modified" - Detailed status of each file
- "What's Working" - Completed functionality (expanded description)
- "What Needs Work" - Remaining items (expanded description)
- "For Next Session" - Specific instructions with file paths and line numbers
- "Tricky Areas" - Any gotchas discovered
- "Decisions Log" - New decisions made with reasoning

#### E. Handle Test Credentials (When Applicable)

**IMPORTANT:** See CLAUDE.md "Test Credentials & Data (CRITICAL)" section for full guidance.

When implementing features that require test credentials:

**Quick Reference:**
- Generate random passwords (14+ chars): `openssl rand -base64 16 | tr -d '=' | head -c 14 && echo '!@#'`
- Store in `.env.test` (gitignored, actual credentials)
- Template in `.env.example` (committed, placeholders only)
- Reference env vars in test fixtures - NEVER hardcode

**Critical Rules:**
- ❌ NEVER use predictable patterns (Test@Admin2024!, User123!)
- ✅ ALWAYS generate random passwords (14+ chars minimum)
- ✅ Use environment variables in code
- ✅ Verify `.env.test` is in `.gitignore`

**Full guidance including:**
- Password generation methods
- Environment file structure
- Tech stack-specific patterns
- Security verification checklist

→ **See CLAUDE.md section "Test Credentials & Data" for complete details**

#### F. Rebuild Docker After Code Changes (MANDATORY)

**IMPORTANT:** See CLAUDE.md "Docker Rebuild Rules (CRITICAL)" section for full guidance.

⚠️ **CRITICAL**: After making any code changes, you MUST rebuild Docker containers BEFORE running tests or validation.

**The Core Rule:**
Making changes → **REBUILD Docker** → Test sees new code → Accurate results

**Intelligent Fix Batching:**
Group related fixes together to minimize rebuild cycles (e.g., fix 3 validation bugs → rebuild ONCE → test once, instead of rebuild→test→rebuild→test→rebuild→test).

**Quick Commands:**
```bash
# Full rebuild (recommended)
docker compose up --build -d

# Rebuild specific service
docker compose build [service-name] && docker compose up -d [service-name]

# Clean rebuild (if issues)
docker compose down && docker compose up --build -d
```

**Full guidance including:**
- When to rebuild vs when hot reload works
- Intelligent fix batching strategies
- Step-by-step rebuild workflow
- Verification procedures

→ **See CLAUDE.md section "Docker Rebuild Rules" for complete details**

#### G. Continue Until Complete or Interrupted
- Work through all tasks in current phase
- Move to next phase automatically
- Continue until all phases complete or user interrupts

### 9. Update CLAUDE.md if Needed

**HIGH PRIORITY:** After completing implementation or making significant progress, review if CLAUDE.md needs updates:

**Update CLAUDE.md if:**
- Added new dependencies during implementation
- Created new project structure directories
- Added new commands or scripts
- Established new code patterns/conventions
- Added new testing approaches
- Changed how certain features work

**How to update:**
1. Read current CLAUDE.md
2. Identify what section needs updating (Dependencies, Project Structure, Commands, Code Style, etc.)
3. Make minimal, focused updates
4. Keep changes relevant and concise
5. Don't remove existing important information

**Report what was updated:**
```
📝 Updated CLAUDE.md:
- Added [dependency] to Dependencies section
- Updated Project Structure with [new directory]
- Added command for [new script]
```

If no updates needed, skip this step.

### 10. Validate Progress Tracking (MANDATORY)

⚠️ **CRITICAL**: Before marking work as complete, verify that progress.yml is accurate and up-to-date.

**Optional: Use @code-reviewer subagent** for automated validation:
```
Invoke @code-reviewer to review the implementation for:
- Code quality and best practices
- Consistency with project patterns
- Progress tracking accuracy in progress.yml
- Documentation completeness
```

**Progress Validation Checklist:**

Read progress.yml and verify:
- [ ] All completed tasks have status: "complete" with completed timestamps
- [ ] Completed phases have status: "complete" with timestamps
- [ ] metadata.current_phase reflects the actual current phase
- [ ] metadata.status is accurate (in_progress / testing / complete)
- [ ] metadata.updated timestamp is current (today's date/time)
- [ ] progress_summary counts are accurate (completed_tasks, completion_percentage)
- [ ] decisions array contains important decisions from implementation
- [ ] issues array documents any problems faced with resolutions

**If ANY item is not checked:**
1. Read the current progress.yml file
2. Update the missing or incorrect information
3. Recalculate progress_summary values
4. Write the updated progress.yml file
5. Verify all checklist items are now satisfied

**Show user the validation result:**
```
✅ Progress Tracking Validated

Verified:
- All completed tasks marked (status: "complete")
- Timestamps current (updated: 2025-11-07T15:30:00)
- Current phase accurate: Phase [N]
- Progress summary: X/Y tasks (Z%)
- Decisions and issues documented

Progress tracking is accurate and complete.
```

**DO NOT proceed to marking work complete until this validation passes.**

### 10.5. Validate Security - OWASP Top 10 (MANDATORY)

⚠️ **CRITICAL**: Before marking work as complete, verify that OWASP Top 10 security mitigations are implemented.

**IMPORTANT:** See CLAUDE.md "Security - OWASP Top 10 (CRITICAL)" section for full security requirements.

**Recommended: Use @security-auditor subagent** for comprehensive security review:
```
Invoke @security-auditor to audit the implementation for:
- OWASP Top 10 compliance
- Security vulnerabilities and weaknesses
- Proper authentication and authorization
- Data protection and encryption
- Input validation and sanitization
- Secure configuration and secrets management
```

**Quick Security Checklist:**

Review the implemented code and verify:
- [ ] **A01: Access Control** - Authorization checks on all endpoints
- [ ] **A02: Cryptography** - Sensitive data encrypted/hashed (bcrypt/Argon2)
- [ ] **A03: Injection Prevention** - Parameterized queries, input sanitization, XSS prevention
- [ ] **A04-A10**: Rate limiting, secure config, dependency checks, auth/session security, integrity, logging, SSRF prevention

**Additional Critical Checks:**
- [ ] No secrets in code (use environment variables)
- [ ] Error messages sanitized (no stack traces/sensitive info)
- [ ] HTTPS/TLS for sensitive data
- [ ] Input validation on client AND server

**If ANY security item fails:**
1. Review spec.yml requirements.non_functional.security section
2. Review CLAUDE.md "Security - OWASP Top 10" section (full details)
3. Implement missing controls
4. Re-test and verify

→ **See CLAUDE.md section "Security - OWASP Top 10" for complete mitigation details**

**DO NOT proceed to marking work complete until security validation passes.**

### 11. Handle Completion

When all tasks are complete:
```
✅ Implementation Complete: [Feature Name]

All phases completed:
- Phase 1: Setup & Foundation ✅
- Phase 2: Core Implementation ✅
- Phase 3: Testing & Polish ✅

📊 Summary:
- Tasks completed: [X]
- Files created/modified: [Y]
- Tests added: [Z]

Next steps:
1. Run full test suite
2. Manual testing
3. Run /archive when satisfied

Would you like me to run the tests now?
```

## Special Cases

### Case: Context is Outdated

If context.md mentions files/approaches that no longer exist:
```
⚠️ Context Update Needed

The context files mention working on [X], but I notice [Y has changed].

Options:
1. Update context.md, proceed with current state (recommended)
2. Ask you about the best path forward
3. Stick with original plan despite changes

How would you like to proceed?
```

### Case: Significant Time Gap

If timestamps show work hasn't been touched in 7+ days:
```
📅 Note: This task was last updated [X days] ago.

Recommended: Quick refresh of any related changes
- Check if dependencies have updated
- Review recent commits that might affect this work
- Verify approach is still valid

Proceed with refresh? (yes/no)
```

If yes: Do quick Glob/Grep search for related recent changes before proceeding.

### Case: Git Conflicts or Issues

If git status shows conflicts, unexpected state, or uncommitted changes that might be lost:
```
⚠️ Git Status Alert:
[Description of situation]
- [List of issues]

Recommendation: Resolve git state before continuing with development.

Would you like me to:
1. Help resolve the git issue first
2. Proceed anyway (not recommended)
3. Cancel and let you handle it manually
```

### Case: Blocked Tasks

If progress.yml shows blocked tasks (tasks with status: "blocked" or blockers array populated):
```
⚠️ Blocked Tasks Found:

Blocked:
- [Task ID] [Task description] - [Reason for blockage]

These need to be unblocked before proceeding. Would you like to:
1. Work on unblocking them now
2. Work on other unblocked tasks
3. Get your input on how to proceed
```

### Case: Task Already Complete

If all tasks in progress.yml have status: "complete":
```
✅ This task appears to be complete (all tasks marked complete).

Progress summary: X/X tasks complete (100%)

Options:
1. /archive - Move to completed
2. Add more tasks and continue
3. Review and test before archiving

What would you like to do?
```

### Case: No Clear Next Step

If context.md next session instructions are empty or vague, and progress.yml next_steps is unclear:
```
❓ Next steps are unclear.

Context: [What we know from context.md]
Last completed: [Last item from progress.yml]

Need more specific direction. Could you clarify:
1. Which file should I work on next?
2. What specific task should I tackle?
3. Should I update the plan first?
```

## Implementation Guidelines

### Work Sequentially
- Complete tasks in order (top to bottom, phase by phase)
- Don't skip ahead unless explicitly told
- Mark tasks complete as you go

### Update Progress Frequently (MANDATORY)
You MUST update progress.yml:
- After completing each task (update task status and timestamps)
- After completing each phase (STOP and update before continuing)
- When making important decisions (add to decisions array)
- Update progress_summary counts and percentages

### Follow the Plan
- Reference spec.yml for requirements (check requirements section)
- Follow technical design from spec.yml (technical_design section)
- Use patterns identified in context.md (architecture section)
- Reuse components mentioned in context.md

### Communicate Progress
- Show what you're working on
- Explain decisions as you make them
- Surface issues immediately
- Update context when things change

### Update Progress After Each Phase (MANDATORY)

After completing each phase, you MUST update progress.yml:
```yaml
metadata:
  status: "in_progress"  # or "complete" if last phase
  current_phase: 2  # increment from 1 to 2
  updated: "2025-11-07T15:30:00"  # new timestamp

progress_summary:
  completed_phases: 1  # increment
  completed_tasks: 3   # update count
  completion_percentage: 43  # recalculate

phases:
  - id: 1
    name: "Setup & Foundation"
    status: "complete"  # update from in_progress
    completed: "2025-11-03T16:30:00"  # add timestamp
    tasks:
      - id: "T1"
        status: "complete"  # all tasks complete
```

### Quality Standards

- Follow project code style (check CLAUDE.md)
- **Enable debug logging** (check CLAUDE.md Development Best Practices for configuration)
- **Add appropriate logging to new code** (entry points, error cases, key decisions)
- **Follow OWASP Top 10 security practices** (check CLAUDE.md Security section)
- **Validate and sanitize ALL user inputs** (prevent injection attacks)
- **Use parameterized queries** (never concatenate SQL queries)
- **Implement proper authorization checks** (verify permissions on all endpoints)
- **Never commit secrets** (use environment variables for sensitive data)
- Write tests as specified in spec.yml testing section
- Handle error cases securely (no sensitive data in error messages)
- Update documentation as needed
- Ensure changes don't break existing functionality

## Tips for Effective Implementation

**For the AI:**
- Read context.md first (most important for resumption)
- Parse YAML files properly (spec.yml, progress.yml)
- Verify file existence before referencing
- Be specific about what you're doing
- Update progress.yml in real-time (update counts, percentages, timestamps)
- Surface issues immediately
- Don't make assumptions - check spec.yml

**For the User:**
- Context files updated automatically for better resumption
- Use `/implement` after any break
- Interrupt anytime to ask questions or give direction

## Success Criteria

- Context files successfully loaded (context.md + progress.yml + spec.yml)
- Current state correctly identified (fresh vs resuming)
- Next actions are clear and actionable (from context.md + progress.yml)
- Implementation follows spec.yml requirements
- Progress.yml updated after each phase (with accurate counts)
- Context.md updated with important changes
- Work continues smoothly from last stopping point
- Quality code produced following project standards
