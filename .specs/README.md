# Specs Directory

This directory contains specifications and context for features in this project. It's designed to solve Claude Code's context persistence problem and enable seamless resumption across sessions.

## Directory Structure

```
.specs/
├── README.md (this file)
├── active/
│   └── active-task/          # Currently active work
│       ├── spec.md            # What to build
│       ├── progress.md        # Status tracker
│       └── context.md         # Resumption lifeline
├── completed/                  # Archived completed tasks
│   └── [feature-name]/
│       ├── spec.md
│       ├── progress.md
│       ├── context.md
│       └── SUMMARY.md         # Completion summary
└── template/                 # Templates for new specs
    ├── spec.md.template
    ├── progress.md.template
    └── context.md.template
```

## The Three Files System

Each task has three essential files:

### 1. spec.md - The "What and Why"

**Purpose:** Define what you're building and why

**Contains:**
- Feature overview and user problem
- Functional and non-functional requirements
- Technical design and architecture
- Success criteria
- Testing strategy

**When to update:**
- Created during planning (via `/plan`)
- Rarely updated after work begins
- Requirements should be stable

**Read by:** Planning phase, reference during implementation

### 2. progress.md - The "Status Tracker"

**Purpose:** Track what's done and what's next

**Contains:**
- Task breakdown by phase
- Completed items
- In-progress items (with %)
- Blocked items
- Next steps
- Decisions made
- Issues encountered

**When to update:**
- After completing each task
- During `/checkpoint`
- Multiple times per session
- Whenever status changes

**Read by:** `/resume` to show current status, frequent reference

### 3. context.md - The "Resumption Lifeline"

**Purpose:** Enable perfect resumption after any break

**Contains:**
- Current focus (what you're working on RIGHT NOW)
- Files being modified
- Git status
- What's working vs what needs work
- Explicit instructions for next session
- Technical context and patterns
- Tricky areas to watch out for

**When to update:**
- During `/checkpoint` (critical!)
- Throughout session as context evolves
- Before any break
- When making important decisions

**Read by:** `/resume` to restore full context

## Workflow

### Starting a New Feature

```bash
> /plan user-authentication

[Claude creates spec.md, progress.md, context.md in active-task/]
[Begin implementation]
```

### During Work

```bash
# Update progress frequently
> /checkpoint

# This updates progress.md and context.md
```

### Resuming Work

```bash
> /resume

[Claude reads all three files and summarizes current state]
[Continue from exactly where you left off]
```

### Finishing a Feature

```bash
> /archive

[Moves active-task/ to completed/[feature-name]/]
[Creates SUMMARY.md]
[Cleans active workspace for next task]
```

## Why This System Works

### Solves Context Loss

Claude Code doesn't remember context between sessions. These files provide **external memory** that persists across:
- Different days/weeks/months
- Different machines
- Different developers
- Long breaks or interruptions

### Enables Team Collaboration

All context lives in markdown files committed to git:
- Share specs with team
- Hand off work seamlessly
- Review plans before implementation
- Track decisions and progress

### Promotes Better Planning

Creating spec.md forces you to think through:
- Requirements before coding
- Technical approach
- Edge cases and risks
- Success criteria

### Reduces Cognitive Load

You don't have to remember:
- What you were doing
- What decisions were made
- What files are involved
- What to do next

All of it is documented in context.md.

## Templates

The `template/` directory contains starting templates. The `/plan` command uses these automatically, but you can also copy them manually:

```bash
# Manual creation (if not using commands)
cp .specs/template/spec.md.template .specs/active-task/spec.md
cp .specs/template/progress.md.template .specs/active-task/progress.md
cp .specs/template/context.md.template .specs/active-task/context.md

# Then fill in the placeholders
```

## Tips for Effective Specs

### For spec.md:
- Be specific with requirements
- Include examples and edge cases
- Reference existing patterns to follow
- Don't over-specify implementation details
- Focus on "what" not "how"

### For progress.md:
- Break down into small, actionable tasks
- Update frequently (after each subtask)
- Use percentages for partial progress
- Document decisions as you make them
- Note issues and solutions

### For context.md:
- Be VERY specific about current state
- Include file paths and line numbers
- Explain "why" not just "what"
- Note any tricky or confusing areas
- Write explicit instructions for next session
- Imagine explaining to yourself after a week

## Common Patterns

### Working on Multiple Features

Keep only ONE task in `active-task/` at a time. To switch:

```bash
# Save current work
> /checkpoint

# Archive if done, or just clear context
> /clear

# Start or resume other work
> /plan new-feature
# or
> /resume
```

For true parallel work, use git worktrees with separate Claude sessions.

### Long-Running Features

For features spanning multiple sessions:

1. **End of each session:**
   ```bash
   > /checkpoint
   git add . && git commit -m "WIP: feature - what's done"
   ```

2. **Start of each session:**
   ```bash
   > /resume
   [Pick up exactly where you left off]
   ```

3. **Checkpoint frequently:**
   - Every 30-60 minutes
   - After completing subtasks
   - Before meetings/breaks

### Handling Blockers

If stuck or blocked:

1. Document in progress.md:
   ```markdown
   ## Blocked
   - [ ] Task X - Blocked because Y, need Z to proceed
   ```

2. Update context.md:
   ```markdown
   ## What Needs Work
   - Can't proceed with X because of blocker Y
   - Tried approach A (didn't work because B)
   - Possible solutions: try C or D
   ```

3. Checkpoint and switch to other work
4. Resume when blocker is resolved

## Archive Organization

Completed features go in `completed/[feature-name]/`:

```
completed/
├── 20251101-user-authentication/
│   ├── spec.md           # Original spec
│   ├── progress.md       # Final progress
│   ├── context.md        # Implementation context
│   └── SUMMARY.md        # What was accomplished
├── 20251105-payment-integration/
│   └── ...
└── 20251110-dashboard-redesign/
    └── ...
```

### Benefits of Archiving:
- Historical record of features built
- Reference for similar future features
- Knowledge base for team
- Track project evolution
- Learning from past decisions

## Integration with CLAUDE.md

The root `CLAUDE.md` references this spec system:

```markdown
## Workflow

### Starting New Feature
1. Run `/plan [feature-name]`
2. Review `.specs/active-task/spec.md`
3. Begin implementation

### Resuming Work
1. Run `/resume`
2. Continue from `.specs/active-task/context.md`
```

This ensures Claude knows to use the spec system automatically.

## Git Best Practices

**Do commit:**
- All spec files (spec.md, progress.md, context.md)
- SUMMARY.md from archives
- The .specs/ directory structure

**Don't ignore:**
- Never add `.specs/` to .gitignore
- These files ARE your project's memory

**Commit frequency:**
- After `/plan` - Commit initial spec
- After `/checkpoint` - Optional, commit WIP
- After `/archive` - Definitely commit archive

## FAQ

**Q: Can I have multiple active tasks?**
A: The system is designed for one active task. For multiple, use git worktrees or manually manage separate directories. Simpler to focus on one at a time.

**Q: What if my spec changes during implementation?**
A: Update spec.md to reflect reality. Note changes in progress.md under "Decisions Made". The spec should match what's actually built.

**Q: Can I delete archived tasks?**
A: Yes, but they're valuable reference. Consider keeping them. They're small markdown files and git tracks them efficiently.

**Q: Do I need all three files?**
A: For full benefits, yes. But minimum viable:
- Small task: Just progress.md
- Medium task: progress.md + context.md
- Complex task: All three

**Q: Can I customize the templates?**
A: Absolutely! Edit `template/*.template` to fit your needs. The `/plan` command will use your customized templates.

**Q: How do I search old specs?**
A: Use grep or IDE search across `.specs/completed-tasks/`:
```bash
grep -r "authentication" .specs/completed-tasks/
```

**Q: What about non-feature work (bugs, refactoring)?**
A: Same system works. Use `/plan bug-fix-auth` or `/plan refactor-api`. The structure works for any work item.

## Examples

See `docs/EXAMPLES.md` for real-world usage examples showing how to use this system for various scenarios.

## Support

- Setup help: See `docs/SETUP.md`
- Daily workflow: See `docs/WORKFLOW.md`
- Customization: See `docs/CUSTOMIZATION.md`

---

This spec system is your project's persistent memory. Use it well, and Claude Code will work seamlessly across all your sessions.
