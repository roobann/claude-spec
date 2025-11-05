---
name: cspec:checkpoint
description: Save current progress and context for seamless resumption later
---

Save the current session state for perfect resumption in future sessions.

**Usage:** `/checkpoint`

**When to use:**
- End of work session
- Before taking a break
- Before context switching to another task
- After completing major milestones
- Before meetings or interruptions

## Process

### 1. Check for Active Task

Look for `.specs/active-task/` directory.

**If NOT found:**
```
❌ No active task to checkpoint.

Start a new feature first: /plan [feature-name]
```

**If found:** Proceed with checkpoint.

### 2. Gather Current State

Collect information about the current state:

**A) Git Status**
- Current branch name
- Modified files (staged and unstaged)
- Any uncommitted changes
- Current commit message if relevant

**B) Work Completed This Session**
- What tasks were finished
- What progress was made
- What decisions were made

**C) Current Focus**
- What is currently being worked on
- What's partially complete
- Where exactly the work stopped

**D) Next Actions**
- What should be done next
- What files need to be modified next
- What approaches to try

### 3. Update progress.md

Read current progress.md and update it:

**A) Move completed items to "Completed" section**
```markdown
## Completed
- [x] Task that was just finished
- [x] Previous completed tasks...
```

**B) Update "In Progress" section**
```markdown
## In Progress
- [ ] Current task (75% complete)
  - Specific detail about what's done
  - What remains to be done
```

**C) Update "Next Steps" section**
```markdown
## Next Steps
1. Immediate next action (be very specific)
2. Following action
3. Then this action
```

**D) Add any new decisions**
```markdown
## Decisions Made
- [YYYY-MM-DD HH:MM] Decision about X approach
- Previous decisions...
```

**E) Document any issues**
```markdown
## Issues Encountered
- [YYYY-MM-DD] Issue with X, resolved by doing Y
- Previous issues...
```

**F) Update status and timestamp**
```markdown
**Status:** In Progress
**Last Updated:** [YYYY-MM-DD HH:MM]
**Current Phase:** [Phase name]
```

**G) Update time tracking if present**
```markdown
**Time Spent:** [X hours] (added [Y hours] this session)
```

### 4. Update context.md

This is the CRITICAL file for resumption. Update thoroughly:

**A) Update "Current Focus" section**
```markdown
## Current Focus

[One clear paragraph describing exactly what you're working on right now]

Currently implementing [specific feature/function] in [specific file].
The approach is [brief description]. Next need to [specific next step].
```

**B) Update "Files Modified" section**
```markdown
## Files Modified

**Active (currently editing):**
- `src/components/LoginForm.tsx` - Implementing form validation (70% done)
  - Form rendering complete
  - Validation logic in progress
  - Need to add error messages

**Modified this session:**
- `src/lib/validations.ts` - Added email validation function
- `src/types/auth.ts` - Added LoginFormData interface
```

**C) Update "Git Status"**
```markdown
## Git Status

Branch: `feature/user-authentication`
- 3 files modified
- 1 file staged (validations.ts)
- 2 files unstaged (LoginForm.tsx, auth.ts)
- Not yet committed
```

**D) Update "What's Working"**
```markdown
## What's Working

- Form renders correctly with all fields
- Email validation working
- State management with React Hook Form working
- Type checking passing
```

**E) Update "What Needs Work"**
```markdown
## What Needs Work

- Password validation incomplete (missing strength check)
- Error messages not showing up (bug in error display)
- Loading state missing
- Submit handler needs error boundary
```

**F) Update "For Next Session" with EXPLICIT instructions**
```markdown
## For Next Session

When resuming:
1. Open `src/components/LoginForm.tsx` (line 45)
2. Review the `handleSubmit` function
3. Add password strength validation using the pattern from SignUpForm
4. Fix error message display - check the ErrorMessage component props
5. Add loading state using isSubmitting from useForm
6. Test with invalid credentials to verify error handling

The validation logic is in `src/lib/validations.ts` - reference the
`validatePassword` function. Follow the same pattern as email validation.
```

**G) Add any relevant technical context**
```markdown
## Technical Context

- Using React Hook Form v7 with Zod validation
- Error messages styled with Tailwind CSS
- Following the form pattern from `src/components/forms/BaseForm.tsx`
- API calls use the custom `apiClient` from `src/lib/api.ts`

Key dependencies:
- react-hook-form: Form state management
- zod: Schema validation
- @hookform/resolvers: Bridge RHF and Zod
```

**H) Update timestamp**
```markdown
**Last Updated:** [YYYY-MM-DD HH:MM]
**Current State:** [In Progress / Blocked / Testing / etc.]
```

### 5. Update CLAUDE.md if Needed

**HIGH PRIORITY:** Review if CLAUDE.md needs updates based on work completed this session:

**Update CLAUDE.md if:**
- Added new dependencies during this session
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
```

If no updates needed, skip this step.

### 6. Verify Checkpoint Quality

Check that the checkpoint is good:

**Quality Checklist:**
- [ ] progress.md has clear next steps
- [ ] context.md has explicit resumption instructions
- [ ] File locations are specific (with line numbers if relevant)
- [ ] Current focus is clearly described
- [ ] "What's working" and "What needs work" are up to date
- [ ] Any decisions or issues are documented
- [ ] Git status is captured
- [ ] Next session knows exactly where to start

### 7. Present Summary

Show the user what was saved:

```
✅ Checkpoint saved successfully

📊 Progress Updated:
- Completed: [X items]
- In Progress: [Y items]
- Next: [Immediate next action]

📝 Context Captured:
- Current focus: [One sentence]
- Files being edited: [X files]
- Working: [Key items]
- Needs work: [Key items]

🎯 Next Session Will Start With:
[First action from "For Next Session"]

📋 Files Updated:
- .specs/active-task/progress.md
- .specs/active-task/context.md

💡 Recommend:
git add . && git commit -m "WIP: [feature] - [what's done]"

Ready to continue working anytime with /implement
```

If CLAUDE.md was updated, also mention that in the summary.

### 8. Suggest Git Commit

If there are uncommitted changes, suggest:

```
💾 You have uncommitted changes. Recommend committing:

git add .
git commit -m "WIP: [auto-suggested message based on progress]"

This ensures context is saved in git and available on other machines.
```

## Special Cases

### Case: No significant progress made

If nothing was actually completed:
```
📝 Checkpoint saved, but no tasks were completed this session.

Current state:
- Still working on: [current item]
- Context updated with current thinking
- Ready to resume from same point
```

### Case: Major milestone reached

If a phase or major task completed:
```
🎉 Checkpoint saved - Major milestone reached!

Completed Phase: [Phase name]
- [List key completions]

Next Phase: [Next phase name]
- [Preview of what's coming]

Consider:
1. Running tests before next session
2. Getting code review
3. Demoing progress
```

### Case: Encountered blocker

If work is blocked:
```
⚠️ Checkpoint saved - Blocker detected

Current blocker:
- [Description of what's blocking]

Context saved with:
- What was attempted
- Why it's not working
- Possible solutions to try

Next session should:
1. Research [specific topic]
2. Try [alternative approach]
3. Or seek help with [specific question]
```

### Case: Context switch needed

If user needs to work on something else:
```
✅ Checkpoint saved for context switch

Current task state saved:
- [Summary of current task]

To switch tasks:
1. /checkpoint (already done ✓)
2. /clear (to reset Claude's context)
3. /plan or /implement (for other task)

To return to this task later:
- /implement will load this checkpoint and continue working
```

## Best Practices

**Checkpoint Frequency:**
- Every 30-60 minutes of work
- After completing each subtask
- Before any break (even short ones)
- Before context switching
- End of every session

**Context Quality:**
- Be specific about file locations
- Include line numbers for precision
- Document "why" not just "what"
- Note any tricky/confusing parts
- Link to helpful resources or examples

**Progress Accuracy:**
- Mark items as complete only when truly done
- Use percentage for partial completion
- Update time estimates if needed
- Document blockers honestly

## Success Criteria

- progress.md accurately reflects current state
- context.md enables instant resumption
- Next steps are clear and actionable
- All decisions and issues documented
- Git status captured
- File locations specific
- User can resume in days/weeks with zero ramp-up
