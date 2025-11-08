# Slash Commands

Commands for the Claude-Native Spec workflow system.

## Commands

### Initialization
- **`/cspec:init-new`** - New project setup (interactive config)
- **`/cspec:init-existing`** - Existing project setup (auto-detect)

### Workflow
- **`/cspec:architect [feature-name]`** - Design architecture with comprehensive planning
  - Use `--quick` flag for simple features
  - Creates architecture.md + spec/progress/context files
- **`/cspec:implement`** - Execute implementation from specs
- **`/cspec:checkpoint`** - Save progress before breaks
- **`/cspec:archive`** - Complete and archive feature

## Workflow Pattern

```
Init → Architect → Implement → Checkpoint → Archive
```

**Example:**
```bash
/cspec:init-existing
/cspec:architect user-authentication
/cspec:implement
/cspec:checkpoint
/cspec:archive
```

## Files Created

- `.specs/active-task/architecture.md` - Detailed design & ADRs
- `.specs/active-task/spec.yml` - Requirements
- `.specs/active-task/progress.yml` - Task tracking
- `.specs/active-task/context.yml` - Metadata
- `.specs/active-task/context.md` - Human context

## Related

- `CLAUDE.md.template` - Project context template
- `.claudeignore.template` - Ignore patterns
- `.specs/template/` - Spec file templates
