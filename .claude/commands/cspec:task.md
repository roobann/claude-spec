---
name: cspec:task
description: Create task from roadmap for a specific feature
---

Create a task from the project roadmap and set up all necessary files for implementation.

**Usage:** `/cspec:task [feature-name]`

**Examples:**
- `/cspec:task user-authentication`
- `/cspec:task payment-integration`

## What This Does

1. Reads the project architecture and roadmap
2. Finds the specified feature in the roadmap
3. Checks if dependencies are met
4. Creates `.specs/tasks/YYYYMMDD-feature-name/` with all necessary files
5. Updates `.specs/tasks/progress.yml` index and roadmap status to `in_progress`

## Process

### 1. Check for Project Architecture

**If `.specs/architecture.md` does NOT exist:**
```
❌ No project architecture found.

You need to create the project architecture first.

Run: /cspec:architect

This will create the master architecture and feature roadmap.
```

Stop and inform user.

**If `.specs/architecture.md` exists:** Proceed to Step 2.

### 2. Read Project Context

Read these files in order:

**A) Read `.specs/architecture.md`**
- Understand project architecture
- Note technical decisions (ADRs)
- Identify patterns to follow
- Extract security requirements
- Note development standards

**B) Read `.specs/roadmap.yml`**
- Find all features
- Check feature statuses
- Identify dependencies

**C) Read `.specs/guidelines.md`** (if exists)
- Code organization rules
- Testing requirements
- Security checklist
- Performance budgets

**D) Read `CLAUDE.md`**
- App folder configuration
- Tech stack
- Project structure
- Existing conventions

### 4. Find Feature in Roadmap

**Look for feature by name in `roadmap.yml`:**

```yaml
features:
  - id: "F3"
    name: "user-authentication"  # Match this
    description: "..."
    priority: "critical"
    status: "not_started"
    dependencies: ["F1", "F2"]
```

**If feature NOT found in roadmap:**
```
❌ Feature "[feature-name]" not found in roadmap.

Available features:
Phase 1 - Foundation:
  - F1: database-setup (critical) - not_started
  - F2: project-config (critical) - not_started

Phase 2 - Core Features:
  - F3: user-authentication (high) - not_started
  - F4: user-profile (medium) - not_started

Run `/cspec:task [feature-name]` with one of the above feature names.

Or update .specs/roadmap.yml to add your feature.
```

Stop and inform user.

**If feature found:** Proceed to Step 4.

### 4. Check Dependencies

**If feature has dependencies:**

For each dependency ID, check its status in roadmap:
- If dependency status is `completed`: ✓ OK
- If dependency status is NOT `completed`: ⚠️ Blocker

**If any dependency is not completed:**
```
⚠️ Feature has unmet dependencies:

Feature: [feature-name] (F3)
Dependencies:
  - F1: database-setup (status: not_started) ❌
  - F2: project-config (status: completed) ✓

Recommendation: Complete F1 first.

Options:
1. Work on dependency first
   Run: /cspec:task database-setup
2. Continue anyway (may cause integration issues)
3. Cancel
```

Wait for user choice.

**If all dependencies met:** Proceed to Step 5.

### 5. Comprehensive Feature Planning

Use the Plan agent to design this specific feature based on project architecture.

**Launch Task tool with Plan subagent (very thorough):**

```
Design the feature: [feature-name]

**Context from Project:**
[Include relevant sections from architecture.md]

**Feature Details from Roadmap:**
- ID: [feature-id]
- Description: [description]
- Priority: [priority]
- Dependencies: [list of dependencies]
- Estimated Days: [days]

**Your Task:**
Create a detailed feature architecture that:

1. **Aligns with Project Architecture:**
   - Follow ADRs from project architecture
   - Use established patterns
   - Respect component boundaries
   - Follow security guidelines (OWASP)

2. **Feature Architecture:**
   - Component design
   - Data models (follow project domain model)
   - API endpoints (follow project API design)
   - Integration with existing features
   - Dependencies (external & internal)

3. **Implementation Plan:**
   - Break down into phases (Foundation, Core, Polish)
   - Create task list with dependencies
   - Assign domains (if multi-agent mode)
   - Identify risks

4. **Testing Strategy:**
   - Follow project testing approach
   - Unit test requirements
   - Integration test requirements
   - E2E test scenarios

5. **Security Checklist:**
   - OWASP mitigations for this feature
   - Authentication/authorization
   - Data protection

Provide comprehensive plan following the project's established architecture.
```

**Thoroughness Level:** very thorough

### 6. Create Task Directory

**Create directory:** `.specs/tasks/YYYYMMDD-feature-name/`

Format: `YYYYMMDD` is today's date (e.g., `20250109-user-authentication`)

This will hold all files for this feature.

### 7. Create Spec File

**Create: `.specs/tasks/YYYYMMDD-feature-name/spec.yml`**

Use the template at `.specs/template/spec.yml.template`.

**Fill in based on:**
- Feature details from roadmap
- Planning from Step 6
- Project architecture alignment (read `.specs/architecture.md`)
- Testing approach from project guidelines

**Key metadata:**
```yaml
metadata:
  feature_name: "[feature-name]"
  feature_id: "[F3]"  # From roadmap
  project_architecture: "../architecture.md"
  roadmap: "../roadmap.yml"
  guidelines: "../guidelines.md"

  # From roadmap
  priority: "[priority from roadmap]"
  estimated_days: [days from roadmap]
  dependencies: [dependency IDs from roadmap]

  # From project architecture
  agent_coordination: [true/false from project]
  domains: [domains from roadmap]
  mcp_integration: [from project architecture]
```

**Technical design section should include:**
- **Referenced ADRs:** List ADRs from `.specs/architecture.md` that apply
- **Architecture Patterns:** Which project patterns this feature follows
- **Components:** New components needed for this feature
- **Integration Points:** How this integrates with existing features
- **Database Schema:** Any tables/collections needed
- **API Design:** Endpoints/interfaces for this feature
- **Security:** Feature-specific security considerations
- **Implementation Phases:** 3-phase breakdown (Foundation, Core, Polish)

### 8. Create Progress Tracker

**Create: `.specs/tasks/YYYYMMDD-feature-name/progress.yml`**

Use the template at `.specs/template/progress.yml.template`.

**Fill in based on:**
- Task breakdown from Step 6
- Testing approach from project
- Domain assignments (if multi-agent)

**Tasks should come from feature architecture Step 7.**

### 9. Create Context File

**Create `.specs/tasks/YYYYMMDD-feature-name/context.md`**

Use template at `.specs/template/context.md.template`.

**Add structured sections:**
```markdown
## Current Focus
Planning complete for [feature-name]

## Project Context
- **Project Architecture:** `.specs/architecture.md`
- **This Feature:** [F3] in roadmap
- **Dependencies:** [List completed dependencies]
- **Alignment:**
  - Uses [pattern] from project architecture
  - Follows [ADR-X] for [decision]
  - Integrates with [existing features]

## Architecture Context
- Key decisions to follow
- Integration points with existing features
- Patterns being used

## For Next Session
Ready to begin implementation with `/cspec:implement`
```

### 10. Update Task Index

**Update `.specs/tasks/progress.yml`:**

Add entry for this task:

```yaml
tasks:
  - id: "YYYYMMDD-feature-name"
    name: "feature-name"
    status: "in_progress"
    priority: "[priority from roadmap]"
    created: "YYYY-MM-DD"
    completed: null
```

### 11. Update Roadmap Status

**Update `.specs/roadmap.yml`:**

Find the feature and update its status:

```yaml
features:
  - id: "F3"
    name: "user-authentication"
    status: "in_progress"  # Changed from "not_started"
    started: "2025-01-08T14:30:00"  # Add timestamp
```

### 12. Present Task Summary

Show the user what was created:

```
✅ Task Created: [Feature Name]

📋 Feature Details:
- ID: [F3]
- Task: YYYYMMDD-feature-name
- Priority: [priority]
- Estimated: [X days]
- Dependencies: [list or "None"]

📐 Architecture Alignment:
- Follows project ADR-002 ([decision])
- Follows project ADR-003 ([decision])
- Integrates with: [existing features]

🎯 Implementation Plan:
Phase 1: [Phase name] ([X tasks])
  - T1: [task description]
  - T2: [task description]

Phase 2: [Phase name] ([Y tasks])
  - T3: [task description]
  - T4: [task description]

Phase 3: [Phase name] ([Z tasks])
  - T5: [task description]

Total: [N tasks] across [M phases]

📂 Files Created:
- .specs/tasks/YYYYMMDD-feature-name/spec.yml (requirements & technical design)
- .specs/tasks/YYYYMMDD-feature-name/progress.yml (task tracking)
- .specs/tasks/YYYYMMDD-feature-name/context.md (resumption context)

📝 Updated:
- .specs/tasks/progress.yml (task index updated)
- .specs/roadmap.yml (feature status: not_started → in_progress)

---

📖 Next Steps:
1. Review feature architecture
2. Run `/cspec:implement` to begin implementation

✅ Task ready for implementation!
```

**DO NOT start implementation.** Present the task and stop.

### 13. Complete Task Creation

Task is now ready. User can:
1. Review feature architecture
2. Run `/cspec:implement` to start work

## Special Cases

**Case: Feature name contains spaces**
- Automatically convert to kebab-case
- "User Authentication" → "user-authentication"

**Case: Feature already in progress**
```
⚠️ Feature "[feature-name]" is already marked as in_progress.

This might mean:
1. You're resuming work (task folder exists in .specs/tasks/)
2. Status wasn't updated after completion
3. Multiple people working on same feature

Check .specs/tasks/ directory and .specs/tasks/progress.yml to see current state.
```

**Case: Feature already completed**
```
✓ Feature "[feature-name]" is already completed.

Status: completed
Completed: [date]

To work on this feature again:
1. Create a new feature in roadmap (e.g., "user-authentication-v2")
2. Or update roadmap status to "not_started" to rework

Available not_started features:
[List other features]
```

**Case: No features in roadmap**
```
❌ No features found in roadmap.

The roadmap appears empty. Update .specs/roadmap.yml to add features.

Or run `/cspec:architect` to redesign the project architecture and roadmap.
```

## Tips

- **Check dependencies:** Always check if dependency features are complete
- **Follow project patterns:** Reference project architecture.md throughout
- **Stay aligned:** Feature architecture should fit project architecture
- **Use roadmap:** Roadmap is the source of truth for feature scope
- **Multiple tasks:** You can have multiple in-progress tasks tracked in .specs/tasks/progress.yml

## Success Criteria

- Feature found in roadmap
- Dependencies checked (all completed or user accepted risk)
- Task directory created with all files (.specs/tasks/YYYYMMDD-feature-name/)
- Feature architecture aligns with project architecture
- All files reference project context
- .specs/tasks/progress.yml index updated
- Roadmap status updated to in_progress
- Ready for implementation with `/cspec:implement`
