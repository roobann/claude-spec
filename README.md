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
- ✅ Create `.claude/commands/` directory if needed
- 📋 Copy all command files to your project
- ⚠️ Skip files that already exist (safe to re-run)

### 2. Initialize Your Project

**For existing projects (auto-detect):**
```bash
# Start Claude Code in your project
claude

# Let Claude detect your stack
> /cspec:init
```

**For new projects (specify stack):**
```bash
# Start Claude Code
claude

# Specify your tech stack
> /cspec:init language=TypeScript framework="Next.js 14" database=PostgreSQL

# Or with CI/CD and folder structure
> /cspec:init language=Python framework=FastAPI database=PostgreSQL folder=backend cicd="GitHub Actions"
```

Both commands will:
- 🔍 Generate custom `CLAUDE.md` with your project details
- 📝 Create smart `.claudeignore` based on your language
- ✅ Set up `.specs/` folder structure
- 🚀 Make you ready to start immediately

### 3. Start Building

```bash
# Plan a new feature
> /cspec:plan user-authentication

# Implement or continue work anytime
> /cspec:implement

# Save progress before breaks
> /cspec:checkpoint
```

That's it! You're ready to go.

## What You Get

### Core Features

- **Auto-Detection**: `/cspec:init` configures everything for your stack
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
│       ├── cspec:init.md       # Configure new project with specified stack
│       ├── cspec:init.md  # Auto-detect existing project stack
│       ├── cspec:plan.md           # Plan new features (creates specs only)
│       ├── cspec:implement.md              # Start or continue implementation
│       ├── cspec:checkpoint.md             # Save progress
│       └── cspec:archive.md           # Archive completed tasks
└── .specs/
    ├── active/                  # Current work
    │   └── active-task/
    │       ├── spec.md          # What you're building
    │       ├── progress.md      # Status tracker
    │       └── context.md       # Resumption lifeline
    ├── completed/               # Archived tasks
    └── template/              # Templates for new tasks
```

### Six Essential Commands

1. **`/cspec:init`** - Setup new project with specified tech stack
2. **`/cspec:init`** - Auto-detect and configure existing project
3. **`/cspec:plan [name]`** - Plan new feature (creates specs, stops before implementation)
4. **`/cspec:implement`** - Start or continue implementation of current task
5. **`/cspec:checkpoint`** - Save progress before breaks or context switches
6. **`/cspec:archive`** - Move completed task to archive

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

### Scenario: Building User Authentication

**Day 1:**
```bash
> /cspec:plan user-authentication
[Claude analyzes requirements, creates spec, presents plan]
[You review the plan]
> /cspec:implement
[Implementation begins]
[2 hours of work]
> /cspec:checkpoint
> git commit -m "WIP: user auth - signup complete"
```

**Day 2:**
```bash
> /cspec:implement
Claude: "Building user authentication. Signup done, login 50% complete.
         Next: finish login form validation. Continuing..."
[Continues exactly where you left off]
```

**Week Later:**
```bash
> /cspec:implement
[Perfect resumption despite week-long gap]
```

## For New vs Existing Projects

### New Projects
- Run `./setup.sh` to install commands
- Run `/cspec:init` with your tech stack details
- Start with `/cspec:plan` for first feature
- Example: `/cspec:init language=TypeScript framework="Next.js 14" database=PostgreSQL`

### Existing Projects
- Run `./setup.sh` to install commands
- Run `/cspec:init` to auto-detect your stack
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

1. ✅ Run `./setup.sh` to install commands
2. ✅ Run `/cspec:init` (existing) or `/cspec:init` (new) in Claude Code
3. ✅ Review generated `CLAUDE.md`
4. ✅ Run `/cspec:plan` to start your first feature
5. ✅ Read [WORKFLOW.md](docs/WORKFLOW.md) for daily usage patterns

Happy coding with Claude!
