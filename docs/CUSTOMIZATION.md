# Customization Guide

How to adapt the Claude-Native Spec template to your specific needs.

## Overview

Everything in this template is designed to be customized. This guide shows you how.

## Customizing CLAUDE.md

### Add Project-Specific Rules

Edit `CLAUDE.md` to add your constraints:

```markdown
## Critical Rules

- NEVER edit files in `src/legacy/`
- ALWAYS use TypeScript strict mode
- MUST use React Server Components for new pages
- Database migrations MUST be reversible
- API responses MUST include request IDs for tracing
```

### Add Code Style Preferences

```markdown
## Code Style

- Use arrow functions for components
- Prefer const over let
- Max line length: 100 characters
- Use named exports, not default exports
- Place imports in this order: react, external, internal, relative
```

### Document Architecture Patterns

```markdown
## Architecture Patterns

### API Endpoints
- All endpoints in `src/app/api/[resource]/route.ts`
- Use route handlers, not pages API
- Return Response objects with proper status codes

### Database Access
- Use Prisma client from `src/lib/db.ts`
- Never raw SQL
- Always use transactions for multi-table operations

### Error Handling
- Custom errors in `src/lib/errors.ts`
- Log errors with `src/lib/logger.ts`
- User-facing errors must be sanitized
```

## Customizing Slash Commands

### Modify Existing Commands

Edit files in `.claude/commands/`:

**Example: Customize /architect**

Edit `.claude/commands/architect.md`:

```markdown
---
name: plan
description: Start feature with our company's spec format
---

[Modify the process to match your workflow]

### 2. Research Existing Code

Always check:
- Our design system in `src/components/design-system/`
- Our API patterns in `src/lib/api-client.ts`
- Our test utilities in `tests/utils/`
```

### Create New Commands

Create `.claude/commands/your-command.md`:

```markdown
---
name: review-pr
description: Review current branch against checklist before PR
---

Review the current branch and ensure it meets our PR requirements.

## Process

### 1. Check Code Quality
- Run linter
- Run type check
- Check test coverage

### 2. Verify Requirements
- All acceptance criteria met
- Edge cases handled
- Error states implemented

### 3. Check Documentation
- README updated if needed
- API docs updated
- Inline comments for complex logic

### 4. Create PR Summary
Generate PR description with:
- What changed
- Why it changed
- How to test
- Screenshots (if UI changes)
```

Usage: `/review-pr`

### Command Ideas

- `/setup-tests` - Set up test files for a feature
- `/generate-docs` - Auto-generate API documentation
- `/refactor-check` - Check if refactoring is safe
- `/deploy-checklist` - Pre-deployment verification
- `/create-migration` - Database migration workflow

## Customizing Spec Templates

Edit `.specs/template/*.template`:

### Customize spec.md

Add company-specific sections:

```markdown
## Compliance Requirements

- [ ] GDPR compliance checked
- [ ] SOC 2 requirements met
- [ ] Accessibility audit passed

## Performance Budgets

- Page load: < 2s
- Time to Interactive: < 3s
- Lighthouse score: > 90

## Deployment Requirements

- [ ] Feature flag configured
- [ ] Monitoring alerts set up
- [ ] Rollback plan documented
```

### Customize progress.md

Add your phases:

```markdown
## Task Breakdown

### Phase 1: Design Review
- [ ] Design approved by design team
- [ ] Accessibility review complete
- [ ] Copy approved by content team

### Phase 2: Implementation
[Your standard phases]

### Phase 3: QA
- [ ] QA test cases written
- [ ] Manual QA complete
- [ ] Automated tests passing

### Phase 4: Deployment
- [ ] Staging deployed
- [ ] Production deployed
- [ ] Monitoring confirmed
```

### Customize context.md

Add relevant sections:

```markdown
## Deployment Context

- Feature flag: `[flag-name]`
- Config vars: `[var-names]`
- Dependencies: `[service-names]`

## Monitoring

- Dashboard: [URL]
- Alerts: [Alert names]
- Logs: [Log query]

## Rollback Plan

If issues occur:
1. [Step to disable feature]
2. [Step to rollback]
3. [Who to notify]
```

## Project-Specific Workflows

### Add Pre-Commit Checks

Edit CLAUDE.md:

```markdown
## Workflow

### Before Committing
ALWAYS run these checks:
1. `npm run lint:fix`
2. `npm run type-check`
3. `npm test`
4. `npm run build`

If any fail, fix before committing.
```

Claude will follow these instructions automatically.

### Add Team Conventions

```markdown
## Team Conventions

### Branch Naming
- feature/TICKET-123-short-description
- fix/TICKET-456-bug-description
- refactor/area-being-refactored

### Commit Messages
Format: `type(scope): message`

Types: feat, fix, refactor, test, docs, chore
Example: `feat(auth): add password reset flow`

### PR Process
1. Create PR with template
2. Request review from @team-backend
3. Wait for 2 approvals
4. Squash and merge
```

## Framework-Specific Customization

### For Next.js Projects

```markdown
## Next.js Specifics

### App Router Conventions
- Server Components by default
- Client Components only when needed ('use client')
- Server Actions for mutations
- Route handlers for APIs

### File Colocation
- Components with their tests: `Button.tsx`, `Button.test.tsx`
- Types in same file when small, `types.ts` when shared
- Styles: Tailwind classes, not CSS modules

### Data Fetching
- Use React Server Components for data fetching
- Use `fetch` with Next.js cache options
- Avoid `useEffect` for data fetching
```

### For Django Projects

```markdown
## Django Specifics

### App Structure
- One feature per Django app
- Models in `models.py`, split if > 200 lines
- Views in `views/` directory (not single file)
- Templates in `templates/[app-name]/`

### Testing
- Use pytest, not unittest
- Fixtures in `conftest.py`
- Factory Boy for test data
- Test coverage: minimum 80%

### Database
- Migrations: one per logical change
- Use database indexes for foreign keys
- Avoid N+1 queries (use select_related/prefetch_related)
```

### For FastAPI Projects

```markdown
## FastAPI Specifics

### Project Structure
- Routers in `api/v1/endpoints/`
- Schemas (Pydantic) in `schemas/`
- Database models in `models/`
- Business logic in `services/`

### API Design
- Use Pydantic for validation
- Return Response models, not raw dicts
- Use dependency injection for database
- Include OpenAPI examples

### Async Best Practices
- Use async/await consistently
- Don't block event loop (no sync I/O)
- Use AsyncSession for database
```

## Team Size Adaptations

### For Solo Developers

Simplify:

```markdown
## Simplified Workflow

### Quick Start
- Skip extensive planning for small features
- Use /architect but keep specs minimal
- Archive is optional for tiny features

### Focus Areas
- Context.md is most important (for your future self)
- Progress.md can be simple checklist
- Spec.md minimal is fine
```

### For Large Teams

Enhance:

```markdown
## Team Workflow

### Spec Review Process
1. Author creates spec with /architect
2. Commits spec to branch
3. Creates "Spec Review" PR
4. Team reviews spec (not code yet)
5. Spec approved → Implementation begins

### Handoff Protocol
When handing off work:
1. Update context.md with handoff notes
2. Commit and push
3. Notify next person in Slack
4. Link to .specs/active-task/

### Pair Programming
Both developers share same Claude session:
- Screen share
- One drives, one reviews
- Both contribute to context updates
```

## Language-Specific Customizations

### TypeScript

```markdown
## TypeScript Conventions

- Use `interface` for object shapes, `type` for unions/intersections
- Prefer `unknown` over `any`
- Use strict mode (`strict: true` in tsconfig)
- Export types alongside implementations
- Use generics for reusable components
```

### Python

```markdown
## Python Conventions

- Follow PEP 8 strictly
- Use type hints (Python 3.10+ syntax)
- Docstrings for all public functions (Google style)
- Use dataclasses or Pydantic for data structures
- Format with black, sort imports with isort
```

### Go

```markdown
## Go Conventions

- Follow standard Go project layout
- Use gofmt for formatting
- Error handling: explicit, not panics
- Interfaces defined by consumer, not provider
- Use context.Context for cancellation
```

## Adding Automation

### Pre-Commit Hooks

Create `.claude/commands/pre-commit-check.md`:

```markdown
---
name: pre-commit-check
description: Run all checks before committing
---

Run comprehensive pre-commit checks.

## Process

1. Run linter and fix issues
2. Run type checker
3. Run test suite
4. Check code coverage (must be > 80%)
5. Check for console.logs or debugger statements
6. Verify no TODO comments without tickets
7. Update progress.md to mark items complete
8. Confirm ready to commit
```

### Continuous Integration

Document in CLAUDE.md:

```markdown
## CI/CD

### GitHub Actions
Our CI runs:
1. Lint check
2. Type check
3. Test suite
4. Build verification
5. Deploy to staging (on main)

If CI fails:
- Fix locally first
- Don't commit with --no-verify
- Check CI logs for details
```

## Advanced Customization

### Multiple Spec Types

Create different templates for different work:

```
.specs/template/
├── feature.spec.md
├── bugfix.spec.md
├── refactor.spec.md
└── spike.spec.md
```

Modify `/architect` to ask which type.

### Sub-Commands

Create command chains:

`.claude/commands/full-feature-workflow.md`:

```markdown
Run complete feature workflow:
1. /architect to create spec
2. Get approval from user
3. Implement following the spec
4. Run tests
5. Create PR
6. /archive when merged
```

### Integration with External Tools

Document in CLAUDE.md:

```markdown
## External Tools

### Linear/Jira
- Ticket format: PROJ-123
- Link in spec.md under References
- Update ticket when archiving

### Figma
- Design links in spec.md
- Screenshot key screens for context
- Note design system components used

### Sentry
- Error tracking project: [name]
- Check for related errors before implementing
- Verify no new errors after deployment
```

## Examples

See [EXAMPLES.md](EXAMPLES.md) for complete customization examples.

## Tips

1. **Start minimal** - Add customizations as needs arise
2. **Document decisions** - Explain why conventions exist
3. **Keep CLAUDE.md under 10k words** - Summarize, don't explain
4. **Update gradually** - Improve based on what actually helps
5. **Share with team** - Collective knowledge in CLAUDE.md

---

The best customization is the one that makes your team more productive. Start simple and iterate based on real usage.
