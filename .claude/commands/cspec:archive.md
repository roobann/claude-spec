---
name: cspec:archive
description: Move completed task to archive and prepare for next task
---

Archive a completed task and clean up for the next feature.

**Usage:** `/archive`

**When to use:**
- Feature is complete and tested
- All requirements met
- Code reviewed and merged (if applicable)
- Ready to move on to next task

## Process

### 1. Check for Active Task

Look for `.specs/active-task/` directory.

**If NOT found:**
```
❌ No active task to archive.

Start a new feature: /architect [feature-name]
```

**If found:** Proceed with archiving.

### 2. Verify Completion

Check progress.yml to see if task is actually complete:

**A) Check completion status**
- Are all tasks marked with status: "complete"?
- Is metadata.status marked as "complete" or still "in_progress"?
- Any blockers remaining (check blockers arrays)?
- Check progress_summary.completion_percentage (should be 100%)

**B) Ask user for confirmation**

If NOT all tasks complete:
```
⚠️ Task appears incomplete:
- [X/Y] tasks completed
- Status: [Current status]
- Blockers: [If any]

Are you sure you want to archive? This usually means:
✓ All requirements implemented
✓ Tests passing
✓ Code reviewed
✓ Merged to main branch

Options:
1. Cancel and continue working
2. Archive anyway (maybe requirements changed)
3. Update progress first, then archive
```

If appears complete:
```
Task appears complete! Ready to archive.

Before archiving, confirm:
- ✓ All requirements met?
- ✓ Tests passing?
- ✓ Code reviewed (if applicable)?
- ✓ Merged/deployed (if applicable)?

Continue with archive? (yes/no)
```

### 3. Create Archive Summary

Before moving files, create a completion summary:

Read all files (spec.yml, progress.yml, context.yml, context.md) and create a summary document `SUMMARY.md`:

```markdown
# [Feature Name] - Completion Summary

**Completed:** [YYYY-MM-DD]
**Duration:** [Time from start to completion]
**Status:** ✅ Complete

## What Was Built

[Brief description of the feature that was implemented]

## Requirements Completed

- [x] Requirement 1
- [x] Requirement 2
- [x] All requirements from spec

## Key Implementation Details

**Files Created/Modified:**
- `path/to/file1.tsx` - [Description]
- `path/to/file2.ts` - [Description]
- [List main files]

**Technologies/Patterns Used:**
- [Technology or pattern]
- [Technology or pattern]

## Decisions Made

[Key architectural or technical decisions made during implementation]

## Issues Encountered & Solutions

[Significant problems faced and how they were resolved]

## Tests

- Unit tests: [X tests]
- Integration tests: [X tests]
- E2E tests: [X tests]
- All passing: ✅

## Success Criteria Met

- [x] Success criterion 1
- [x] Success criterion 2
- [All from original spec]

## Future Enhancements

[Ideas for improving or extending this feature later]

## Lessons Learned

[What went well, what could be improved for next time]

## Related Commits

[List relevant commit SHAs if available from git log]

## Original Specification

See `spec.md` in this directory for original requirements.
```

### 4. Determine Archive Location

Create archive directory name based on the feature:
- Extract feature name from spec.yml metadata.feature_name or use kebab-case version
- Format: `feature-name` (e.g., `user-authentication`, `payment-integration`)
- Use kebab-case (lowercase with hyphens)
- No date prefix needed (date is in spec.yml metadata)
- Check if `.specs/completed-tasks/` directory exists, create if needed

Example: `.specs/completed-tasks/user-authentication/`

**If duplicate name exists:**
- Add numeric suffix: `feature-name-2`, `feature-name-3`, etc.
- Or ask user to specify custom archive name

### 5. Move Files to Archive

Move the entire `active-task` directory to archive:

```bash
# Conceptually:
mv .specs/active-task/ .specs/completed-tasks/[archive-name]/
```

Include all files:
- spec.yml
- progress.yml
- context.yml
- context.md
- SUMMARY.md (newly created)
- Any other files in the directory

### 6. Clean Up Active Directory

After moving, the `.specs/active/` directory should be empty (except for `.gitkeep` if present).

Verify:
- `active-task/` directory no longer exists in `active/`
- All files successfully moved to `completed/[archive-name]/`
- No orphaned files left behind

### 7. Update Git (Recommended)

Suggest committing the archive:

```
📦 Task archived successfully!

Archived to: .specs/completed-tasks/[archive-name]/

Recommend committing the archive:

git add .specs/
git commit -m "Archive: [feature-name] - Complete"

This preserves the specification history in version control.
```

### 8. Present Summary

Show the user what happened:

```
✅ Task Archived Successfully

📦 Feature: [Feature Name]
📁 Archived to: .specs/completed-tasks/[archive-name]/

📊 Final Stats:
- Duration: [X days/hours]
- Tasks completed: [Y]
- Files modified: [Z]
- Tests added: [N]

📝 Files Archived:
- spec.yml - Original specification (YAML format)
- progress.yml - Task tracking (YAML format)
- context.yml - Structured metadata (YAML format)
- context.md - Human-readable context (Markdown)
- SUMMARY.md - Completion summary

🎉 Key Achievements:
- [Achievement 1]
- [Achievement 2]
- [Achievement 3]

Next steps:
1. Commit the archive to git (recommended)
2. Start new feature: /architect [name]
3. Or review other work

Great job completing this feature!
```

### 9. Prepare for Next Task

Confirm the active workspace is clean:

```
✨ Active workspace is now clean and ready for next task.

To start next feature:
/architect [feature-name]

To see all archived tasks:
Check .specs/completed-tasks/ directory
```

## Special Cases

### Case: Want to archive with different name

```
Default archive name: [suggested-name]

Enter custom name (or press enter for default):
```

### Case: Archive directory already exists

```
⚠️ Archive directory already exists: .specs/completed-tasks/[name]/

Options:
1. Use different name: [name]-2
2. Overwrite existing (will backup to [name]-backup)
3. Cancel archive

Choose option:
```

### Case: Files not in git yet

```
⚠️ Warning: Archiving files that aren't committed to git yet.

Current git status:
- [X files] untracked/modified

Recommend:
1. Commit current work first
2. Then archive

Continue with archive anyway? (yes/no)
```

### Case: Task abandoned (not complete)

If user wants to archive incomplete work:

```
This task is being archived as INCOMPLETE.

Marking SUMMARY.md with:
**Status:** ⚠️ Incomplete/Abandoned

Reason (optional): [User can provide reason]

This preserves the work done and thinking for potential future reference.
```

## Archive Directory Structure

After archiving, structure should look like:

```
.specs/
├── active-task/
│   └── .gitkeep (empty, ready for next task)
├── completed-tasks/
│   ├── user-authentication/
│   │   ├── spec.yml
│   │   ├── progress.yml
│   │   ├── context.yml
│   │   ├── context.md
│   │   └── SUMMARY.md
│   ├── payment-integration/
│   │   ├── spec.yml
│   │   ├── progress.yml
│   │   ├── context.yml
│   │   ├── context.md
│   │   └── SUMMARY.md
│   └── [other-archived-tasks]/
└── template/
    ├── spec.yml.template
    ├── progress.yml.template
    ├── context.yml.template
    └── context.md.template
```

## Benefits of Archiving

**Historical Record:**
- See what features were built and when
- Reference past implementation decisions
- Learn from previous approaches

**Clean Workspace:**
- `/resume` won't load old completed tasks
- Clear separation between active and done
- Easier to focus on current work

**Knowledge Base:**
- SUMMARY.md creates searchable documentation
- Future developers can understand past features
- Patterns and decisions are preserved

**Project History:**
- Track velocity and progress
- See evolution of the codebase
- Reference for similar future features

## Success Criteria

- active-task/ directory moved to completed/
- SUMMARY.md created with comprehensive info
- Active workspace is empty and clean
- Archive is committed to git
- User knows how to start next task
- Historical record preserved
