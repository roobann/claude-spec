# Real-World Examples

Practical examples showing how to use Claude-Native Spec for different scenarios.

## Example 1: Building a REST API

**Scenario:** Add a new `products` API endpoint to an e-commerce backend

### Session Transcript

```bash
$ claude
> /architect products-api

Claude: "Let me clarify the requirements..."

You: "We need CRUD operations for products. Products have name,
      description, price, image URL, and category."

Claude: "What about authentication and authorization?"

You: "All endpoints require authentication. Only admins can create,
      update, or delete. Anyone authenticated can read."

Claude: "Should we handle inventory tracking?"

You: "No, that's separate. Out of scope."

Claude: [Creates spec.md with:]
- GET /api/products - List products
- GET /api/products/:id - Get single product
- POST /api/products - Create product (admin only)
- PUT /api/products/:id - Update product (admin only)
- DELETE /api/products/:id - Delete product (admin only)
- Data model with Prisma schema
- Authorization middleware
- Input validation with Zod
- Error handling patterns

Claude: [Creates progress.md with tasks:]
Phase 1: Data Model
- Create Prisma schema
- Run migration

Phase 2: Core Endpoints
- Implement GET /products (list)
- Implement GET /products/:id
- Implement POST /products
- Implement PUT /products/:id
- Implement DELETE /products/:id

Phase 3: Testing
- Unit tests for validation
- Integration tests for endpoints
- Test authorization

You: "Looks good, start implementation"

[Claude implements Phase 1 and updates context automatically]

$ git commit -m "WIP: products API - data model complete"

[Next day]

$ claude
> /implement

Claude: "Resuming: Products API

Phase 1 complete (data model)
Currently on Phase 2: Core Endpoints
Next: Implement GET /products endpoint

Continuing..."

[Claude continues with GET endpoint]
[Work continues through phases]
[All tests passing]

> /archive

$ git commit -m "feat: Add products CRUD API with auth"
```

### Result Files

**.specs/completed-tasks/20251103-products-api/SUMMARY.md:**
```markdown
# Products API - Complete

## What Was Built
Full CRUD API for products with authentication and authorization

## Files Created
- prisma/schema.prisma - Product model
- src/app/api/products/route.ts - List and create
- src/app/api/products/[id]/route.ts - Get, update, delete
- src/middleware/auth.ts - Auth middleware
- src/lib/validation/products.ts - Zod schemas
- tests/api/products.test.ts - Integration tests

## Key Decisions
- Used Prisma for ORM
- Zod for validation
- Next.js route handlers
- JWT tokens for auth

## Test Coverage
- 15 integration tests
- All passing
- Coverage: 95%
```

## Example 2: UI Component Development

**Scenario:** Create a reusable data table component

### Session Transcript

```bash
> /architect data-table-component

You: "Need a reusable data table with sorting, filtering, pagination"

Claude: [Creates spec with:]
- Props interface
- Column configuration
- Sorting behavior
- Filter UI
- Pagination controls
- Responsive design
- Accessibility requirements

[Begins implementation]

You: "Actually, let's add row selection too"

Claude: [Updates spec.md to include row selection]
       [Adds tasks to progress.md]
       [Updates context.md with decision]
       [Continue work automatically]

[Complete implementation]

> /archive
```

### Key Pattern: Iterative Refinement

The spec evolved during development, and that's OK. The system tracks:
- Original requirements
- Changes made
- Reasons for changes
- Final implementation

## Example 3: Bug Fix

**Scenario:** Fix a production bug with payment processing

### Session Transcript

```bash
> /architect bug-fix-payment-timeout

Claude: "What's the issue?"

You: "Payment API calls timing out after 30 seconds. Need to:
      1. Increase timeout
      2. Add retry logic
      3. Improve error messages"

Claude: [Creates spec focusing on:]
- Root cause analysis
- Solution approach
- Testing strategy
- Rollback plan

[Quick implementation - 1 hour]
[Context updated automatically]

[Test in staging]

[All good]

> /archive

$ git commit -m "fix: Increase payment timeout and add retries"
```

### Key Pattern: Bug Fix Specs

Even bugs benefit from specs:
- Documents the problem
- Records the solution
- Prevents regression
- Helps future debugging

## Example 4: Database Migration

**Scenario:** Add new fields to user table

### Session Transcript

```bash
> /architect user-profile-expansion

Claude: [Creates spec including:]
- New fields: avatar_url, bio, location
- Migration steps (up and down)
- Backward compatibility concerns
- Data backfill plan

Claude: [In progress.md:]
Phase 1: Create migration
Phase 2: Update models
Phase 3: Update API
Phase 4: Update UI
Phase 5: Backfill existing users

[Careful, methodical implementation]
[Context updated automatically]

[Test migration on staging]

[Deploy to production]

> /archive
```

### Key Pattern: Careful Migrations

Database changes require extra care. The spec includes:
- Migration up and down
- Backward compatibility
- Rollback plan
- Testing strategy

## Example 5: Refactoring

**Scenario:** Extract shared authentication logic

### Session Transcript

```bash
> /architect refactor-auth-logic

Claude: [Analyzes existing code]

Claude: [Creates spec showing:]
- Current scattered auth code
- Proposed centralized structure
- Files to modify
- Risk assessment
- Testing strategy to ensure no regressions

[Uses plan mode for safety]

[Implements refactoring]

[All tests still passing]

> /archive
```

### Key Pattern: Safe Refactoring

Spec includes:
- Before/after architecture
- Risk assessment
- Comprehensive testing
- Plan mode for review

## Example 6: Third-Party Integration

**Scenario:** Integrate Stripe payment processing

### Session Transcript

```bash
> /architect stripe-integration

Claude: "Let me ask about requirements..."

You: [Explains needs]

Claude: [Creates spec with:]
- Stripe API endpoints to use
- Webhook handling
- Error scenarios
- Testing with Stripe test mode
- Security considerations

[Implementation begins]

[Hit blocker: webhook signature verification unclear]

You: "I'm blocked on webhook verification. Update progress."

Claude: [Updates progress.md with blocker]
       [Updates context.md with research attempts]
       [Waits for resolution]

[Research Stripe docs]

You: "Found solution. Update context and continue."

Claude: [Updates context with solution]
       [Continues implementation]

> /archive
```

### Key Pattern: External Dependencies

Spec includes:
- API documentation references
- Security considerations
- Test mode usage
- Error handling
- Webhook patterns

## Example 7: Team Collaboration

**Scenario:** Two developers working on same feature

### Developer A (Day 1)

```bash
> /architect social-sharing

[Creates comprehensive spec]

[Implements backend APIs with automatic context updates]

$ git commit -m "Social sharing: backend complete"
$ git push

[End of day]
```

### Developer B (Day 2)

```bash
$ git pull

$ claude
> /implement

Claude: "Resuming: Social Sharing (started by Dev A)

Backend complete:
- Share endpoints implemented
- Database models created
- Tests passing

Frontend remaining:
- Share buttons UI
- Share preview
- Analytics tracking

Ready to continue with frontend?"

You: "Yes"

[Implements frontend using backend APIs with automatic context updates]

$ git commit -m "Social sharing: add frontend UI"
$ git push
```

### Developer A (Day 3)

```bash
$ git pull

$ claude
> /implement

Claude: "Resuming: Social Sharing

Backend (Dev A): Complete
Frontend (Dev B): Complete

Ready for final integration testing?"

[Integration testing]
[Fix minor issues]

> /archive
```

### Key Pattern: Seamless Handoffs

The spec system enables:
- Clear work division
- Context preservation
- Zero-friction handoffs
- Collaborative development

## Example 8: Long-Running Feature

**Scenario:** Dashboard redesign spanning 2 weeks

### Week 1

```bash
# Monday
> /architect dashboard-redesign
[Comprehensive planning session]
> /implement
[Implement Phase 1: Data layer with automatic context updates]
$ git commit -m "dashboard: data layer complete"

# Tuesday
> /implement
[Implement Phase 2: Charts with automatic context updates]
$ git commit -m "dashboard: charts complete"

# Wednesday
> /implement
[Implement Phase 3: Filters with automatic context updates]
$ git commit -m "dashboard: filters complete"

# Thursday-Friday
[Sick - no work]
```

### Week 2

```bash
# Monday
> /implement
Claude: "Last updated 4 days ago. Resuming..."
[Perfect resumption despite gap]
[Phase 4: Responsive design]
$ git commit -m "dashboard: responsive design complete"

# Tuesday-Wednesday
> /implement
[Phase 5: Testing and polish]
$ git commit -m "dashboard: testing complete"

# Thursday
> /implement
[Final integration]
[Deploy to staging]
$ git commit -m "dashboard: final integration"

# Friday
[Stakeholder review]
[Minor adjustments]
> /archive
```

### Key Pattern: Multi-Week Features

Success factors:
- /implement maintains context automatically
- Detailed progress tracked in progress.yml
- Phase-based breakdown
- Regular commits

## Example 9: Emergency Hotfix

**Scenario:** Critical production bug needs immediate fix

### Session Transcript

```bash
[Currently working on feature X - context automatically maintained]

[Urgent: production issue]

[Commit current work]
$ git commit -m "WIP: feature X progress"

> /architect hotfix-critical-bug

Claude: [Minimal spec - just fix description]

[Quick fix - 30 minutes]

[Test]

[Deploy]

> /archive

$ git commit -m "hotfix: Fix critical authentication bug"

[Back to original work]

> /implement

Claude: "Resuming: Feature X..."
[Right back to where you were]
```

### Key Pattern: Context Switching

Commit your current work and use /implement to resume - context is automatically preserved.

## Example 10: Learning New Codebase

**Scenario:** New developer joining project

### First Day

```bash
$ claude

You: "Explain the codebase structure"

Claude: [Reads CLAUDE.md and explains]

You: "Show me examples of existing API endpoints"

Claude: [Shows patterns]

You: "I'll start with a small bug fix"

> /architect bug-fix-typo

[Simple fix to learn workflow]

> /archive
```

### First Week

```bash
> /architect small-feature

[Builds confidence]
[Learns patterns]
[References existing code]

> /archive
```

### Second Week

```bash
> /architect medium-feature

> /implement
[More complex work]
[Contributing meaningfully]
[Context automatically maintained]
```

### Key Pattern: Gradual Onboarding

New developers can:
- Learn from CLAUDE.md
- Follow established patterns
- Build confidence incrementally
- Reference archived tasks

## Common Patterns Across Examples

### 1. Always Start with /architect
Even for small work, planning helps

### 2. Context Maintained Automatically
/implement automatically updates context as work progresses

### 3. Commit Regularly
Regular git commits preserve your work

### 4. Archive When Done
Keep active workspace clean

### 5. Document Decisions
Future you will thank present you

### 6. Iterate on Specs
Requirements evolve - update specs to match reality

## Anti-Patterns to Avoid

### ❌ Don't: Work without a spec
Even small work benefits from planning

### ❌ Don't: Let specs diverge from reality
Update specs when requirements change

### ❌ Don't: Skip archiving
Historical record is valuable

### ❌ Don't: Work on multiple tasks in parallel
Focus on one, archive, then next

### ❌ Don't: Skip commits
Regular commits preserve your work and context

## Next Steps

- Try these patterns in your project
- See [TESTING.md](TESTING.md) for practice scenarios
- Adapt patterns to your workflow (see [CUSTOMIZATION.md](CUSTOMIZATION.md))

---

Real-world usage is messy. These examples show that the system adapts to reality, not the other way around.
