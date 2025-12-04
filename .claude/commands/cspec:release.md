---
name: cspec:release
description: Manage version transitions - archive completed versions and start new ones
---

Manage project version transitions for iterative development.

**Usage:**
```
/cspec:release              # Interactive: archive current, start new
/cspec:release archive      # Archive current version only
/cspec:release new [id]     # Start a new version (e.g., v2)
/cspec:release status       # Show version overview
```

## What This Does

1. **Archive**: Marks current version as completed, generates changelog
2. **New Version**: Creates new version structure, records lineage
3. **Status**: Shows overview of all versions and their progress

## Process

### 0. Check Prerequisites

**Read `.specs/project.yml`:**

**If `.specs/project.yml` does NOT exist:**
```
❌ No project manifest found.

Run /cspec:architect to initialize the project first.
```

Stop and inform user.

**If project.yml exists:** Read version info and proceed.

### 1. Parse Command Parameters

Check command parameters:
- No parameter → **Interactive mode** (Step 2)
- `archive` → **Archive mode** (Step 3)
- `new [version-id]` → **New version mode** (Step 4)
- `status` → **Status mode** (Step 5)

---

### 2. Interactive Mode (no parameters)

Show current version status and options:

```
📦 Version Management

Current Version: v1 - MVP Release
Status: active
Started: 2025-01-01

📊 Progress:
```

**Read `{VERSION_PATH}/tasks/progress.yml` to calculate:**
- Total tasks
- Completed tasks
- In-progress tasks
- Pending tasks

```
Tasks: 4 total
  ✅ Completed: 3
  🔄 In Progress: 1
  ⏳ Pending: 0

What would you like to do?
```

Use **AskUserQuestion**:
```
Question: What would you like to do?
Options:
1. Archive v1 and start v2 (version transition)
2. Archive v1 only (mark as complete)
3. View version history
4. Cancel
```

Based on selection:
- Option 1 → Go to Step 3 (Archive), then Step 4 (New)
- Option 2 → Go to Step 3 (Archive only)
- Option 3 → Go to Step 5 (Status)
- Option 4 → Stop

---

### 3. Archive Process

**Step 3.1: Read Current Version State**

Read from `.specs/project.yml`:
- `versioning.current_version`
- Current version details (name, started date)

Read from `{VERSION_PATH}/tasks/progress.yml`:
- All tasks and their statuses

**Step 3.2: Verify Completion Status**

```
📦 Archiving: v1 - MVP Release

Task Summary:
  ✅ Completed: 3 tasks
  🔄 In Progress: 1 task
  ⏳ Pending: 0 tasks
  🚫 Blocked: 0 tasks
```

**If all tasks completed:**
```
All tasks completed! Ready to archive.
```
Proceed to Step 3.4.

**If incomplete tasks exist:**
```
⚠️ Warning: 1 task is not complete
  - 004-api-refactor: in_progress

Archive anyway?
```

Use **AskUserQuestion**:
```
Question: How to handle incomplete tasks?
Options:
1. Carry forward to next version (recommended)
2. Mark as dropped/deferred
3. Cancel archive
```

- Option 1 → Mark tasks with `carried_to: v2`
- Option 2 → Mark tasks with `status: dropped`
- Option 3 → Stop

**Step 3.3: Handle Incomplete Tasks (if any)**

For each incomplete task based on user choice:

**If "Carry forward":**
```yaml
# In {VERSION_PATH}/tasks/progress.yml, update task:
- id: "004-api-refactor"
  status: "carried"
  carried_to: "v2"  # Will be recreated in v2
```

**If "Mark as dropped":**
```yaml
- id: "004-api-refactor"
  status: "dropped"
  dropped_reason: "Deferred to future version"
```

**Step 3.4: Generate Changelog**

Create `{VERSION_PATH}/changelog.md` using template at `.specs/template/changelog.md.template`.

**Read and compile:**
- All completed tasks from `tasks/progress.yml`
- All completed features from `roadmap.yml`
- ADRs from `architecture.md`

**Fill in:**
```yaml
version: "{current_version}"
name: "{version_name}"
status: "archived"
started: "{started_date}"
completed: "{today}"
```

**Generate content:**
- Features Delivered (from roadmap.yml, status: completed)
- Tasks Completed (from tasks/progress.yml, status: completed)
- Architecture Decisions (ADRs from architecture.md)
- Carried Forward items (if any)
- Dropped items (if any)

**Step 3.5: Update Project Manifest**

Update `.specs/project.yml`:

```yaml
versions:
  - id: "v1"
    name: "MVP Release"
    status: "archived"    # Changed from "active"
    started: "2025-01-01"
    completed: "2025-03-01"  # Added today's date
    summary: "..."
```

**Step 3.6: Present Archive Summary**

```
✅ Version Archived

📦 v1 - MVP Release
Status: archived
Duration: 60 days (Jan 1 - Mar 1, 2025)

📊 Final Summary:
  - Features Delivered: 5
  - Tasks Completed: 12
  - ADRs Established: 8

📄 Changelog: {VERSION_PATH}/changelog.md

[If carried forward tasks]
📝 Carried Forward:
  - 004-api-refactor → Will be recreated in next version

[If dropped tasks]
🗑️ Dropped:
  - None

---

Next: Run /cspec:release new v2 to start the next version
Or: Run /cspec:release status to see version overview
```

---

### 4. New Version Process

**Step 4.1: Get Version Info**

**If version ID provided in command** (e.g., `/cspec:release new v2`):
- Use that version ID
- Proceed to Step 4.2

**If no version ID provided:**

Ask user:
```
Enter new version identifier (e.g., v2):
```

Wait for input. Validate format (should match version_pattern from project.yml).

**Step 4.2: Gather Version Details**

Ask user for version details:

```
📦 Creating New Version: v2

Enter version name/title:
>
```

Wait for input (e.g., "Enhanced Features")

```
Link to requirements document (optional, press Enter to skip):
>
```

Wait for input (e.g., "@docs/prd-v2.md" or empty)

```
Brief summary of this version:
>
```

Wait for input (e.g., "Payment integration, analytics, API v2")

**Step 4.3: Create Version Directory Structure**

Create directories:
```
.specs/versions/{new_version}/
.specs/versions/{new_version}/tasks/
```

**Step 4.4: Create Initial Files**

**Create `{new_version}/tasks/progress.yml`:**
Use template at `.specs/template/tasks-progress.yml.template`

**Create placeholder files (will be filled by /cspec:architect):**
- `{new_version}/roadmap.yml` - Empty or minimal template
- `{new_version}/guidelines.md` - Copy from previous version (optional)

**Step 4.5: Handle Carried Forward Tasks**

**If previous version had carried forward tasks:**

For each carried task:
1. Read task spec from `{old_version}/tasks/{task_id}/`
2. Create note in new version that these need to be recreated

```
📝 Tasks carried from v1:
  - 004-api-refactor

These will need to be recreated in v2 roadmap.
Run /cspec:architect to add them to v2 architecture.
```

**Step 4.6: Record Version Lineage**

Update `.specs/project.yml`:

Add new version:
```yaml
versioning:
  current_version: "v2"  # Updated

versions:
  - id: "v1"
    status: "archived"
    # ... existing v1 data

  - id: "v2"
    name: "Enhanced Features"
    status: "active"
    started: "2025-03-01"  # Today
    completed: null
    requirements_source: "docs/prd-v2.md"  # If provided
    summary: "Payment integration, analytics, API v2"

inheritance:
  lineage:
    v2:
      based_on: "v1"
      inherited_adrs: []  # Will be populated by /cspec:architect
      superseded_adrs: []
      carried_tasks: ["004-api-refactor"]  # If any
```

**Step 4.7: Update Symlink**

Update symlink to point to new version:
```bash
rm .specs/current  # Remove old symlink
ln -s versions/{new_version} .specs/current  # Create new symlink
```

**Step 4.8: Present New Version Summary**

```
✅ New Version Created

📦 v2 - Enhanced Features
Status: active
Started: 2025-03-01
Based on: v1

📂 Files Created:
  - .specs/versions/v2/tasks/progress.yml
  - .specs/current -> versions/v2 (symlink updated)

📝 Next Steps:
1. Design v2 architecture: /cspec:architect @docs/prd-v2.md
   - This will read v1 architecture as baseline
   - Create v2 architecture with inherited ADRs
   - Generate v2 roadmap

2. After architecture, create tasks: /cspec:task [feature-name]

3. Start implementation: /cspec:implement

[If carried tasks]
📋 Carried Tasks from v1:
  - 004-api-refactor

  Add these to v2 roadmap during /cspec:architect

Ready for v2 development!
```

---

### 5. Status Mode

Show overview of all versions:

**Read `.specs/project.yml`:**
- All versions and their status
- Current version

**For each version, read task progress:**
- Count completed/total tasks

**Display:**

```
📦 Version Overview

Project: [Project Name]
Current: v2 - Enhanced Features (Active)

┌─────────┬──────────────────────┬──────────┬───────────┬─────────────────┐
│ Version │ Name                 │ Status   │ Tasks     │ Period          │
├─────────┼──────────────────────┼──────────┼───────────┼─────────────────┤
│ v1      │ MVP Release          │ archived │ 12/12 ✅  │ Jan - Feb 2025  │
│ v2      │ Enhanced Features    │ active   │ 2/8  🔄   │ Mar 2025 -      │
│ v3      │ Enterprise           │ planned  │ -         │ -               │
└─────────┴──────────────────────┴──────────┴───────────┴─────────────────┘

📊 Overall Progress:
  - Versions Completed: 1
  - Versions Active: 1
  - Versions Planned: 1

💡 Commands:
  /cspec:release archive    - Archive v2 when complete
  /cspec:release new v3     - Start v3
  /cspec:status             - View v2 tasks
```

---

## Special Cases

**Case: Trying to start version that already exists**
```
❌ Version v2 already exists.

Choose a different version identifier or use:
  /cspec:release status - View existing versions
```

**Case: No previous version to inherit from (v1)**
```
ℹ️ This is the first version. No inheritance needed.
```

**Case: Archiving already archived version**
```
⚠️ Version v1 is already archived.

Archived on: 2025-02-28
Changelog: .specs/versions/v1/changelog.md

To start a new version: /cspec:release new v2
```

---

## Tips

- **Complete features before archiving:** Ensure all planned features are done or explicitly carried/dropped
- **Document breaking changes:** Note any breaking changes in the changelog
- **Inherit thoughtfully:** When creating v2 architecture, review which v1 ADRs still apply
- **Keep changelogs updated:** The changelog is your record of what was delivered

## Success Criteria

- Current version archived with complete changelog
- New version structure created
- Lineage recorded in project.yml
- Symlink updated to new version
- Clear next steps presented to user
- Ready for /cspec:architect to create new version's architecture
