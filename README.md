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

# 4. Archive when complete
> /cspec:archive

# 5. Add new features as project evolves
> /cspec:architect real-time-notifications  # Adds to existing architecture!
> /cspec:task real-time-notifications
```

That's it! You're ready to go.

## What You Get

### Core Features

- **Auto-Detection**: `/cspec:configure` configures everything for your stack
- **Plan Mode Integration**: Uses Claude's built-in plan mode for safety
- **Context Persistence**: Resume work after any break (days, weeks, months)
- **Team-Friendly**: Everything in git, easy to share and collaborate
- **Universal**: Works with any language, framework, or project size
- **Non-Invasive**: Adds structure without changing your existing code

### File Structure

```
your-project/
├── CLAUDE.md                    # Auto-generated project context
├── .claudeignore                # Auto-generated ignore patterns
├── .claude/
│   └── commands/
│       ├── cspec:create.md         # Create new project
│       ├── cspec:configure.md      # Configure existing project
│       ├── cspec:architect.md     # Design PROJECT architecture (once)
│       ├── cspec:task.md          # Create feature task from roadmap
│       ├── cspec:implement.md     # Implement current feature
│       └── cspec:archive.md       # Archive completed feature
└── .specs/
    ├── architecture.md            # PROJECT architecture & ADRs
    ├── roadmap.yml               # Feature roadmap with priorities
    ├── guidelines.md             # Development standards
    ├── active-task/              # Current feature being worked on
    │   ├── architecture.md       # Feature design
    │   ├── spec.yml              # Requirements
    │   ├── progress.yml          # Task tracking
    │   └── context.md            # Resumption context
    ├── completed-tasks/          # Archived features
    └── template/                 # Templates
        ├── architecture.md.template
        ├── spec.yml.template
        ├── roadmap.yml.template
        ├── guidelines.md.template
        ├── progress.yml.template
        └── context.md.template
```

### Six Essential Commands

1. **`/cspec:create`** - Create new project with interactive configuration
2. **`/cspec:configure`** - Configure existing project with auto-detection
3. **`/cspec:architect`** - Design project architecture OR add new features to existing architecture
4. **`/cspec:task [feature-name]`** - Create active task for a feature from the roadmap
5. **`/cspec:implement`** - Implement the current active task
6. **`/cspec:archive`** - Archive completed feature and prepare for next

## Supported Tech Stacks

The auto-detection works with:

- **JavaScript/TypeScript**: React, Next.js, Vue, Svelte, Angular, Express, Nest.js, and more
- **Python**: Django, FastAPI, Flask, vanilla Python
- **Go**: Standard library, Gin, Echo, etc.
- **Rust**: Cargo-based projects
- **Java**: Maven and Gradle projects
- **Generic**: Falls back to minimal template for any other stack

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

- **[SETUP.md](docs/SETUP.md)** - Detailed installation for new/existing projects
- **[WORKFLOW.md](docs/WORKFLOW.md)** - Daily usage patterns and examples
- **[CUSTOMIZATION.md](docs/CUSTOMIZATION.md)** - Adapt to your specific needs
- **[EXAMPLES.md](docs/EXAMPLES.md)** - Real-world scenarios (API, UI, full-stack)
- **[TESTING.md](docs/TESTING.md)** - Test the system with a sample project

## Real-World Usage

### Scenario: Building a SaaS Application

**Initial Setup (Once):**
```bash
> /cspec:architect
[Claude asks about the entire project: goals, scale, users, tech stack]
[Creates project architecture with 12 features in roadmap]
[You review architecture.md and roadmap.yml]

Created:
- .specs/architecture.md (master architecture, ADRs)
- .specs/roadmap.yml (12 features across 4 phases)
- .specs/guidelines.md (development standards)
```

**Feature 1: User Authentication**
```bash
> /cspec:task user-authentication
[Claude reads project architecture, creates feature architecture aligned with it]
[Creates .specs/active-task/ with all files]

> /cspec:implement
[Implementation begins following project architecture]
[2 hours of work]

> git commit -m "WIP: user auth - signup complete"
```

**Day 2:**
```bash
> /cspec:implement
Claude: "Building user authentication. Signup done, login 50% complete.
         Following ADR-003 for JWT implementation.
         Next: finish login form validation. Continuing..."
[Continues exactly where you left off]
```

**Feature Complete:**
```bash
> /cspec:archive
[Archives user-authentication to .specs/completed-tasks/]
[Updates roadmap: user-authentication → completed]

> /cspec:task payment-integration
[Next feature from roadmap, already knows it depends on user-auth]
```

**Week Later:**
```bash
> /cspec:implement
[Perfect resumption despite week-long gap]
```

**Adding New Features (Months Later):**
```bash
# New requirement comes up that wasn't in original roadmap
> /cspec:architect real-time-notifications

[Claude detects existing architecture]
"✓ Project architecture exists. What would you like to do?"
"1. Add a new feature to the roadmap" ← Select this

[Claude asks targeted questions about the new feature]
[Analyzes how it fits with existing architecture]
[Creates ADR-015 for WebSocket approach]
[Adds F13 to roadmap.yml]
[Updates guidelines.md with WebSocket patterns]

✅ Feature added to architecture!

> /cspec:task real-time-notifications
[Creates active-task following all existing ADRs]

> /cspec:implement
[Builds feature using established patterns + new WebSocket pattern]
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
- Questions: See documentation in `docs/` folder
- Customization: See [CUSTOMIZATION.md](docs/CUSTOMIZATION.md)

## Next Steps

1. Run `./setup.sh` to install commands
2. Run `/cspec:configure` (existing) or `/cspec:create` (new) in Claude Code
3. Review generated `CLAUDE.md`
4. Run `/cspec:architect` to design your project architecture and roadmap
5. Run `/cspec:task [feature-name]` to start working on a feature
6. Read [WORKFLOW.md](docs/WORKFLOW.md) for daily usage patterns

Happy coding with Claude!
