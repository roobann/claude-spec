# Setup Guide

Complete installation instructions for Claude-Native Spec template.

## Prerequisites

- Claude Code CLI installed
- Git (recommended)
- A project to work on (new or existing)

## Installation

### For New Projects

```bash
# 1. Create your project directory
mkdir my-new-project
cd my-new-project

# 2. Initialize git (recommended)
git init

# 3. Clone the template
git clone <repo-url> claude-spec
cd claude-spec

# 4. Run setup script
./setup.sh

# This will:
# - Create .claude/commands/ directory
# - Copy all command files
# - Show you what was installed

# 5. Start Claude Code
claude

# 6. Initialize with your tech stack
> /cspec:init language=TypeScript framework="Next.js 14" database=PostgreSQL

# Examples for different stacks:
> /cspec:init language=Python framework=FastAPI database=MongoDB
> /cspec:init language=Go framework=Gin database=PostgreSQL
> /cspec:init language=Rust framework=Axum

# 7. Review generated files
# - CLAUDE.md (customize if needed)
# - .claudeignore (adjust patterns if needed)

# 8. Start your first feature
> /cspec:plan your-first-feature
```

### For Existing Projects

```bash
# 1. Navigate to your project
cd /path/to/your/existing/project

# 2. Clone the template
git clone <repo-url> claude-spec
cd claude-spec

# 3. Run setup script
./setup.sh

# This will:
# - Create .claude/commands/ directory if needed
# - Copy all command files
# - Skip files that already exist (safe to re-run)

# 4. Start Claude Code
claude

# 5. Auto-detect and configure
> /cspec:init

# This will:
# - Scan your existing project
# - Detect tech stack and structure
# - Generate custom CLAUDE.md
# - Create .claudeignore with appropriate patterns
# - Set up .specs/ structure

# 6. Review and customize
# - Check CLAUDE.md for accuracy
# - Adjust .claudeignore if needed
# - Add project-specific rules to CLAUDE.md

# 7. Commit the setup
git add .claude .specs CLAUDE.md .claudeignore
git commit -m "Add Claude-Native Spec system"

# 8. Start using it
> /cspec:plan next-feature
```

## What Gets Installed

### Directory Structure

```
your-project/
├── setup.sh                     # Setup script (run once)
├── CLAUDE.md                    # Auto-generated project context
├── .claudeignore                # Auto-generated ignore patterns
├── .claude/
│   └── commands/
│       ├── cspec:init.md       # Setup new project with tech stack
│       ├── cspec:init.md  # Auto-detect existing project
│       ├── cspec:plan.md           # Feature planning
│       ├── cspec:resume.md                 # Resume work
│       ├── cspec:checkpoint.md             # Save progress
│       └── cspec:archive.md           # Archive completed work
└── .specs/
    ├── README.md                # Spec system documentation
    ├── active/                  # Current work
    ├── completed/               # Archived work
    └── template/              # Spec templates
```

### Commands Available

After running `./setup.sh`, you'll have these slash commands:

- `/cspec:init` - Setup new project with specified tech stack
- `/cspec:init` - Auto-detect and configure existing project
- `/cspec:plan` - Start new feature with spec
- `/resume` - Resume current work
- `/cspec:checkpoint` - Save progress
- `/cspec:archive` - Archive completed work

## Initial Configuration

### Step 1: Choose Your Initialization Command

**Option A: For Existing Projects (Auto-detect)**

```bash
claude
> /cspec:init

🔍 Scanning project...

Detected:
  Language: TypeScript
  Framework: Next.js 14
  Styling: Tailwind CSS
  Database: PostgreSQL (Prisma)
  Package Manager: pnpm

✅ Created CLAUDE.md
✅ Created .claudeignore
✅ Initialized .specs/

Ready to use!
```

**Option B: For New Projects (Specify stack)**

```bash
claude
> /cspec:init language=TypeScript framework="Next.js 14" database=PostgreSQL

✅ Initialized Claude-Native Spec system for NEW project

Tech Stack:
  Language: TypeScript
  Framework: Next.js 14
  Database: PostgreSQL
  Package Manager: npm (inferred)

✅ Created CLAUDE.md
✅ Created .claudeignore
✅ Initialized .specs/

Ready to use!
```

### Step 2: Review CLAUDE.md

The generated `CLAUDE.md` contains:

```markdown
# Your Project

## Tech Stack
[Auto-detected]

## Project Structure
[Auto-discovered]

## Critical Rules
[Generic + your customizations]

## Workflow
[Spec-driven workflow instructions]
```

**Customize sections:**
- Add project-specific rules
- Document any gotchas
- Add coding conventions
- Note critical constraints

### Step 3: Review .claudeignore

The generated `.claudeignore` includes:

- Language-specific patterns (node_modules, __pycache__, etc.)
- Build directories (dist/, build/, etc.)
- Environment files (.env)
- IDE folders (.vscode/, .idea/)

**Adjust if needed:**
- Add project-specific paths
- Uncomment lock files if you don't want Claude to see them
- Add any large generated files

### Step 4: Commit to Git

```bash
git add .claude/ .specs/ docs/ CLAUDE.md .claudeignore
git commit -m "Add Claude-Native Spec system

- Auto-configured for [your stack]
- Added spec-driven workflow commands
- Set up context persistence system"

git push
```

## Verification

Test that everything works:

```bash
# 1. Check commands are available
claude
> /cspec:plan test-feature

# Should work and start creating a spec

# 2. Interrupt and test resume
# Exit Claude (Ctrl+C)
# Restart
claude
> /cspec:resume

# Should load the test feature context

# 3. Test checkpoint
> /cspec:checkpoint

# Should update progress and context files

# 4. Clean up test
> /cspec:archive

# Or manually delete .specs/active-task/
```

## Troubleshooting

### Commands Not Found

**Problem:** `/cspec:init`, `/cspec:init`, or other commands don't work

**Solution:**
1. Make sure you ran `./setup.sh` first
2. Check `.claude/commands/` directory exists
3. Verify files have `.md` extension
4. Restart Claude Code
5. Check file permissions (should be readable)

### CLAUDE.md Not Auto-Loading

**Problem:** Claude doesn't seem to read CLAUDE.md

**Solution:**
1. Verify file is named `CLAUDE.md` (all caps)
2. Place in project root directory
3. Restart Claude Code
4. Check file isn't in .claudeignore

### Auto-Detection Failed

**Problem:** `/cspec:init` didn't detect tech stack

**Solution:**
1. Run detection manually:
   - Check for `package.json`, `requirements.txt`, etc.
   - Verify project files exist
2. Fallback: Use `/cspec:init` with explicit parameters:
   ```bash
   > /cspec:init language=TypeScript framework="Next.js 14" database=PostgreSQL
   ```
3. Or copy `CLAUDE.md.template` manually and edit by hand

### .specs/ Directory Not Created

**Problem:** Spec directories missing

**Solution:**
```bash
# Create manually
mkdir -p .specs/{active,completed,template}

# Copy templates
cp /path/to/template/.specs/template/* .specs/template/

# Create .gitkeep files
touch .specs/active/.gitkeep .specs/completed-tasks/.gitkeep
```

### Git Conflicts

**Problem:** Files conflict with existing setup

**Solution:**
1. Back up existing files:
   ```bash
   cp CLAUDE.md CLAUDE.md.backup
   ```
2. Run `/init` with overwrite option
3. Merge manually if needed
4. Or append detection results to existing CLAUDE.md

## Configuration Options

### Minimal Setup

If you want absolute minimum:

```bash
# 1. Run setup script
./setup.sh

# 2. Manually create minimal CLAUDE.md
cat > CLAUDE.md << 'EOF'
# My Project

## Workflow
When starting work: /resume
When planning feature: /cspec:plan [name]
Before breaks: /cspec:checkpoint
EOF

# 3. Skip full initialization if you want bare minimum
```

### Team Setup

For team collaboration:

```bash
# 1. One person installs
./setup.sh

# 2. Initialize project
claude
> /cspec:init  # or /cspec:init with stack

# 3. Customize CLAUDE.md with team conventions

# 4. Commit to repo
git add .claude/ .specs/ CLAUDE.md .claudeignore
git commit -m "Add Claude-Native Spec system"
git push

# 5. Team members just pull
git pull

# 6. Everyone uses same workflow (no need to re-run setup.sh)
```

### Monorepo Setup

For monorepos, install at root:

```bash
# 1. Install at monorepo root
cd /monorepo-root
./setup.sh

# 2. Run detection
claude
> /cspec:init

# 3. Consider splitting CLAUDE.md:
# - Root CLAUDE.md: Global rules
# - apps/app1/CLAUDE.md: App-specific rules
# - packages/pkg1/CLAUDE.md: Package-specific rules
```

## Next Steps

After setup is complete:

1. ✅ **Read [WORKFLOW.md](WORKFLOW.md)** - Learn daily usage patterns
2. ✅ **Try [TESTING.md](TESTING.md)** - Test with a sample project
3. ✅ **See [EXAMPLES.md](EXAMPLES.md)** - Real-world scenarios
4. ✅ **Review [CUSTOMIZATION.md](CUSTOMIZATION.md)** - Adapt to your needs

## Support

**Issues:**
- Check troubleshooting section above
- Review generated files for accuracy
- Verify Claude Code is up to date

**Customization:**
- See [CUSTOMIZATION.md](CUSTOMIZATION.md)
- Edit templates in `.specs/template/`
- Modify commands in `.claude/commands/`

**Questions:**
- Read `.specs/README.md` for spec system details
- Check [WORKFLOW.md](WORKFLOW.md) for usage
- See [EXAMPLES.md](EXAMPLES.md) for patterns

---

Setup complete! You're ready to build with Claude Code + Spec-Driven Development.

Run `/cspec:plan your-first-feature` to get started.
