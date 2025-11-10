# Specs Directory

This directory contains project architecture, specifications, and task tracking for features. It's designed to solve Claude Code's context persistence problem and enable seamless resumption across sessions.

## Directory Structure

```
.specs/
├── README.md                   # This file
├── architecture.md             # Project-wide architecture and ADRs
├── roadmap.yml                 # Feature roadmap with priorities
├── template/                   # Templates for new tasks
│   ├── spec.yml.template
│   ├── progress.yml.template
│   ├── context.md.template
│   ├── tasks-progress.yml.template
│   ├── CLAUDE.md.template
│   └── .claudeignore.template
├── tasks/                      # All tasks (in-progress and completed)
│   ├── progress.yml            # Task index (status tracking)
│   ├── 001-feature-1/          # Sequential numbered task folders
│   │   ├── spec.yml
│   │   ├── progress.yml
│   │   └── context.md
│   └── 002-feature-2/
│       └── ...
```

## The Three Files System

Each task has three essential files:

### 1. spec.yml - The "What and Why"

**Purpose:** Define what you're building and why

**Contains:**
- Feature metadata (name, priority, status)
- Requirements (functional and non-functional)
- Technical design and architecture
- Components, API endpoints, data models
- Testing strategy
- Security considerations (OWASP)

**When to update:**
- Created during task creation (via `/cspec:task`)
- Rarely updated after work begins
- Requirements should be stable

### 2. progress.yml - The "Status Tracker"

**Purpose:** Track implementation progress through phases

**Contains:**
- Current phase and status
- 3-phase task breakdown (Foundation, Core, Polish)
- Task status (pending/in_progress/complete/blocked)
- Decisions made during implementation
- Issues encountered and resolutions
- Time tracking

**When to update:**
- Automatically during `/cspec:implement`
- After completing each task
- Whenever status changes

### 3. context.md - The "Resumption Lifeline"

**Purpose:** Enable perfect resumption after any break

**Contains:**
- Current focus (what you're working on RIGHT NOW)
- Files being modified
- What's working vs what needs work
- Explicit instructions for next session
- Architecture context and patterns
- Technical notes and gotchas

**When to update:**
- Automatically during `/cspec:implement`
- Throughout session as context evolves

## Workflow

### 1. Initialize Project

```bash
# New project
/cspec:create

# Existing project
/cspec:configure
```

### 2. Design Project Architecture

```bash
/cspec:architect

# Creates:
# - .specs/architecture.md (ADRs, system design)
# - .specs/roadmap.yml (feature list with priorities)
```

### 3. Start a New Task

```bash
/cspec:task user-authentication

# Creates:
# - .specs/tasks/001-user-authentication/spec.yml
# - .specs/tasks/001-user-authentication/progress.yml
# - .specs/tasks/001-user-authentication/context.md
# - Updates .specs/tasks/progress.yml index
```

### 4. Implement the Task

```bash
/cspec:implement

# Autonomous mode (default) - runs to completion
# Or: /cspec:implement mode=interactive
```

### 5. Track Progress

All tasks tracked in `.specs/tasks/progress.yml`:

```yaml
tasks:
  - id: "001-user-authentication"
    name: "user-authentication"
    status: "completed"
    priority: "high"
    created: "2025-01-09"
    completed: "2025-01-15"

  - id: "002-export-metrics"
    name: "export-metrics"
    status: "in_progress"
    priority: "medium"
    created: "2025-01-20"
```

## Task Lifecycle

```
┌─────────────────┐
│  /cspec:task    │  Creates date-prefixed folder
│  feature-name   │  Updates index to "in_progress"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /cspec:implement│  Work on task
│                 │  Update progress
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Task complete   │  Update index to "completed"
│                 │  Task folder remains in .specs/tasks/
└─────────────────┘
```

## Why This System Works

### Sequential Numbered Organization
- Creation order tracking: `001-feature-name`, `002-feature-name`, etc.
- Easy to see task creation order
- Natural numeric sorting
- Reuses deleted task numbers (fills gaps)

### Centralized Task Index
- Single source of truth (`.specs/tasks/progress.yml`)
- Quick overview of all tasks
- Status tracking at a glance

### Self-Contained Tasks
- Each task folder has all its files
- Easy to share or reference
- No active/completed separation needed

### Multiple In-Progress Tasks
- Track multiple concurrent tasks
- No "one active task" limitation
- Flexibility for team collaboration

## Project Architecture

### architecture.md
Master architecture document containing:
- ADRs (Architecture Decision Records)
- System design
- Security requirements
- Development standards

### roadmap.yml
Feature roadmap with:
- Phases and priorities
- Dependencies between features
- Estimated timelines

## Tips for Effective Specs

### For spec.yml:
- Reference project architecture ADRs
- Be specific with requirements
- Include OWASP security considerations
- Define clear success criteria

### For progress.yml:
- Break down into 3 phases (Foundation, Core, Polish)
- Update frequently during implementation
- Document decisions as you make them
- Note issues and solutions

### For context.md:
- Be VERY specific about current state
- Include file paths and line numbers
- Explain "why" not just "what"
- Write explicit instructions for next session

## Integration with CLAUDE.md

The root `CLAUDE.md` references this spec system:

```markdown
## Workflow

### Starting New Feature
1. Design architecture: `/cspec:architect`
2. Create task: `/cspec:task [feature-name]`
3. Implement: `/cspec:implement`

### Resuming Work
1. Run `/cspec:implement`
2. Choose task if multiple in-progress
```

## Git Best Practices

**Do commit:**
- All spec files (architecture.md, roadmap.yml, task files)
- The .specs/ directory structure
- .specs/tasks/progress.yml index

**Don't ignore:**
- Never add `.specs/` to .gitignore
- These files ARE your project's memory

**Commit frequency:**
- After `/cspec:architect` - Commit architecture
- After `/cspec:task` - Commit new task
- During work - Commit WIP regularly
- After completion - Commit final state

## FAQ

**Q: Can I have multiple active tasks?**
A: Yes! The new system supports multiple in-progress tasks tracked in `.specs/tasks/progress.yml`.

**Q: What happened to /cspec:archive?**
A: No longer needed. Tasks stay in `.specs/tasks/` with status updated in progress.yml (in_progress → completed).

**Q: How do I find completed tasks?**
A: Check `.specs/tasks/progress.yml` for tasks with `status: completed`.

**Q: How do I search old tasks?**
A: Use grep across `.specs/tasks/`:
```bash
grep -r "authentication" .specs/tasks/
```

**Q: What's the numbering format for task folders?**
A: `NNN-feature-name` with 3-digit sequential numbers (e.g., `001-user-auth`, `002-export-metrics`). Gaps from deleted tasks are reused.

**Q: Can I customize the templates?**
A: Yes! Edit `.specs/template/*.template` to fit your needs.

**Q: What are the subagents in .claude/agents/?**
A: 20 domain expert AI subagents automatically installed during setup. `/cspec:implement` uses them for multi-domain features:
- **Backend:** backend-architect, database-admin, database-optimizer
- **Frontend:** frontend-developer, ui-ux-designer, nextjs-app-router-developer
- **DevOps:** devops-troubleshooter, deployment-engineer, cloud-architect, terraform-specialist
- **Quality:** code-reviewer, security-auditor, test-automator, debugger
- **Languages:** python-expert, golang-expert, rust-expert, java-developer, php-developer

**Q: How do multi-domain features work?**
A: Set `metadata.agent_coordination: true` in spec.yml and assign tasks to domains (backend, frontend, devops, etc.). `/cspec:implement` orchestrates domain experts via subagents to work in parallel with dependency management.

---

This spec system is your project's persistent memory. Use it well, and Claude Code will work seamlessly across all your sessions.
