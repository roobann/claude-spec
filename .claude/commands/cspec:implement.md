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
- **Fresh start:** Beginning implementation after `/plan`
- **Resuming work:** Continuing after breaks

## Process

### 1. Parse Command Parameters

Check if `mode` parameter is provided:
- No parameter → **Autonomous mode** (default)
- `mode=interactive` → **Interactive mode**

Store this for use during Phase 2 completion check.

### 2. Check for Active Task

Look for `.specs/active-task/` directory.

**If NOT found:**
```
❌ No active task found.

To start a new feature, run: /plan [feature-name]
To see archived tasks, check: .specs/completed-tasks/
```

**If found:** Proceed to next step.

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

Read all three context files in order of importance:

**A) Read context.md** - Most important (resumption lifeline)
- Current focus and what you're working on
- Files being modified and their status
- Git branch/status
- Architecture context and patterns to follow
- Related code to reference
- What's working vs what needs work
- **Explicit next steps** (critical!)
- Tricky areas or gotchas
- Recent decisions made

**B) Read progress.md** - Current status
- Overall task status
- Which phase we're in
- Completed tasks (with checkmarks)
- In-progress tasks (with percentages if available)
- Blocked tasks (if any)
- Next steps list
- Decisions made log
- Issues encountered log
- Time tracking

**C) Read spec.md** - Original requirements
- Feature overview and goals
- User stories
- Requirements (functional and non-functional)
- Technical design and architecture
- Success criteria
- Testing strategy

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
- progress.md status is "Planning" or "Not Started"
- No completed tasks in progress.md
- context.md says "Planning Complete" or similar
- No modified files in git related to this feature

**Resuming Indicators:**
- Some tasks are checked off in progress.md
- Status is "In Progress" or similar
- Files exist that match context.md references
- Git shows related uncommitted/committed work

**Determine:**
- What phase we're in (Phase 1, 2, 3, etc.)
- What was last completed
- What's currently in progress
- What's the immediate next step
- Are there any blockers?

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
- Start with the first unchecked task in the current phase
- Follow the technical design from spec.md
- Follow patterns identified in context.md
- Reference related code mentioned in context.md

#### C. After Completing Each Phase
**STOP AND UPDATE progress.md (MANDATORY):**

⚠️ **CRITICAL**: Before continuing to the next phase, you MUST stop and update progress.md. This is NOT optional.

**Update procedure:**
1. Read the current progress.md file
2. Check off completed tasks with [x]
3. Move completed phase tasks to "Completed" section with timestamp
4. Update "Current Phase" if moving to next phase
5. Update "Last Updated" timestamp to current date
6. Add any decisions made to "Decisions Made" section
7. Add any issues encountered to "Issues Encountered" section
8. Write the updated progress.md file

**Show user the update:**
Present a summary of what was completed:
```
✅ Phase [N] Complete - [Phase Name]

Completed tasks:
- [x] Task 1 - Description
- [x] Task 2 - Description
- [x] Task 3 - Description

Updated progress.md with completion timestamp.
```

**Example progress.md format after update:**
```markdown
## Completed

### Phase 1: Setup & Foundation (Completed 2025-11-03)
- [x] Task 1 - Created database models
- [x] Task 2 - Set up authentication middleware
- [x] Task 3 - Created test fixtures
```

**DO NOT proceed to the next phase until progress.md is updated.** This ensures accurate tracking throughout implementation.

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
- Mark Phase 3 tasks as "[Skipped - Feature sufficient as-is]"
- Update progress.md status to "Complete"
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

**Key sections to update:**
- "Current Focus" - What you're working on RIGHT NOW
- "Files Modified" - What's complete, what's in progress
- "What's Working" - Completed functionality
- "What Needs Work" - Remaining items
- "For Next Session" - Specific next steps with file paths and line numbers
- "Decisions Log" - New decisions made

#### E. Handle Test Credentials (When Applicable)

When implementing features that require test credentials:

**1. Check/Update .env.example:**
- Read current `.env.example` file
- Add any new environment variables needed for this feature
- Use placeholder format: `TEST_USER_PASSWORD=GENERATE_RANDOM_14PLUS_CHARS_HERE`
- Document generation command in comments
- Write updated `.env.example` (this file is committed to git)

**2. Generate Random Test Credentials:**
When test credentials are needed, generate them using:
```bash
# Generate 14+ character random password
openssl rand -base64 16 | tr -d '=' | head -c 14 && echo '!@#'
```

**CRITICAL Rules:**
- NEVER use predictable patterns (Test@Admin2024!, User123!, etc.)
- ALWAYS generate random passwords (14+ chars, alphanumeric + special)
- Each test user gets a unique randomly generated password
- Store actual passwords in `.env.test` (gitignored)
- Reference `.env.test` in spec.md (don't write actual passwords in spec.md)

**3. Create Test Fixtures Using Environment Variables:**
```java
// Spring Boot example
@Value("${TEST_ADMIN_PASSWORD}")
private String testAdminPassword;

// Python example
import os
TEST_ADMIN_PASSWORD = os.getenv("TEST_ADMIN_PASSWORD")

// Node.js example
const testAdminPassword = process.env.TEST_ADMIN_PASSWORD;
```

**NEVER hardcode credentials:**
❌ BAD: `String password = "Test@Admin2024!";`
✅ GOOD: `String password = System.getenv("TEST_ADMIN_PASSWORD");`

**4. Update context.md:**
Document where test credentials are stored:
```markdown
## Test Credentials Context

**Created Test Users:**
- Admin: admin@test.example.com / See TEST_ADMIN_PASSWORD in .env.test
- User: user@test.example.com / See TEST_USER_PASSWORD in .env.test

**Credentials Location:**
- Actual passwords: `.env.test` (gitignored, randomly generated)
- Template: `.env.example` (committed, with placeholders)
- Test fixtures: [path to fixtures file]

**For next session:**
Test credentials are in .env.test (ensure it's configured locally)
```

**5. Security Verification:**
Before continuing, verify:
- [ ] `.env.test` is in `.gitignore` (never commit)
- [ ] `.env.example` has placeholders only (no real passwords)
- [ ] No credentials hardcoded in test files
- [ ] All test passwords are 14+ chars, randomly generated
- [ ] spec.md references `.env.test` (doesn't contain actual passwords)

**Show user what was created:**
```
✅ Test Credentials Created

Generated random test credentials (14+ chars):
- TEST_ADMIN_PASSWORD → stored in .env.test
- TEST_USER_PASSWORD → stored in .env.test

Updated files:
- .env.example (template with placeholders)
- [test fixtures file] (uses environment variables)
- context.md (documented credential locations)

⚠️  Reminder: .env.test contains actual credentials and is gitignored
```

#### F. Rebuild Docker After Code Changes (MANDATORY)

⚠️ **CRITICAL**: After making any code changes, you MUST rebuild Docker containers BEFORE running tests or validation.

**The Problem:**
Making changes → Testing immediately (without rebuild) → Seeing no changes → Debugging old code → **Wasting significant time**

**The Solution:**
Making changes → Rebuild Docker → Test sees new code → Accurate results

**Intelligent Fix Batching Strategy:**

When multiple fixes are needed, GROUP them intelligently to avoid wasted rebuild cycles:

❌ **Inefficient approach (wasted time):**
```
Fix validation bug 1 → Rebuild → Test
Fix validation bug 2 → Rebuild → Test
Fix validation bug 3 → Rebuild → Test
Result: 3 rebuilds, 3 test cycles, wasted time
```

✅ **Efficient approach (time saved):**
```
Identify all 3 validation bugs → Fix all 3 together → Rebuild ONCE → Test ONCE
Result: 1 rebuild, 1 test cycle, time saved
```

**How to identify and group related fixes:**
1. **Related functionality** - All auth bugs together, all validation bugs together
2. **Same file/module** - All UserService fixes together, all AuthController fixes together
3. **Same test suite** - All fixes tested by unit tests together, all integration test fixes together
4. **Same layer** - All controller fixes together, all service fixes together, all repository fixes together

**When to rebuild separately:**
- Unrelated fixes in completely different modules (want isolated verification)
- Critical fix needing immediate validation
- After grouping 3-5 related fixes (don't accumulate too many before testing)

**Rebuild Workflow:**

**Step 1: After completing grouped code changes**
```bash
# Option 1: Full rebuild (safest, recommended)
docker compose up --build -d

# Option 2: Rebuild specific service only (faster)
docker compose build [service-name]
docker compose up -d [service-name]

# Option 3: Clean rebuild (if issues persist)
docker compose down && docker compose up --build -d
```

**Step 2: Verify rebuild succeeded**
```bash
# Check logs to confirm rebuild
docker compose logs -f [service-name]

# Look for: Application started, server running, etc.
```

**Step 3: THEN run tests**
```bash
# Now tests see the new code
docker compose exec [service-name] [test-cmd]
```

**When hot reload works (may skip rebuild):**
- **Spring Boot DevTools** (Java): Hot reload for code IF DevTools enabled + volumes mounted
- **nodemon** (Node.js): Hot reload for JS/TS IF configured + volumes mounted
- **Python --reload**: Hot reload IF using reload flag + volumes mounted

**When you MUST rebuild (hot reload won't work):**
- ✅ Dependency changes (pom.xml, package.json, requirements.txt, go.mod)
- ✅ Configuration file changes (application.properties, config files)
- ✅ Dockerfile or docker-compose.yml changes
- ✅ Compiled code in production mode
- ✅ **When in doubt - ALWAYS rebuild**

**Report rebuild in progress updates:**

Show user what was done:
```
✅ Grouped Fixes Complete: User validation

Fixes applied:
- Fix 1: Email validation null check
- Fix 2: Password length validation
- Fix 3: Username format validation

Rebuilt Docker: docker compose build backend ✅
Verified rebuild: Checked logs, application started ✅
Tests run: All 3 validation tests passing ✅

Time saved: 1 rebuild instead of 3 (batched fixes intelligently)

Next: Move to authorization fixes
```

**Example: Efficient batching workflow**
```
Test run reveals 5 bugs:
- 3 bugs in UserService (validation issues)
- 2 bugs in AuthController (token handling)

Group 1: UserService fixes
1. Identify all 3 UserService bugs
2. Fix all 3 together in UserService.java
3. Rebuild: docker compose build backend
4. Test: docker compose exec backend ./mvnw test -Dtest=UserServiceTest
5. Result: All 3 fixed ✅

Group 2: AuthController fixes
1. Identify both AuthController bugs
2. Fix both together in AuthController.java
3. Rebuild: docker compose build backend
4. Test: docker compose exec backend ./mvnw test -Dtest=AuthControllerTest
5. Result: Both fixed ✅

Total: 2 rebuilds instead of 5 (time saved: ~60%)
```

**DO NOT proceed to testing until Docker is rebuilt after code changes.**

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

⚠️ **CRITICAL**: Before marking work as complete, verify that progress.md is accurate and up-to-date.

**Progress Validation Checklist:**

Read progress.md and verify:
- [ ] All completed tasks are marked with [x] checkboxes
- [ ] Completed phases are in the "Completed" section with timestamps
- [ ] "Current Phase" field reflects the actual current phase
- [ ] "Status" field is accurate (In Progress / Complete)
- [ ] "Last Updated" timestamp is current (today's date or recent)
- [ ] "Decisions Made" section contains important decisions from implementation
- [ ] "Issues Encountered" section documents any problems faced

**If ANY item is not checked:**
1. Read the current progress.md file
2. Update the missing or incorrect information
3. Write the updated progress.md file
4. Verify all checklist items are now satisfied

**Show user the validation result:**
```
✅ Progress Tracking Validated

Verified:
- All [X] completed tasks properly marked
- Timestamps current (last updated: YYYY-MM-DD)
- Current phase accurate: Phase [N]
- Decisions and issues documented

Progress tracking is accurate and complete.
```

**DO NOT proceed to marking work complete until this validation passes.**

### 10.5. Validate Security - OWASP Top 10 (MANDATORY)

⚠️ **CRITICAL**: Before marking work as complete, verify that OWASP Top 10 security mitigations are implemented.

**Security Validation Checklist (OWASP Top 10):**

Review the implemented code and verify:

- [ ] **A01: Access Control** - All endpoints have proper authorization checks
- [ ] **A02: Cryptography** - Sensitive data is encrypted/hashed (passwords use bcrypt/Argon2)
- [ ] **A03: Injection Prevention** - ALL user inputs are validated and sanitized
  - [ ] SQL queries use parameterized statements (NO string concatenation)
  - [ ] User input in HTML is escaped to prevent XSS
  - [ ] No shell commands executed with user input
- [ ] **A04: Secure Design** - Rate limiting implemented where needed
- [ ] **A05: Configuration** - No debug mode enabled in production configs
- [ ] **A06: Dependencies** - No known vulnerable dependencies added
- [ ] **A07: Authentication** - Session management is secure, no session IDs in URLs
- [ ] **A08: Integrity** - Dependencies verified, no untrusted sources
- [ ] **A09: Security Logging** - Auth/authz events logged (without sensitive data)
- [ ] **A10: SSRF Prevention** - External URLs validated and allowlisted

**Additional Critical Checks:**
- [ ] No secrets/API keys/passwords in code (use environment variables)
- [ ] Error messages don't expose sensitive information or stack traces
- [ ] HTTPS/TLS used for all sensitive data transmission
- [ ] Input validation on both client AND server side

**If ANY security item is not checked:**
1. Review the spec.md Security Requirements section
2. Review CLAUDE.md Security - OWASP Top 10 section
3. Implement missing security controls
4. Re-test the security measures
5. Verify all checklist items are now satisfied

**Show user the validation result:**
```
✅ Security Validated (OWASP Top 10)

Verified security controls:
- Input validation and sanitization implemented
- SQL injection prevention (parameterized queries)
- Authorization checks on all endpoints
- Sensitive data encrypted/hashed
- No secrets in code
- Security logging implemented
- Error messages sanitized

Security review complete. Code follows OWASP Top 10 best practices.
```

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

The context file mentions working on [X], but I notice [Y has changed].

Options:
1. Update context and proceed with current state (recommended)
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

If progress.md shows blocked tasks:
```
⚠️ Blocked Tasks Found:

Blocked:
- [Task description] - [Reason for blockage]

These need to be unblocked before proceeding. Would you like to:
1. Work on unblocking them now
2. Work on other unblocked tasks
3. Get your input on how to proceed
```

### Case: Task Already Complete

If all tasks are checked off:
```
✅ This task appears to be complete (all items checked off).

Options:
1. /archive - Move to completed
2. Add more tasks and continue
3. Review and test before archiving

What would you like to do?
```

### Case: No Clear Next Step

If context.md doesn't have explicit next steps and progress.md next steps are vague:
```
❓ Next steps are unclear.

Context: [What we know]
Last completed: [Last item]

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
You MUST update progress.md:
- After completing each task
- After completing each phase (STOP and update before continuing)
- Before taking breaks (via `/checkpoint`)
- When making important decisions

### Follow the Plan
- Reference spec.md for requirements
- Follow technical design from spec.md
- Use patterns identified in context.md
- Reuse components mentioned in context.md

### Communicate Progress
- Show what you're working on
- Explain decisions as you make them
- Surface issues immediately
- Update context when things change

### Update Progress After Each Phase (MANDATORY)

After completing each phase, you MUST update progress.md:
```markdown
**Status:** In Progress → In Progress (or Complete if last phase)
**Current Phase:** Phase 1 → Phase 2
**Last Updated:** [New timestamp]

Move completed tasks from task list to "Completed" section:

## Completed

### Phase 1: Setup & Foundation (Completed 2025-11-03)
- [x] Task 1
- [x] Task 2
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
- Write tests as specified in spec.md
- Handle error cases securely (no sensitive data in error messages)
- Update documentation as needed
- Ensure changes don't break existing functionality

## Tips for Effective Implementation

**For the AI:**
- Read context.md first (most important for resumption)
- Verify file existence before referencing
- Be specific about what you're doing
- Update progress in real-time
- Surface issues immediately
- Don't make assumptions - check the spec

**For the User:**
- Run `/checkpoint` before breaks to save state
- Keep context.md updated for better resumption
- Use `/implement` after any break (replaces `/resume`)
- Interrupt anytime to ask questions or give direction

## Success Criteria

- Context files successfully loaded
- Current state correctly identified (fresh vs resuming)
- Next actions are clear and actionable
- Implementation follows spec.md requirements
- Progress.md updated after each phase
- Context.md updated with important changes
- Work continues smoothly from last stopping point
- Quality code produced following project standards
