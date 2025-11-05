# Slash Commands

This directory contains slash commands for the Claude-Native Spec workflow system.

## Available Commands

### Initialization Commands

**`/cspec:init-new`** - New project setup
- Interactive configuration for brand new projects
- Asks sequential questions: Language → Framework → Structure → Database → CI/CD
- Creates CLAUDE.md, .claudeignore, and .specs/ structure
- Use when starting from scratch with no existing code

**`/cspec:init-existing`** - Existing project setup
- Auto-detects tech stack from existing files
- Scans package.json, go.mod, requirements.txt, etc.
- Shows detected values and asks for confirmation
- Use when adding spec system to existing codebase

### Workflow Commands

**`/cspec:plan`** - Plan new feature
- Creates spec, progress, and context files
- Guides through requirements and design
- Sets up .specs/active-task/ for implementation

**`/cspec:implement`** - Implement planned feature
- Reads spec/progress/context from active-task/
- Executes implementation systematically
- Updates progress as work proceeds

**`/cspec:checkpoint`** - Save progress
- Updates progress.md with current status
- Updates context.md for resumption
- Use before breaks or at natural stopping points

**`/cspec:archive`** - Complete and archive feature
- Moves active-task/ to completed-tasks/
- Creates completion summary
- Prepares for next feature

## Command Relationships

```
Initialization (choose one):
├── /cspec:init-new (new projects)
└── /cspec:init-existing (existing projects)

Workflow:
/cspec:plan → /cspec:implement → /cspec:checkpoint → /cspec:archive
```

## Usage Pattern

1. **Initialize project:**
   ```bash
   # For new projects:
   /cspec:init-new

   # For existing projects:
   /cspec:init-existing
   ```

2. **Plan feature:**
   ```bash
   /cspec:plan user-authentication
   ```

3. **Implement:**
   ```bash
   /cspec:implement
   ```

4. **Save progress:**
   ```bash
   /cspec:checkpoint
   ```

5. **Complete:**
   ```bash
   /cspec:archive
   ```

## Command Design Principles

1. **Separation of Concerns** - Each command has a single, clear purpose
2. **Smart Routing** - Main commands detect context and route appropriately
3. **Sequential Interaction** - Ask one question at a time for clarity
4. **Progressive Disclosure** - Show only what's relevant at each step
5. **Resumability** - Every command updates context for future resumption

## File Structure

```
.claude/commands/
├── README.md (this file)
├── cspec:init-new.md
├── cspec:init-existing.md
├── cspec:plan.md
├── cspec:implement.md
├── cspec:checkpoint.md
└── cspec:archive.md
```

## Customization

These commands are templates that users copy to their projects. You can customize:
- Questions asked during initialization
- Tech stack options and defaults
- CLAUDE.md template structure
- Workflow steps and validation

Edit the .md files in this directory to change command behavior.

## Development

When developing new commands:
1. Create `.claude/commands/your-command.md`
2. Add frontmatter with name and description
3. Write clear instructions for Claude to follow
4. Test with real projects
5. Document in this README

---

**Related Files:**
- `CLAUDE.md.template` - Template for project context
- `.claudeignore.template` - Template for ignore patterns
- `.specs/template/` - Templates for spec files
