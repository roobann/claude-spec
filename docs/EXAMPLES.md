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

[Claude implements Phase 1]

> /checkpoint

$ git commit -m "WIP: products API - data model complete"

[Next day]

$ claude
> /resume

Claude: "Resuming: Products API

Phase 1 complete (data model)
Currently on Phase 2: Core Endpoints
Next: Implement GET /products endpoint

Ready to continue?"

You: "Yes"

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

> /checkpoint

[Continue work]

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

> /checkpoint

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

> /checkpoint

[Test migration on staging]

> /checkpoint

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

> /checkpoint

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

[Implements backend APIs]

> /checkpoint

$ git commit -m "Social sharing: backend complete"
$ git push

[End of day]
```

### Developer B (Day 2)

```bash
$ git pull

$ claude
> /resume

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

[Implements frontend using backend APIs]

> /checkpoint

$ git commit -m "Social sharing: add frontend UI"
$ git push
```

### Developer A (Day 3)

```bash
$ git pull

$ claude
> /resume

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
[Implement Phase 1: Data layer]
> /checkpoint

# Tuesday
> /resume
[Implement Phase 2: Charts]
> /checkpoint

# Wednesday
> /resume
[Implement Phase 3: Filters]
> /checkpoint

# Thursday-Friday
[Sick - no work]
```

### Week 2

```bash
# Monday
> /resume
Claude: "Last updated 4 days ago. Resuming..."
[Perfect resumption despite gap]
[Phase 4: Responsive design]
> /checkpoint

# Tuesday-Wednesday
> /resume
[Phase 5: Testing and polish]
> /checkpoint

# Thursday
> /resume
[Final integration]
[Deploy to staging]
> /checkpoint

# Friday
[Stakeholder review]
[Minor adjustments]
> /archive
```

### Key Pattern: Multi-Week Features

Success factors:
- Checkpoint daily
- Detailed context updates
- Phase-based breakdown
- Regular commits

## Example 9: Emergency Hotfix

**Scenario:** Critical production bug needs immediate fix

### Session Transcript

```bash
[Currently working on feature X]

> /checkpoint

[Urgent: production issue]

> /clear

> /architect hotfix-critical-bug

Claude: [Minimal spec - just fix description]

[Quick fix - 30 minutes]

[Test]

[Deploy]

> /archive

$ git commit -m "hotfix: Fix critical authentication bug"

[Back to original work]

> /resume

Claude: "Resuming: Feature X..."
[Right back to where you were]
```

### Key Pattern: Context Switching

Use /checkpoint + /clear to switch cleanly between tasks.

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

[More complex work]
[Contributing meaningfully]

> /checkpoint
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

### 2. Checkpoint Frequently
Daily at minimum, more often for complex work

### 3. Update Context During Work
Don't wait until checkpoint - update as you go

### 4. Use /clear for Context Switching
Clean separation between tasks

### 5. Archive When Done
Keep active workspace clean

### 6. Commit Regularly
Tie git commits to checkpoints

### 7. Document Decisions
Future you will thank present you

### 8. Iterate on Specs
Requirements evolve - update specs to match reality

## Anti-Patterns to Avoid

### ❌ Don't: Work without a spec
Even small work benefits from planning

### ❌ Don't: Forget to checkpoint
Lost context = wasted time later

### ❌ Don't: Let specs diverge from reality
Update specs when requirements change

### ❌ Don't: Skip archiving
Historical record is valuable

### ❌ Don't: Work on multiple tasks in parallel
Focus on one, archive, then next

### ❌ Don't: Commit without checkpointing
Checkpoint documents context, commit saves code

## Next Steps

- Try these patterns in your project
- See [TESTING.md](TESTING.md) for practice scenarios
- Adapt patterns to your workflow (see [CUSTOMIZATION.md](CUSTOMIZATION.md))

---

Real-world usage is messy. These examples show that the system adapts to reality, not the other way around.
