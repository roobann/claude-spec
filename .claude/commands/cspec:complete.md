---
name: cspec:complete
description: Mark task as completed with validation and roadmap update
---

Mark a task as completed in `.specs/tasks/progress.yml` and update the roadmap.

**Usage:**
```
/cspec:complete [task-id]
```

**Examples:**
```
/cspec:complete 001-user-authentication
/cspec:complete 002-export-metrics
```

## What This Does

1. Validates task exists and all phases are complete
2. Updates task status to "completed" in `.specs/tasks/progress.yml`
3. Adds completion timestamp
4. Updates corresponding feature in `.specs/roadmap.yml`
5. Optional: Prompts for retrospective notes

## Process

### 1. Parse Task ID Parameter

Extract task ID from command:
```
/cspec:complete 001-user-authentication
                ^^^^^^^^^^^^^^^^^^^^^^^
                Task ID
```

**If no task ID provided:**
```
❌ Task ID required.

Usage: /cspec:complete [task-id]

Example: /cspec:complete 001-user-authentication

💡 Run /cspec:status to see all tasks
```

Stop and inform user.

**If task ID provided:** Proceed to Step 2.

### 2. Check Task Exists

**A) Check `.specs/tasks/progress.yml`**

Read the file and search for task with matching ID.

**If task not found in index:**
```
❌ Task "001-user-authentication" not found in task index.

Available tasks:
  - 002-feature-a (in_progress)
  - 003-feature-b (pending)

Run /cspec:status to see all tasks.
```

Stop and inform user.

**B) Check task folder exists**

Verify `.specs/tasks/[task-id]/` directory exists.

**If folder not found:**
```
❌ Task folder not found: .specs/tasks/001-user-authentication/

The task is in the index but the folder is missing. This shouldn't happen.

To fix:
1. Remove task from .specs/tasks/progress.yml, OR
2. Recreate task with /cspec:task
```

Stop and inform user.

**If both exist:** Proceed to Step 3.

### 3. Validate Task Can Be Completed

**A) Check current status**

If task is already "completed":
```
✅ Task "001-user-authentication" is already marked as completed.

Completed: 2025-01-15

No action needed.
```

Stop (nothing to do).

**B) Read task progress file**

Read `.specs/tasks/[task-id]/progress.yml`.

**C) Validate all phases are complete**

Check that all tasks in all phases have status="complete":

```yaml
phases:
  - name: "Setup & Foundation"
    tasks:
      - id: "T1"
        status: "complete"  # ✓ OK
      - id: "T2"
        status: "in_progress"  # ✗ NOT COMPLETE
```

**If any tasks are not complete:**
```
⚠️ Task "001-user-authentication" has incomplete work:

Phase: Setup & Foundation
  - T2: Create database schema (in_progress)

Phase: Core Implementation
  - T5: Implement login API (pending)

You can:
1. Complete remaining tasks first (recommended)
2. Mark task as complete anyway (not recommended)
3. Cancel

Choose option:
```

Wait for user choice.

**If user chooses option 1:** Stop, let them finish work.

**If user chooses option 2:** Continue but warn.

**If user chooses option 3:** Stop.

**If all tasks complete:** Proceed to Step 4.

### 4. Update Task Index

**A) Update `.specs/tasks/progress.yml`**

Find the task entry and update:

```yaml
tasks:
  - id: "001-user-authentication"
    name: "user-authentication"
    status: "completed"  # Changed from "in_progress"
    priority: "high"
    created: "2025-01-09"
    completed: "2025-01-15"  # Added timestamp (today's date)
```

**B) Save the file

**

Write the updated YAML back to `.specs/tasks/progress.yml`.

### 5. Update Roadmap

**A) Read `.specs/roadmap.yml`**

**B) Find corresponding feature**

Map task name to feature in roadmap. Usually the feature name matches the task name:

Task: `001-user-authentication`
Feature name: `user-authentication`

Search roadmap for feature with matching name:

```yaml
features:
  - id: "F3"
    name: "user-authentication"  # ✓ Match
    status: "in_progress"
```

**If feature not found:**
```
⚠️ Could not find feature "user-authentication" in roadmap.

Task marked as complete in task index, but roadmap not updated.

Manually update .specs/roadmap.yml if needed.
```

Continue anyway (task is still marked complete).

**If feature found:** Proceed to update it.

**C) Update feature status**

Update the feature entry:

```yaml
features:
  - id: "F3"
    name: "user-authentication"
    status: "completed"  # Changed from "in_progress"
    priority: "high"
    estimated_days: 5
    dependencies: []
    completed: "2025-01-15"  # Added timestamp
```

**D) Save roadmap**

Write updated YAML back to `.specs/roadmap.yml`.

### 6. Optional: Retrospective Notes

Ask user if they want to add retrospective notes:

```
✅ Task marked as completed!

Would you like to add retrospective notes? (yes/no)

Retrospective notes help document:
- What went well
- What was challenging
- Lessons learned
- Time estimates vs actual
```

**If yes:**

Prompt for notes:
```
Enter retrospective notes (or type "skip"):
```

**If user provides notes:**

Create or update `.specs/tasks/[task-id]/RETROSPECTIVE.md`:

```markdown
# Retrospective: user-authentication

**Completed:** 2025-01-15
**Duration:** 6 days (estimated: 5 days)

## Notes

[User's notes here]

## Lessons Learned

[User's input]

## What Went Well

[User's input]

## What Was Challenging

[User's input]
```

**If user skips:** Continue without notes.

### 7. Show Completion Summary

Display what was done:

```
✅ Task Completed: 001-user-authentication

📝 Updates:
  - Task status: in_progress → completed
  - Completion date: 2025-01-15
  - Roadmap updated: F3 user-authentication → completed

📂 Files Updated:
  - .specs/tasks/progress.yml
  - .specs/roadmap.yml

📊 Next Steps:
  - Run /cspec:status to see remaining tasks
  - Run /cspec:task [next-feature] to start next task
  - Check .specs/roadmap.yml for dependencies

Task folder remains in .specs/tasks/001-user-authentication/ for reference.
```

### 8. Suggest Next Task

If there are pending tasks with met dependencies, suggest them:

```
💡 Ready to start next task:

  - 002-export-metrics (high priority, dependencies met)
  - 003-dashboard (medium priority, no dependencies)

Run: /cspec:task [feature-name]
```

## Special Cases

**Case: Task is blocked**

If task status is "blocked":
```
⚠️ Task "002-export-metrics" is marked as blocked.

Blocked reason: Waiting for API specification

Are you sure you want to mark it as complete? (yes/no)
```

If yes: Proceed with completion.
If no: Stop.

**Case: No roadmap file**

If `.specs/roadmap.yml` doesn't exist:
```
⚠️ No roadmap found at .specs/roadmap.yml

Task marked as complete in task index only.

To create a roadmap, run: /cspec:architect
```

Task is still marked complete in the index.

**Case: Multiple matching features in roadmap**

If somehow multiple features match the task name:
```
⚠️ Multiple features found matching "user-authentication":
  - F3: user-authentication (in_progress)
  - F15: user-authentication-v2 (not_started)

Which feature should be marked complete?
1. F3: user-authentication
2. F15: user-authentication-v2
3. Skip roadmap update

Choose option:
```

Wait for user selection and update the chosen one.

**Case: Task folder has uncommitted changes**

Check git status for task folder:

```bash
git status .specs/tasks/001-user-authentication/
```

If there are uncommitted changes:
```
⚠️ Task folder has uncommitted changes:

  modified: .specs/tasks/001-user-authentication/progress.yml
  modified: .specs/tasks/001-user-authentication/context.md

Commit these changes before marking task complete? (yes/no)
```

If yes: Remind user to commit.
If no: Continue anyway.

## Tips

- **Validate first:** Make sure all work is truly done before completing
- **Add notes:** Retrospective notes help improve future estimates
- **Check dependencies:** Completing a task may unblock other tasks
- **Keep folder:** Completed task folders are valuable reference material
- **Review roadmap:** After completion, check roadmap for next priorities

## Success Criteria

- Task validated and exists
- All phase tasks checked for completion
- Task index updated with completion timestamp
- Roadmap updated with feature status
- User informed of what was updated
- Next steps suggested based on remaining work
- Task folder remains in place for historical reference
