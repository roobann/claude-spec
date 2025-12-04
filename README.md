# Claude-Native Spec Template

A lightweight, flexible spec-driven development system designed specifically for Claude Code. Perfect for projects of any size, any tech stack, with any team size.

## Quick Start

### 1. Run Setup Script

```bash
# Clone or download the template repository
git clone <repo-url> claude-spec
cd claude-spec

# Run the setup script
./setup.sh
```

The `setup.sh` script will:
- Create `.claude/commands/` directory if needed
- Copy all command files to your project
- Skip files that already exist (safe to re-run)

### 2. Initialize Your Project

**For existing projects (auto-detect):**
```bash
# Start Claude Code in your project
claude

# Auto-detect your tech stack
> /cspec:configure
```

**For new projects (specify stack):**
```bash
# Start Claude Code
claude

# Initialize new project interactively
> /cspec:create
```

Both commands will:
- Generate custom `CLAUDE.md` with your project details
- Create smart `.claudeignore` based on your language
- Set up `.specs/` folder structure
- Make you ready to start immediately

### 3. Start Building

```bash
# 1. Design PROJECT architecture (once)
> /cspec:architect

# 2. Create a feature task from roadmap
> /cspec:task user-authentication

# 3. Implement the feature
> /cspec:implement

# 4. Add new features as project evolves
> /cspec:architect real-time-notifications  # Adds to existing architecture!
> /cspec:task real-time-notifications
```

That's it! You're ready to go.

## What You Get

### Core Features

- **Auto-Detection**: `/cspec:configure` configures everything for your stack
- **Plan Mode Integration**: Uses Claude's built-in plan mode for safety
- **Context Persistence**: Resume work after any break (days, weeks, months)
- **Domain Expert Subagents**: 20 specialized AI subagents for backend, frontend, devops, and more
- **Team-Friendly**: Everything in git, easy to share and collaborate
- **Universal**: Works with any language, framework, or project size
- **Non-Invasive**: Adds structure without changing your existing code

### File Structure (Versioned)

```
your-project/
├── CLAUDE.md                    # Auto-generated project context
├── .claudeignore                # Auto-generated ignore patterns
├── .claude/
│   ├── commands/
│   │   ├── cspec:create.md         # Create new project
│   │   ├── cspec:configure.md      # Configure existing project
│   │   ├── cspec:architect.md      # Design architecture (per version)
│   │   ├── cspec:task.md           # Create feature task
│   │   ├── cspec:implement.md      # Implement current feature
│   │   ├── cspec:status.md         # View task status
│   │   └── cspec:release.md        # Version transitions
│   └── agents/                   # 20 domain expert subagents
│       ├── backend-architect.md
│       ├── frontend-developer.md
│       └── ... (18 more)
└── .specs/
    ├── project.yml               # Version manifest (v1, v2, v3...)
    ├── versions/
    │   ├── v1/                   # Version 1 (archived)
    │   │   ├── architecture.md   # v1 architecture & ADRs
    │   │   ├── roadmap.yml       # v1 feature roadmap
    │   │   ├── guidelines.md     # v1 development standards
    │   │   ├── changelog.md      # What was delivered in v1
    │   │   └── tasks/            # v1 tasks
    │   │       ├── progress.yml
    │   │       └── 001-feature/
    │   └── v2/                   # Version 2 (active)
    │       ├── architecture.md   # v2 architecture (inherits from v1)
    │       ├── roadmap.yml       # v2 feature roadmap
    │       ├── guidelines.md     # v2 development standards
    │       └── tasks/            # v2 tasks
    │           ├── progress.yml
    │           └── 001-feature/
    ├── current -> versions/v2    # Symlink to active version
    └── template/                 # Templates
```

### Seven Essential Commands

1. **`/cspec:create`** - Create new project with interactive configuration
2. **`/cspec:configure`** - Configure existing project with auto-detection
3. **`/cspec:architect`** - Design architecture (per version) OR add features
4. **`/cspec:task [feature-name]`** - Create task for a feature from the roadmap
5. **`/cspec:implement`** - Implement the current task
6. **`/cspec:status`** - View task status for current version
7. **`/cspec:release`** - Manage version transitions (v1 → v2 → v3)

## Supported Tech Stacks

The auto-detection works with:

- **JavaScript/TypeScript**: React, Next.js, Vue, Svelte, Angular, Express, Nest.js, and more
- **Python**: Django, FastAPI, Flask, vanilla Python
- **Go**: Standard library, Gin, Echo, etc.
- **Rust**: Cargo-based projects
- **Java**: Maven and Gradle projects
- **Generic**: Falls back to minimal template for any other stack

## Domain Expert Subagents

Claude-spec includes 20 specialized AI subagents for multi-domain development:

**Backend & Database:**
- backend-architect, database-admin, database-optimizer

**Frontend & UI:**
- frontend-developer, ui-ux-designer, nextjs-app-router-developer

**DevOps & Infrastructure:**
- devops-troubleshooter, deployment-engineer, cloud-architect, terraform-specialist, network-engineer

**Quality & Testing:**
- code-reviewer, security-auditor, test-automator, debugger

**Language Specialists:**
- python-expert, golang-expert, rust-expert, java-developer, php-developer

These subagents are automatically installed during setup and invoked by `/cspec:implement` for multi-domain features. Source: [claude-code-subagents-collection](https://github.com/davepoon/claude-code-subagents-collection)

## Why This Approach?

### Solves Claude Code's Context Problem

Claude Code doesn't persist context between sessions. This template provides **file-based memory** that enables:
- Perfect resumption after breaks
- Team handoffs
- Long-running projects (weeks to months)
- Multiple concurrent features

### Better Than Alternatives

| Aspect | This Template | Spec-Kit | Agent OS |
|--------|---------------|----------|----------|
| Setup Time | 30 seconds | 30+ minutes | 30+ minutes |
| External Dependencies | None | Python CLI | Shell scripts |
| Learning Curve | Minimal | Steep | Moderate |
| Flexibility | High | Low | High |
| Auto-Configuration | Yes | No | No |
| Universal | Yes | No | No |

### Simple Yet Powerful

- **80% of benefits, 20% of complexity**
- No external tools to install
- Works with Claude's native features
- Add complexity only when needed

## Documentation

See `.specs/README.md` and `.claude/commands/README.md` for detailed documentation on the workflow and file structure.

## Versioned Development Workflow

Claude-spec supports **iterative development** with versioned specs. Each version (v1, v2, v3...) has its own architecture, roadmap, and tasks.

### Version Lifecycle

```
v1 (MVP)          →    v2 (Enhanced)     →    v3 (Enterprise)
├── architecture       ├── architecture       ├── architecture
├── roadmap            ├── roadmap            ├── roadmap
├── tasks/             ├── tasks/             ├── tasks/
└── changelog          └── ...                └── ...
```

### Workflow: v1 Development

```bash
# Initialize project (creates v1)
> /cspec:architect @docs/prd-v1.md
[Creates .specs/project.yml with v1 as active]
[Creates .specs/versions/v1/architecture.md, roadmap.yml, guidelines.md]

# Create and implement features
> /cspec:task user-authentication
> /cspec:implement

# Check progress
> /cspec:status
```

### Version Transition: v1 → v2

When v1 requirements are complete and you have new requirements (PRD v2):

```bash
# Archive v1 and start v2
> /cspec:release
[Archives v1, generates changelog, creates v2 structure]

# Design v2 architecture (references v1 ADRs)
> /cspec:architect @docs/prd-v2.md
[Reads v1 architecture as baseline]
[Creates v2 architecture with inherited + new ADRs]
[Creates v2 roadmap with new features]

# Work on v2 features
> /cspec:task payment-integration
> /cspec:implement
```

### Key Points

- **Each version is self-contained**: architecture, roadmap, tasks are per-version
- **Architecture inheritance**: v2 references v1 ADRs, adds new ones
- **Clean transitions**: `/cspec:release` archives current, starts new version
- **Task IDs reset**: Each version starts fresh with 001, 002...
- **History preserved**: Archived versions remain in `.specs/versions/`

## Real-World Usage

### Scenario: Building a SaaS Application

**v1: MVP Development**
```bash
> /cspec:architect @docs/prd-v1.md
[Creates project.yml, versions/v1/ with architecture, roadmap, guidelines]

> /cspec:task user-authentication
> /cspec:implement
# ... complete v1 features ...

> /cspec:status
📦 Version: v1 - MVP Release
Tasks: 4/4 completed ✅
```

**Transition to v2**
```bash
# New PRD arrives with payment features
> /cspec:release
[Archives v1, creates v2 structure]

> /cspec:architect @docs/prd-v2.md
[Creates v2 architecture referencing v1 ADRs]
[Generates v2 roadmap from new PRD]

> /cspec:task payment-integration
> /cspec:implement
```

**Perfect Resumption**
```bash
# After weeks away
> /cspec:implement
Claude: "Resuming v2 - payment-integration.
         Following ADR-003 (from v1) + ADR-012 (v2 payment).
         Next: Stripe webhook handler. Continuing..."
```

## For New vs Existing Projects

### New Projects
- Run `./setup.sh` to install commands
- Run `/cspec:create` to interactively configure your tech stack
- Run `/cspec:architect` to design the entire project architecture
- Run `/cspec:task [feature]` to start your first feature

### Existing Projects
- Run `./setup.sh` to install commands
- Run `/cspec:configure` to auto-detect your stack
- Non-invasive - doesn't change your code
- Gradually adopt for new features

## Team Collaboration

### Solo Developer
- Use as personal workflow system
- Resume work seamlessly across sessions
- Keep track of complex features

### Team
- Share CLAUDE.md for project standards
- Use specs for feature planning and handoffs
- Track progress in git
- Enable pair programming with AI

## License

MIT - Use freely in any project

## Support

- Issues: File an issue in the source repository
- Questions: See `.specs/README.md` for detailed documentation
- Customization: Edit templates in `.specs/template/` to fit your needs

## Next Steps

1. Run `./setup.sh` to install commands
2. Run `/cspec:configure` (existing) or `/cspec:create` (new) in Claude Code
3. Review generated `CLAUDE.md`
4. Run `/cspec:architect` to design your project architecture and roadmap
5. Run `/cspec:task [feature-name]` to start working on a feature
6. Read `.specs/README.md` for detailed workflow documentation

Happy coding with Claude!
