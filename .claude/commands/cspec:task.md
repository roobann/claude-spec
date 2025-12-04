---
name: cspec:task
description: Create task from roadmap for a specific feature
---

Create a task from the project roadmap and set up all necessary files for implementation.

**Usage:**
- `/cspec:task [feature-name]` - Create task for specific feature
- `/cspec:task` - Auto-select next ready feature from roadmap

**Examples:**
- `/cspec:task user-authentication` - Create task for specific feature
- `/cspec:task payment-integration` - Create task for another feature
- `/cspec:task` - Auto-select and create task for next ready feature

## What This Does

1. [Optional] Auto-selects next ready feature if no feature name provided
2. Reads the project architecture and roadmap
3. Finds the specified (or auto-selected) feature in the roadmap
4. Checks if dependencies are met
5. Generates next sequential task ID (e.g., 001, 002, 003...)
6. Creates `.specs/tasks/NNN-feature-name/` with all necessary files
7. Updates `.specs/tasks/progress.yml` index and roadmap status to `in_progress`

## Process

### 0. Check Version Context

**Read `.specs/project.yml` to get current version:**

1. Read `versioning.current_version` (e.g., "v1", "v2")
2. Set file paths for this session:
   ```
   VERSION_PATH = .specs/versions/{current_version}
   ARCHITECTURE_PATH = {VERSION_PATH}/architecture.md
   ROADMAP_PATH = {VERSION_PATH}/roadmap.yml
   GUIDELINES_PATH = {VERSION_PATH}/guidelines.md
   TASKS_PATH = {VERSION_PATH}/tasks
   TASKS_PROGRESS_PATH = {VERSION_PATH}/tasks/progress.yml
   ```

3. Store the version context for use throughout this command.

**If `.specs/project.yml` does NOT exist:**
```
❌ No project manifest found.

Run /cspec:architect first to initialize the project.
```

---

### 0.5. Parse Feature Name Parameter

Check if feature name was provided as parameter:

**If feature name provided:**
```
/cspec:task user-authentication
            ^^^^^^^^^^^^^^^^^^^
            Feature name
```
- Store feature name for Step 4
- Use **Manual Selection Mode**
- Proceed to Step 1

**If NO feature name provided:**
```
/cspec:task
(no parameter)
```
- Enable **Auto-Selection Mode**
- Will auto-select next ready feature in Step 4
- Proceed to Step 1

Store the mode (manual/auto) for use in Step 4.

### 1. Check for Project Architecture

**Check for `{ARCHITECTURE_PATH}` (version-aware from Step 0):**

**If architecture does NOT exist:**
```
❌ No project architecture found.

You need to create the project architecture first.

Run: /cspec:architect

This will create the master architecture and feature roadmap.
```

Stop and inform user.

**If architecture exists:** Proceed to Step 2.

### 2. Read Project Context

Read these files in order (using version-aware paths from Step 0):

**A) Read `{ARCHITECTURE_PATH}`**
- Understand project architecture
- Note technical decisions (ADRs)
- Identify patterns to follow
- Extract security requirements
- Note development standards

**B) Read `{ROADMAP_PATH}`**
- Find all features
- Check feature statuses
- Identify dependencies

**C) Read `{GUIDELINES_PATH}`** (if exists)
- Code organization rules
- Testing requirements
- Security checklist
- Performance budgets

**D) Read `CLAUDE.md`**
- App folder configuration
- Tech stack
- Project structure
- Existing conventions

### 3. Find Feature in Roadmap

Check mode from Step 0: **Manual Selection** or **Auto-Selection**.

---

#### Mode A: Manual Selection (feature name provided)

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

---

#### Mode B: Auto-Selection (no feature name provided)

**Auto-select next ready feature from roadmap:**

**1. Read `.specs/roadmap.yml`**

Parse all phases and features.

**2. Build candidate list:**

For each feature in the roadmap:
- Filter where `status: "not_started"`
- Check if ALL dependencies have `status: "completed"`
- Add to candidates list if dependencies met

**3. Sort candidates by priority:**

Sort remaining features by:
1. `phase.id` (ascending) - earlier phases first
2. `priority` (descending): critical > high > medium > low
3. `feature.id` (ascending) - maintains roadmap order

**4. Select first feature from sorted list**

---

**If candidates found (at least one ready feature):**

```
🎯 Auto-selected next feature: user-authentication

Feature Details:
- ID: F3
- Phase: Phase 1 - Foundation
- Priority: high
- Status: not_started
- Dependencies: F1 ✓, F2 ✓ (All completed)
- Estimated: 5 days

Selection Criteria:
✓ Highest priority in earliest phase with unmet dependencies
✓ All dependencies completed
✓ Ready to start immediately

Proceeding with task creation...
```

Store the selected feature and proceed to Step 4.

---

**If NO candidates (all not_started features blocked by dependencies):**

```
⚠️ No features are ready to start.

All not_started features have unmet dependencies:

Phase 1 - Foundation:
  F3: user-authentication (high)
    Blocked by: F1 (in_progress), F2 (not_started)

Phase 2 - Core Features:
  F5: payment-integration (critical)
    Blocked by: F3 (not_started), F4 (in_progress)

Recommendation: Complete in-progress features first.

Options:
1. Check current work: /cspec:status
2. Continue working on a task: /cspec:implement
3. Manually override (skip dependency check): /cspec:task [feature-name]

💡 Tip: Auto-selection only picks features with all dependencies met.
```

Stop and inform user.

---

**If NO candidates (all features are started or completed):**

```
✅ All features are either in progress or completed!

Progress Summary:
  - Completed: 3 features
  - In Progress: 2 features
  - Not Started: 0 features

Great progress! All planned features are underway or done.

Options:
1. Check in-progress tasks: /cspec:status
2. Continue working on a task: /cspec:implement
3. Add new features to roadmap: .specs/roadmap.yml
4. Review architecture: /cspec:architect
```

Stop and inform user.

---

**If NO candidates (roadmap is empty):**

```
❌ No features found in roadmap.

The roadmap appears empty. Add features to .specs/roadmap.yml.

Or run `/cspec:architect` to design project architecture and create roadmap.
```

Stop and inform user.

---

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

### 6. Determine Next Task Number

**Generate sequential task ID:**

1. **Read `{TASKS_PROGRESS_PATH}`** (version-aware) to get all existing task IDs
   - Extract the numeric prefix from each task ID (001, 002, 003, etc.)
   - Build a list of existing numbers

2. **Find lowest available number:**
   - Start with 001
   - Check if 001 exists, if not → use 001
   - If 001 exists, check 002, then 003, etc.
   - Use first number not in the list (fills gaps from deleted tasks)

3. **Format as 3-digit ID:**
   - Pad with leading zeros: 1 → 001, 15 → 015, 100 → 100
   - Maximum: 999

**Example logic:**
```
Existing tasks: 001, 003, 004
Gap at: 002
Next task ID: 002
```

```
Existing tasks: 001, 002, 003
No gaps
Next task ID: 004
```

**Store the task ID** as: `NNN-feature-name` (e.g., `001-user-authentication`)

### 7. Create Task Directory

**Create directory:** `{TASKS_PATH}/NNN-feature-name/`

Example: `.specs/versions/v1/tasks/001-user-authentication/`

Format: `NNN` is the 3-digit sequential task number from Step 6 (e.g., `001-user-authentication`, `002-export-metrics`)

This will hold all files for this feature.

### 8. Create Spec File

**Create: `{TASKS_PATH}/NNN-feature-name/spec.yml`**

Use the template at `.specs/template/spec.yml.template`.

**Fill in based on:**
- Feature details from roadmap
- Planning from Step 5
- Project architecture alignment (read `{ARCHITECTURE_PATH}`)
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

### 9. Create Progress Tracker

**Create: `{TASKS_PATH}/NNN-feature-name/progress.yml`**

Use the template at `.specs/template/progress.yml.template`.

**Fill in based on:**
- Task breakdown from Step 6
- Testing approach from project
- Domain assignments (if multi-agent)

**Tasks should come from feature architecture Step 7.**

### 10. Create Context File

**Create `{TASKS_PATH}/NNN-feature-name/context.md`**

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

### 11. Update Task Index

**Update `{TASKS_PROGRESS_PATH}`:**

Add entry for this task:

```yaml
tasks:
  - id: "NNN-feature-name"  # Sequential task ID from Step 6
    name: "feature-name"
    status: "in_progress"
    priority: "[priority from roadmap]"
    created: "YYYY-MM-DD"  # Today's date
    completed: null
```

### 12. Update Roadmap Status

**Update `{ROADMAP_PATH}`:**

Find the feature and update its status:

```yaml
features:
  - id: "F3"
    name: "user-authentication"
    status: "in_progress"  # Changed from "not_started"
    started: "2025-01-08T14:30:00"  # Add timestamp
```

### 13. Present Task Summary

Show the user what was created:

```
✅ Task Created: [Feature Name]

📋 Feature Details:
- ID: [F3]
- Task: NNN-feature-name  # Sequential task ID (e.g., 001-user-authentication)
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
- {TASKS_PATH}/NNN-feature-name/spec.yml (requirements & technical design)
- {TASKS_PATH}/NNN-feature-name/progress.yml (task tracking)
- {TASKS_PATH}/NNN-feature-name/context.md (resumption context)

📝 Updated:
- {TASKS_PROGRESS_PATH} (task index updated)
- {ROADMAP_PATH} (feature status: not_started → in_progress)

---

📖 Next Steps:
1. Review feature architecture
2. Run `/cspec:implement` to begin implementation

✅ Task ready for implementation!
```

**DO NOT start implementation.** Present the task and stop.

### 14. Complete Task Creation

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

- **Auto-selection:** Run `/cspec:task` without parameters to automatically work on the next priority feature
- **Smart selection:** Auto-selection only picks features with all dependencies met
- **Manual override:** Use `/cspec:task [feature-name]` to work on a specific feature (bypasses dependency checks if needed)
- **Check dependencies:** Always verify if dependency features are complete before starting
- **Follow project patterns:** Reference project architecture.md throughout
- **Stay aligned:** Feature architecture should fit project architecture
- **Use roadmap:** Roadmap is the source of truth for feature scope
- **Multiple tasks:** You can have multiple in-progress tasks tracked in .specs/tasks/progress.yml

## Success Criteria

- Feature found in roadmap
- Dependencies checked (all completed or user accepted risk)
- Sequential task ID generated (filling gaps if any exist)
- Task directory created with all files (.specs/tasks/NNN-feature-name/)
- Feature architecture aligns with project architecture
- All files reference project context
- .specs/tasks/progress.yml index updated
- Roadmap status updated to in_progress
- Ready for implementation with `/cspec:implement`
