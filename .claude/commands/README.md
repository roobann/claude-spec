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
- **`/cspec:task [feature-name]`** - Create active task from roadmap
- **`/cspec:implement`** - Execute implementation from specs
- **`/cspec:archive`** - Complete and archive feature

## Workflow Pattern

```
Init → Architect → Task → Implement → Archive
```

**Example:**
```bash
/cspec:configure
/cspec:architect                      # Create project architecture
/cspec:task user-authentication       # Create feature from roadmap
/cspec:implement
/cspec:archive
/cspec:architect new-feature          # Add new feature to architecture
/cspec:task new-feature
```

## Files Created

**Project level (.specs/):**
- `architecture.md` - Master architecture & ADRs
- `roadmap.yml` - Feature roadmap
- `guidelines.md` - Development standards

**Feature level (.specs/active-task/):**
- `architecture.md` - Feature design
- `spec.yml` - Requirements
- `progress.yml` - Task tracking
- `context.md` - Resumption context

## Related

- `CLAUDE.md.template` - Project context template
- `.claudeignore.template` - Ignore patterns
- `.specs/template/` - Spec file templates
