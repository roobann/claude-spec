# Daily Workflow Guide

Practical patterns for using Claude-Native Spec in your daily development.

## Quick Reference

```bash
/architect [name]    # Start new feature
/resume                 # Resume current work
/checkpoint             # Save progress
/archive           # Complete and archive
```

## Complete Workflows

### Workflow 1: Starting a New Feature

**Scenario:** You need to add user authentication

```bash
# Day 1 - Planning
$ claude
> /architect user-authentication

Claude: "Let me ask some clarifying questions..."
[Answer questions about requirements]

Claude: "Here's the specification I created..."
[Review spec.md, progress.md, context.md]

You: "Looks good, start implementation"

[Claude begins Phase 1 tasks]
[Work for 2 hours]

> /checkpoint
Claude: "Progress saved..."

You: git add . && git commit -m "WIP: user auth - signup form complete"
```

**Result:** Spec created, work started, progress checkpointed

### Workflow 2: Resuming After a Break

**Scenario:** Continuing work from yesterday

```bash
# Day 2 - Resume
$ claude
> /resume

Claude: "Resuming: User Authentication

Current Status: In Progress
Phase: Core Implementation
Progress: 5/12 tasks complete

✅ Completed:
- Database schema
- Signup API endpoint
- Signup form UI
- Email validation
- Password hashing

🔄 Currently Working On:
- Login form (60% complete)
- Form validation in progress
- Need to add error messages

📍 Next Steps:
1. Complete login form validation
2. Add loading states
3. Implement session management

Ready to continue from login form validation?"

You: "Yes, continue"

[Claude opens LoginForm.tsx and continues exactly where left off]
[Work for 1 hour]

> /checkpoint
[Progress saved]
```

**Result:** Zero time wasted rediscovering context

### Workflow 3: Context Switching

**Scenario:** Urgent bug interrupts feature work

```bash
# Working on feature
> /checkpoint
Claude: "Progress saved for user-authentication"

> /clear
[Context window cleared]

> /architect bug-fix-payment-error
[Work on bug fix]
[Complete bug fix]

> /archive
Claude: "Bug fix archived"

# Back to original feature
> /resume
Claude: "Resuming user-authentication from [exact point]"
[Continue feature work]
```

**Result:** Clean context switching, nothing lost

### Workflow 4: Long-Running Feature (Multi-Day)

**Scenario:** Complex feature spanning a week

```bash
# Monday
$ claude
> /architect dashboard-redesign
[Create comprehensive spec]
[Work 4 hours - complete Phase 1]
> /checkpoint
$ git commit -m "Dashboard: Phase 1 complete"

# Tuesday
$ claude
> /resume
[Continue Phase 2]
[Work 4 hours]
> /checkpoint
$ git commit -m "Dashboard: Phase 2 in progress"

# Wednesday
[Sick day - no work]

# Thursday
$ claude
> /resume
Claude: "Note: Last updated 2 days ago..."
[Perfect resumption despite 2-day gap]
[Continue Phase 2]
> /checkpoint

# Friday
$ claude
> /resume
[Complete Phase 3]
[All tests passing]
> /archive
$ git commit -m "Dashboard redesign complete"
```

**Result:** Seamless work across a week with interruptions

### Workflow 5: Team Handoff

**Scenario:** Developer A passes work to Developer B

```bash
# Developer A - End of day
> /checkpoint
$ git add . && git commit -m "WIP: API integration - endpoints complete"
$ git push

# Developer B - Next morning
$ git pull
$ claude
> /resume

Claude: "Resuming: API Integration (handed off from Dev A)

Context notes from last session:
- All CRUD endpoints implemented
- Testing needed for error cases
- Known issue with timeout handling (see context)

Ready to continue with testing?"

[Developer B continues seamlessly]
```

**Result:** Zero-friction team collaboration

## Common Patterns

### Pattern: Checkpoint Frequently

**Bad:** Work for 4 hours, checkpoint once at end
**Good:** Checkpoint every 30-60 minutes or after each subtask

```bash
# Every 30-60 minutes
> /checkpoint

# Or after logical milestones
[Complete database setup]
> /checkpoint

[Finish API implementation]
> /checkpoint

[Tests passing]
> /checkpoint
```

**Why:** Granular checkpoints mean better resumption, less lost context

### Pattern: Use Plan Mode for Complex Work

**Scenario:** Major refactoring or architectural change

```bash
# Press Shift+Tab twice to enter plan mode
[Plan mode activated]

You: "I need to refactor the auth system to use JWT"

Claude: [Analyzes codebase, creates plan]
Claude: "Here's my refactoring plan..."

[Review plan carefully]

You: "Looks good, proceed"

[Exit plan mode - Shift+Tab]
[Claude executes with safety]
```

**Why:** Plan mode gives you review step before big changes

### Pattern: Update Context During Work

**Scenario:** Making important decision mid-implementation

```bash
[Working on feature, decide to use approach X over Y]

You: "Update context.md with decision to use Zustand for state
     management instead of Context API because..."

Claude: [Updates context.md]

You: "Continue implementation"

[Later when resuming]
> /resume
Claude: "...using Zustand for state (decided because...)..."
```

**Why:** Decisions are preserved for future you or teammates

### Pattern: Iterative Spec Refinement

**Scenario:** Requirements evolve during implementation

```bash
> /architect user-settings
[Start implementing]
[Discover edge case not in spec]

You: "Update spec.md to add requirement for handling legacy data"

Claude: [Updates spec.md]
Claude: [Updates progress.md with new task]

> /checkpoint
[Spec now matches reality]
```

**Why:** Spec stays synchronized with actual implementation

## Time-Based Workflows

### Morning Routine

```bash
# Start of day
$ cd project
$ git pull
$ claude

# If continuing work
> /resume
[Review summary]
[Confirm and continue]

# If starting fresh
> /architect today's-feature
```

### Lunch Break

```bash
# Before lunch
> /checkpoint
[Leave Claude running or exit]

# After lunch
[If Claude still running, just continue]
[If exited]
$ claude
> /resume
```

### End of Day

```bash
# Wrap up session
> /checkpoint

# Commit work
$ git add .
$ git commit -m "WIP: [feature] - [what's done]"
$ git push

# Exit Claude
[Ctrl+C or exit]
```

### Weekly Review

```bash
# Friday afternoon
[Review all work for week]

$ ls .specs/completed-tasks/
# See what was accomplished

[Plan next week]
[Identify features for next sprint]
```

## Situation-Specific Workflows

### Dealing with Blockers

```bash
[Hit a blocker during work]

You: "I'm blocked on X because Y. Update progress and context."

Claude: [Updates progress.md with blocker]
Claude: [Updates context.md with attempted solutions]

> /checkpoint

# Switch to other work or research blocker
# When unblocked:

> /resume
Claude: "...was blocked on X. Ready to try [solution]?"
```

### Handling Interruptions

```bash
[Working focused]
[Urgent meeting called]

> /checkpoint
[Meeting]

[Return 2 hours later]
$ claude
> /resume
[Right back to where you were]
```

### Managing Technical Debt

```bash
[Notice code that needs refactoring]

You: "Add note to context about technical debt in AuthService"

Claude: [Updates context.md]

[Continue with current feature]
[Later, or in separate task]

> /architect refactor-auth-service
[Address technical debt properly]
```

### Learning New Codebase

```bash
# First time on project
$ claude

# Explore structure
You: "Explain the codebase structure"
[Claude reads CLAUDE.md and explains]

# Start small
> /architect small-bug-fix
[Learn patterns while fixing]

> /checkpoint

# Gradually tackle bigger work
> /architect medium-feature
[Use patterns learned]
```

## Best Practices

### 1. Checkpoint Before Uncertainty

```bash
[About to try experimental approach]
> /checkpoint
[Try approach]
[If fails, context explains what was tried]
```

### 2. Descriptive Commit Messages

```bash
# Good commits reference task
git commit -m "feat: user-auth - implement login form

- Add LoginForm component
- Implement validation
- Add error handling

See .specs/active-task/ for details"
```

### 3. Archive Regularly

```bash
[Feature complete and merged]
> /archive
[Keeps active workspace clean]
```

### 4. Document Decisions

```bash
[Made important technical decision]
You: "Add to context: chose PostgreSQL over MongoDB because..."
[Future you/teammates will thank you]
```

### 5. Use /clear for Fresh Start

```bash
[Context window getting cluttered]
[Unrelated file edits in history]

> /checkpoint
> /clear
> /resume
[Fresh context, but state preserved]
```

## Productivity Tips

**Tip 1: Batch Similar Tasks**
- Do all API endpoints together
- Do all UI components together
- Update tests in batches
- Checkpoint between batches

**Tip 2: Use Claude for Tedious Work**
- Boilerplate generation
- Test writing
- Documentation updates
- Repetitive refactoring

**Tip 3: Leverage Existing Patterns**
- Reference similar components
- Follow established conventions
- Claude reuses patterns automatically
- Consistency improves quality

**Tip 4: Review Before Committing**
- Use plan mode for final review
- Check all tests pass
- Verify against spec requirements
- Update progress to 100%

**Tip 5: Maintain Context Quality**
- Good context = instant resumption
- Bad context = wasted time
- Invest in checkpoint quality
- Pay dividends later

## Troubleshooting Workflows

### Problem: Lost Track of What You Were Doing

```bash
> /resume
[Review summary]
[Should never happen with good checkpoints]

# If context is stale
You: "Analyze current git diff and update context"
Claude: [Reviews changes, updates context]
```

### Problem: Spec Doesn't Match Reality

```bash
You: "Update spec.md to match what we actually built"
Claude: [Updates spec]
> /checkpoint
[Spec and code now aligned]
```

### Problem: Too Many Files Changed

```bash
> /checkpoint
> /clear
[Start fresh with smaller focus]
[Work on one module at a time]
```

### Problem: Can't Remember Past Decision

```bash
# Search archived tasks
$ grep -r "decision about X" .specs/completed-tasks/
[Find reference to past decision]
```

## Next Steps

- **See [EXAMPLES.md](EXAMPLES.md)** for real-world scenarios
- **See [CUSTOMIZATION.md](CUSTOMIZATION.md)** to adapt workflows
- **See [TESTING.md](TESTING.md)** to practice with sample project

---

The key to effective workflow: **Checkpoint early, checkpoint often, and trust the system to preserve your context.**
