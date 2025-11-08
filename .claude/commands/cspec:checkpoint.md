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

Start a new feature first: /architect [feature-name]
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

**E) Docker Container State**
- Have code changes been made since last Docker rebuild?
- Is container running with latest code or old code?
- Note if rebuild needed before resuming work
- Check: `docker compose ps` to see running containers

### 3. Update progress.yml (MANDATORY - DO NOT SKIP)

⚠️ **CRITICAL**: Updating progress.yml is REQUIRED for checkpointing. This step cannot be skipped.

Read current progress.yml and update it completely:

**A) Update completed tasks**
```yaml
phases:
  - id: 1
    tasks:
      - id: "T1"
        status: "complete"  # Update from in_progress
        completed: "2025-11-07T15:30:00"  # Add timestamp
```

**B) Update in-progress tasks**
```yaml
current_work:
  phase_id: 2
  task_id: "T5"
  description: "Implementing form validation"
  progress: 75
  blockers: []
```

**C) Update next steps**
```yaml
next_steps:
  - priority: 1
    action: "Complete validation logic in LoginForm.tsx"
    file: "src/components/LoginForm.tsx"
    line: 45
  - priority: 2
    action: "Add error message display"
```

**D) Add new decisions**
```yaml
decisions:
  - timestamp: "2025-11-07T15:30:00"
    decision: "Use Zod for validation"
    reason: "Better type safety and error messages"
```

**E) Document issues**
```yaml
issues:
  - timestamp: "2025-11-07T14:30:00"
    issue: "Email validation not triggering"
    resolution: "Fixed by adding onChange handler"
    time_spent_minutes: 20
```

**F) Update metadata and summary**
```yaml
metadata:
  status: "in_progress"
  updated: "2025-11-07T15:30:00"
  current_phase: 2

progress_summary:
  completed_tasks: 3
  total_tasks: 7
  completion_percentage: 43
```

**G) Update time tracking**
```yaml
time_tracking:
  actual_hours: 6.5
  sessions:
    - date: "2025-11-07"
      start: "09:00"
      end: "15:30"
      hours: 6.5
```

**H) Multi-Agent Mode: Update domain-specific progress**

If `metadata.agent_coordination: true`, also update:

```yaml
metadata:
  current_domain: "backend"  # Domain currently being worked on

progress_summary:
  by_domain:
    backend:
      total_tasks: 5
      completed_tasks: 3
      completion_percentage: 60
    frontend:
      total_tasks: 4
      completed_tasks: 0
      completion_percentage: 0
```

Update tasks with domain completion status:
```yaml
tasks:
  - id: "T1"
    domain: "backend"
    assigned_agent: "backend-expert"
    status: "complete"
    completed: "2025-11-07T14:00:00"
  - id: "T2"
    domain: "frontend"
    assigned_agent: "frontend-expert"
    status: "pending"
    dependencies: ["T1"]  # Now unblocked since T1 complete
```

### 4. Update Context Files (context.yml + context.md)

These are CRITICAL files for resumption. Update both thoroughly:

**First, update context.yml (structured data):**

**A) Update session focus**
```yaml
session:
  focus:
    summary: "Implementing form validation"
    phase: 2
    file: "src/components/LoginForm.tsx"
    line: 45
    action: "Add password strength validation"

  docker:
    rebuild_needed: true
    last_rebuild: "2025-11-07T09:00:00"
    code_changes_since_rebuild: true

  git:
    branch: "feature/user-authentication"
    files_modified: 3
    files_staged: 1
    files_unstaged: 2
    committed: false
```

**B) Update files section**
```yaml
files:
  active:
    - path: "src/components/LoginForm.tsx"
      purpose: "Login form UI"
      progress: 70
      status: "Form rendering complete, validation in progress"

  modified_today:
    - path: "src/lib/validations.ts"
      change: "Added email validation function"
      timestamp: "2025-11-07T14:00:00"
    - path: "src/types/auth.ts"
      change: "Added LoginFormData interface"
      timestamp: "2025-11-07T14:15:00"

  next_to_modify:
    - path: "src/components/ErrorMessage.tsx"
      purpose: "Fix error display bug"
      line: null
```

**C) Update status summary**
```yaml
status:
  working:
    - "Form renders correctly with all fields"
    - "Email validation working"
    - "State management with React Hook Form working"

  needs_work:
    - "Password validation incomplete (missing strength check)"
    - "Error messages not showing up (bug in error display)"
    - "Loading state missing"
```

**D) Update next session actions**
```yaml
next_session:
  immediate_actions:
    - priority: 1
      action: "REBUILD Docker (code changes made)"
      file: null
    - priority: 2
      action: "Open LoginForm.tsx and add password validation"
      file: "src/components/LoginForm.tsx"
      line: 45
    - priority: 3
      action: "Fix error message display bug"
      file: "src/components/ErrorMessage.tsx"

  reference_files:
    - "src/lib/validations.ts - validatePassword function"
    - "src/components/SignUpForm.tsx - validation pattern example"

  docker_reminder: "REBUILD Docker before testing (code changes made since last rebuild). See CLAUDE.md Docker Rebuild Rules."
```

**E) Multi-Agent Mode: Update domain context**

If `metadata.agent_coordination: true`, update domain-specific context:

```yaml
metadata:
  current_domain: "backend"  # Current domain being worked on

domain_context:
  backend:
    active_files:
      - "backend/src/controllers/auth.controller.ts"
      - "backend/src/services/jwt.service.ts"
    completed_tasks:
      - "T1: JWT authentication service complete"
      - "T3: Login endpoint implementation complete"
    blockers: []
    handoff_notes: |
      Backend authentication API is complete and tested.
      Frontend can now integrate with:
      - POST /api/auth/login (expects email, password)
      - POST /api/auth/refresh (expects refresh_token)
      - Returns: { access_token, refresh_token, user }

  frontend:
    active_files: []
    completed_tasks: []
    blockers:
      - "Waiting for backend API completion (T1)"
    handoff_notes: "Ready to start once backend API is deployed"

next_session:
  by_domain:
    backend:
      - priority: 1
        action: "Deploy authentication service to staging"
        file: null
    frontend:
      - priority: 1
        action: "Create LoginForm component"
        file: "frontend/src/components/LoginForm.tsx"
      - priority: 2
        action: "Integrate with backend /api/auth/login endpoint"
```

**Then, update context.md (human narrative):**

**E) Update "Current Focus" section**
```markdown
## Current Focus

Implementing form validation for login feature. Form UI is complete and renders correctly.
Currently working on validation logic in LoginForm.tsx. Email validation is working,
but password strength validation is incomplete. Next need to add password strength check
using the pattern from SignUpForm component.
```

**F) Update "Files Modified" section**
```markdown
## Files Modified

**Active (currently editing):**
- `src/components/LoginForm.tsx` (line 45) - Implementing form validation (70% done)
  - Form rendering complete ✅
  - Email validation working ✅
  - Password validation in progress (missing strength check)
  - Error display has bug

**Modified this session:**
- `src/lib/validations.ts` - Added email validation function
- `src/types/auth.ts` - Added LoginFormData interface

**Next to modify:**
- `src/components/ErrorMessage.tsx` - Fix error display bug
```

**G) Update "What's Working" and "What Needs Work"**
```markdown
## What's Working
- Form renders correctly with all fields
- Email validation working with proper error messages
- State management with React Hook Form working smoothly
- Type checking passing

## What Needs Work
- Password validation incomplete (missing strength check)
- Error messages not displaying (bug in ErrorMessage component)
- Loading state missing (need to add isSubmitting state)
- Submit handler needs error boundary
```

**H) Update "For Next Session"**

**IMPORTANT:** See CLAUDE.md "Docker Rebuild Rules (CRITICAL)" section for complete rebuild guidance.

```markdown
## For Next Session

⚠️ **REBUILD DOCKER FIRST** - Code changes made since last rebuild!

When resuming:
1. **REBUILD Docker:** `docker compose up --build -d` (see CLAUDE.md Docker Rebuild Rules)
2. Verify rebuild: `docker compose logs -f [service-name]`
3. Open `src/components/LoginForm.tsx` (line 45)
4. Review the `handleSubmit` function
5. Add password strength validation using pattern from SignUpForm
6. Fix error message display - check ErrorMessage component props
7. Add loading state using isSubmitting from useForm
8. **REBUILD again after changes, then test**

Reference `src/lib/validations.ts` for validatePassword function. Follow same pattern as email validation.
```

**I) Add technical context**
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

**I) Update timestamp**
```markdown
**Last Updated:** [YYYY-MM-DD HH:MM]
**Current State:** [In Progress / Blocked / Testing / etc.]
```

**J) Multi-Agent Mode: Add domain-specific sections**

If `metadata.agent_coordination: true`, add domain sections to context.md:

```markdown
## Multi-Agent Progress

### Backend Domain (Current)
**Status:** In Progress (60% complete)
**Agent:** backend-expert

**Completed:**
- JWT authentication service
- Login endpoint with validation
- Refresh token rotation

**In Progress:**
- Password reset endpoint (50% done)

**Next:**
- Complete password reset
- Add rate limiting to auth endpoints

**Handoff Notes for Frontend:**
Backend authentication API is ready:
- POST /api/auth/login - Expects: {email, password}, Returns: {access_token, refresh_token, user}
- POST /api/auth/refresh - Expects: {refresh_token}, Returns: {access_token}
- Tokens expire in 15min (access) and 7days (refresh)

### Frontend Domain
**Status:** Pending
**Agent:** frontend-expert

**Blockers:**
- Waiting for backend API completion (now unblocked ✅)

**Ready to Start:**
- Create LoginForm component
- Integrate with /api/auth/login
- Add token storage in localStorage

### DevOps Domain
**Status:** Pending
**Agent:** devops-expert

**Upcoming:**
- Add JWT_SECRET to environment
- Configure HTTPS for auth endpoints
- Set up staging deployment
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
- [ ] progress.yml has accurate counts and percentages
- [ ] progress.yml next_steps are clear and specific
- [ ] context.yml has all structured metadata updated
- [ ] context.md has explicit resumption instructions
- [ ] File locations are specific (with line numbers if relevant)
- [ ] Current focus is clearly described (in both files)
- [ ] "What's working" and "What needs work" are up to date
- [ ] Any decisions or issues are documented (in progress.yml and context.md)
- [ ] Git status is captured (in context.yml)
- [ ] Docker rebuild status is documented (in context.yml)
- [ ] Next session knows exactly where to start (context.yml immediate_actions)

### 7. Present Summary

Show the user what was saved:

```
✅ Checkpoint saved successfully

📊 Progress Updated (progress.yml):
- Completed: [X/Y tasks (Z%)]
- Current phase: Phase [N]
- In progress: [Task ID] - [Description]
- Next: [Immediate next action]

📝 Context Captured (context.yml + context.md):
- Current focus: [One sentence]
- Files being edited: [X files]
- Working: [Key items]
- Needs work: [Key items]
- Docker rebuild needed: [Yes/No]

🎯 Next Session Will Start With:
[First action from context.yml immediate_actions]

📋 Files Updated:
- .specs/active-task/progress.yml (YAML format)
- .specs/active-task/context.yml (structured metadata)
- .specs/active-task/context.md (human narrative)

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
3. /architect or /implement (for other task)

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
