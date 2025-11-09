# Slash Commands

Commands for the Claude-Native Spec workflow system.

## Commands

### Initialization
- **`/cspec:create`** - Create new project (interactive config)
- **`/cspec:configure`** - Configure existing project (auto-detect)

### Workflow
- **`/cspec:architect`** - Design project architecture OR add features to existing
  - First time: Creates full project architecture
  - Subsequent: Adds features to roadmap
- **`/cspec:task [feature-name]`** - Create task from roadmap
- **`/cspec:implement`** - Execute implementation from specs

## Workflow Pattern

```
Init → Architect → Task → Implement
```

**Example:**
```bash
/cspec:configure
/cspec:architect                      # Create project architecture
/cspec:task user-authentication       # Create feature from roadmap
/cspec:implement
/cspec:architect new-feature          # Add new feature to architecture
/cspec:task new-feature
/cspec:implement
```

## Files Created

**Project level (.specs/):**
- `architecture.md` - Master architecture & ADRs
- `roadmap.yml` - Feature roadmap
- `guidelines.md` - Development standards
- `tasks/progress.yml` - Task index

**Task level (.specs/tasks/NNN-feature-name/):**
- `spec.yml` - Requirements & technical design
- `progress.yml` - Task tracking
- `context.md` - Resumption context

## Task Management

**Task Status:**
- Tracked in `.specs/tasks/progress.yml`
- Multiple in-progress tasks supported
- Status: pending | in_progress | completed | blocked

**Task Folders:**
- Sequential numbered: `001-feature-name`, `002-feature-name`, etc.
- Self-contained with all files
- No archive needed - stays in `.specs/tasks/`

## Related

- `CLAUDE.md.template` - Project context template
- `.claudeignore.template` - Ignore patterns
- `.specs/template/` - Spec file templates
