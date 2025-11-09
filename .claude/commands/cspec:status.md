---
name: cspec:status
description: View all tasks with filtering and status overview
---

Display task overview from `.specs/tasks/progress.yml` with filtering options.

**Usage:**
```
/cspec:status                    # Show all tasks
/cspec:status status=in_progress # Filter by status
/cspec:status priority=high      # Filter by priority
```

## What This Does

1. Reads `.specs/tasks/progress.yml`
2. Displays tasks in formatted table
3. Shows project completion statistics
4. Supports filtering by status, priority, or date

## Process

### 1. Check for Task Index

Look for `.specs/tasks/progress.yml`.

**If NOT found:**
```
❌ No task index found.

Run /cspec:task [feature-name] to create your first task.
```

Stop and inform user.

**If found:** Proceed to Step 2.

### 2. Parse Filter Parameters

Check if filter parameters are provided:
- `status=[value]` → Filter by status (pending/in_progress/completed/blocked)
- `priority=[value]` → Filter by priority (high/medium/low)
- `date=[YYYY-MM]` → Filter by creation month
- No parameters → Show all tasks

Store filter for use in Step 4.

### 3. Read Task Index

Read `.specs/tasks/progress.yml` and parse the YAML.

Extract:
- All task entries
- Task metadata (id, name, status, priority, created, completed, blocked_reason)

### 4. Filter Tasks

Apply filters from Step 2:

**Status filter:**
```yaml
# If status=in_progress, show only:
tasks:
  - id: "001-feature"
    status: "in_progress"  # ✓ Matches
  - id: "002-other"
    status: "completed"    # ✗ Filtered out
```

**Priority filter:**
```yaml
# If priority=high, show only:
tasks:
  - priority: "high"       # ✓ Matches
  - priority: "medium"     # ✗ Filtered out
```

**Date filter:**
```yaml
# If date=2025-01, show only tasks created in January 2025:
tasks:
  - created: "2025-01-09"  # ✓ Matches
  - created: "2025-02-01"  # ✗ Filtered out
```

### 5. Calculate Statistics

Calculate overall project metrics:

```
Total tasks: [N]
Completed: [X] ([percentage]%)
In Progress: [Y]
Pending: [Z]
Blocked: [B]
```

### 6. Display Task Table

Format and display tasks in a table:

```
┌───────────────────┬──────────────────────┬────────────┬──────────┬────────────┬─────────────┐
│ Task ID           │ Name                 │ Status     │ Priority │ Created    │ Completed   │
├───────────────────┼──────────────────────┼────────────┼──────────┼────────────┼─────────────┤
│ 001-user-auth     │ user-auth            │ completed  │ high     │ 2025-01-09 │ 2025-01-15  │
│ 002-export-metrics│ export-metrics       │ in_progress│ medium   │ 2025-01-20 │ -           │
│ 003-dashboard     │ dashboard            │ pending    │ low      │ 2025-01-25 │ -           │
│ 004-api-v2        │ api-v2               │ blocked    │ high     │ 2025-01-26 │ -           │
└───────────────────┴──────────────────────┴────────────┴──────────┴────────────┴─────────────┘

📊 Project Status:
  Total: 4 tasks
  ✅ Completed: 1 (25%)
  🔄 In Progress: 1 (25%)
  ⏳ Pending: 1 (25%)
  🚫 Blocked: 1 (25%)
```

**For blocked tasks, show blocked_reason if present:**
```
⚠️ Blocked Tasks:
  - 004-api-v2: Waiting for backend API specification
```

### 7. Show Active Task Hint

If any tasks are `in_progress`, show hint:

```
💡 To work on a task, run: /cspec:implement
```

If multiple `in_progress` tasks, show selection hint:

```
💡 Multiple tasks in progress. /cspec:implement will ask which one to work on.
```

### 8. Show Next Steps

Based on task status, suggest next actions:

**If no tasks exist:**
```
📝 Next Steps:
  1. Run /cspec:architect to design project architecture
  2. Run /cspec:task [feature-name] to create your first task
```

**If all tasks completed:**
```
🎉 All tasks completed!

📝 Next Steps:
  1. Add new features: /cspec:architect [feature-name]
  2. Create new tasks: /cspec:task [feature-name]
```

**If tasks in progress:**
```
📝 Next Steps:
  1. Continue work: /cspec:implement
  2. Mark task complete: /cspec:complete [task-id]
```

**If pending tasks exist:**
```
📝 Next Steps:
  1. Start next task: /cspec:task [feature-name]
  2. View roadmap: Check .specs/roadmap.yml
```

## Filter Examples

### Show only in-progress tasks
```
/cspec:status status=in_progress
```

Output:
```
Showing: in_progress tasks only

┌───────────────────┬──────────────────────┬────────────┬──────────┐
│ Task ID           │ Name                 │ Priority   │ Created  │
├───────────────────┼──────────────────────┼────────────┼──────────┤
│ 002-export-metrics│ export-metrics       │ medium     │ 2025-01-20│
└───────────────────┴──────────────────────┴────────────┴──────────┘

1 task in progress
```

### Show high priority tasks
```
/cspec:status priority=high
```

Output:
```
Showing: high priority tasks only

┌───────────────────┬──────────────────────┬────────────┬──────────┐
│ Task ID           │ Name                 │ Status     │ Created  │
├───────────────────┼──────────────────────┼────────────┼──────────┤
│ 001-user-auth     │ user-auth            │ completed  │ 2025-01-09│
│ 004-api-v2        │ api-v2               │ blocked    │ 2025-01-26│
└───────────────────┴──────────────────────┴────────────┴──────────┘

2 high priority tasks
```

### Show tasks from January 2025
```
/cspec:status date=2025-01
```

Output:
```
Showing: tasks created in 2025-01

┌───────────────────┬──────────────────────┬────────────┬──────────┐
│ Task ID           │ Name                 │ Status     │ Created  │
├───────────────────┼──────────────────────┼────────────┼──────────┤
│ 001-user-auth     │ user-auth            │ completed  │ 2025-01-09│
│ 002-export-metrics│ export-metrics       │ in_progress│ 2025-01-20│
│ 003-dashboard     │ dashboard            │ pending    │ 2025-01-25│
│ 004-api-v2        │ api-v2               │ blocked    │ 2025-01-26│
└───────────────────┴──────────────────────┴────────────┴──────────┘

4 tasks from January 2025
```

## Special Cases

**Case: Empty task index**
```
📋 No tasks found.

Run /cspec:task [feature-name] to create your first task.
```

**Case: No tasks match filter**
```
🔍 No tasks found matching: status=pending

Try:
  /cspec:status                  # Show all tasks
  /cspec:status status=in_progress
  /cspec:status priority=high
```

**Case: Multiple filters**
Currently only one filter supported at a time. If multiple provided, use the first one and warn:

```
⚠️ Multiple filters provided. Using status=in_progress.

To use multiple filters, check .specs/tasks/progress.yml directly.
```

## Tips

- **Quick status check:** Run `/cspec:status` to see what you're working on
- **Find blocked tasks:** `/cspec:status status=blocked` to see what needs attention
- **Track progress:** Use status regularly to monitor completion percentages
- **Historical view:** `/cspec:status status=completed` to see what's done

## Success Criteria

- Task index read successfully
- Tasks filtered correctly based on parameters
- Table formatted clearly with aligned columns
- Statistics calculated accurately
- Next steps shown based on current state
- Helpful hints provided for blocked/pending tasks
