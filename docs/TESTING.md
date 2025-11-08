# Testing Guide

Test the Claude-Native Spec template with a sample project to understand its effectiveness.

## Quick Test (15 minutes)

Minimal test to verify the system works.

### Setup

```bash
# Create test project
mkdir test-todo-app
cd test-todo-app
npm init -y

# Copy template
cp -r /path/to/claude-spec/* .

# Start Claude
claude
```

### Test Sequence

```bash
# 1. Test auto-initialization
> /init

✓ Should detect Node.js project
✓ Should create CLAUDE.md
✓ Should create .claudeignore
✓ Should initialize .specs/

# 2. Test feature planning
> /architect todo-list

✓ Should ask clarifying questions
✓ Should create spec.md
✓ Should create progress.md
✓ Should create context.md
✓ Files should be in .specs/active-task/

# 3. Test checkpoint
> /checkpoint

✓ Should update progress.md
✓ Should update context.md
✓ Should show summary

# 4. Test resume
[Exit Claude: Ctrl+C]
[Restart]
claude
> /resume

✓ Should load context
✓ Should summarize current state
✓ Should show next steps

# 5. Test archive
> /archive

✓ Should create SUMMARY.md
✓ Should move to .specs/completed-tasks/
✓ Should clear active workspace
```

**Expected Time:** 15 minutes

**Success Criteria:** All steps work without errors

## Full Test (1-2 hours)

Complete test building a simple feature.

### Project: Todo List Application

Build a minimal but complete todo list to test the full workflow.

### Setup

```bash
# Create Next.js project
npx create-next-app@latest test-todo --typescript --tailwind --app
cd test-todo

# Copy template
cp -r /path/to/claude-spec/* .

# Start Claude
claude
```

### Phase 1: Initialization (5 min)

```bash
> /init

Expected Output:
🔍 Scanning project...

Detected:
  Language: TypeScript
  Framework: Next.js 14 (App Router)
  Styling: Tailwind CSS
  Package Manager: npm

✅ Created CLAUDE.md with Next.js specifics
✅ Created .claudeignore with Node.js patterns
✅ Initialized .specs/

# Verify:
$ cat CLAUDE.md  # Should have Next.js details
$ cat .claudeignore  # Should have node_modules/, .next/, etc.
$ ls .specs/  # Should have active/, completed/, template/
```

### Phase 2: Feature Planning (10 min)

```bash
> /architect todo-crud

Claude: "Let me ask about requirements..."

Your answers:
- Simple todo list with add, complete, delete
- In-memory (no database for now)
- Single page
- Use React Server Components
- Client components only where needed

Expected:
- spec.md created with requirements
- progress.md with task breakdown
- context.md with initial context

# Verify:
$ cat .specs/active-task/spec.md
# Should have requirements, user stories, technical design

$ cat .specs/active-task/progress.md
# Should have phases and tasks
```

### Phase 3: Implementation (30-40 min)

```bash
# Let Claude implement following the spec
[Claude creates components, implements CRUD]

# After 15 minutes of work:
> /checkpoint

Expected:
- progress.md updated with completed tasks
- context.md updated with current state

# Continue implementation
[Claude continues]

# Another checkpoint
> /checkpoint

# Complete implementation
[All features working]
```

### Phase 4: Test Resumption (5 min)

```bash
> /checkpoint

[Exit Claude: Ctrl+C]
[Wait 1 minute]
[Restart Claude]

claude
> /resume

Expected:
📋 Resuming: Todo CRUD

Current Status: In Progress
Phase: Implementation
Progress: X/Y tasks complete

✅ Completed:
[List of completed items]

🔄 Currently Working On:
[Current task with details]

📍 Next Steps:
1. [Specific next action]
2. [Following action]

Ready to continue?

# Verify context was fully restored
[Continue work seamlessly]
```

### Phase 5: Context Switch (10 min)

```bash
# Save current state
> /checkpoint

# Switch context
> /clear

# Work on something else
> /architect add-styling

[Make some styling changes]

> /checkpoint

# Switch back
> /clear

> /resume

Expected:
Should load todo-crud context, not styling context

# Verify correct context restored
```

### Phase 6: Completion (5 min)

```bash
# Finish the feature
[All tasks complete]
[Tests passing (if applicable)]

> /archive

Expected:
✅ Task Archived Successfully

📦 Feature: Todo CRUD
📁 Archived to: .specs/completed-tasks/todo-crud/

[Summary of completion]

# Verify:
$ ls .specs/completed-tasks/todo-crud/
# Should contain: spec.md, progress.md, context.md, SUMMARY.md

$ cat .specs/completed-tasks/todo-crud/SUMMARY.md
# Should have completion summary

$ ls .specs/active/
# Should be empty (except .gitkeep)
```

### Phase 7: Start New Feature (5 min)

```bash
> /architect add-persistence

[Plan a follow-up feature]

Expected:
- New spec created in active-task/
- Old feature still in completed/
- Clean transition
```

### Evaluation Checklist

After completing the test, rate these aspects:

#### Initialization
- [ ] Auto-detection worked correctly
- [ ] CLAUDE.md was accurate
- [ ] .claudeignore had appropriate patterns
- [ ] Setup was under 5 minutes

#### Planning
- [ ] Spec captured requirements well
- [ ] Progress breakdown was logical
- [ ] Context had useful starting information
- [ ] Process was straightforward

#### Checkpoint
- [ ] progress.md updates were accurate
- [ ] context.md had sufficient detail
- [ ] Updates were quick (< 30 seconds)
- [ ] Summary was clear

#### Resumption
- [ ] Context restored completely
- [ ] No information lost
- [ ] Could continue immediately
- [ ] Resumption was under 30 seconds

#### Archive
- [ ] SUMMARY.md captured key information
- [ ] Files moved correctly
- [ ] Active workspace cleaned
- [ ] Historical record preserved

#### Overall Workflow
- [ ] Commands were intuitive
- [ ] System didn't get in the way
- [ ] Actually helpful for development
- [ ] Would use in real project

## Stress Tests

### Test 1: Long Interruption

```bash
> /architect test-feature
[Work for 15 minutes]
> /checkpoint

[Close Claude]
[Wait 24 hours]

claude
> /resume

Question: Can you resume with zero ramp-up time?
```

### Test 2: Complex Feature

```bash
> /architect complex-multi-phase-feature
[Create spec with 5 phases, 30+ tasks]
[Implement over multiple sessions]
[Checkpoint between each session]
[Test resumption each time]

Question: Does system handle complexity well?
```

### Test 3: Multiple Context Switches

```bash
> /architect feature-a
[Work]
> /checkpoint
> /clear

> /architect feature-b
[Work]
> /checkpoint
> /clear

> /resume
Question: Does it resume feature-b (last active)?

> /archive

> /architect feature-c
[Work]
> /checkpoint

[Can you still access feature-a context if needed?]
```

### Test 4: Team Handoff

```bash
# Person A
> /architect shared-feature
[Implement half]
> /checkpoint
$ git commit && git push

# Person B (different machine)
$ git pull
claude
> /resume

Question: Can Person B continue seamlessly?
```

## Measuring Effectiveness

### Before Template

Time a typical task:
1. Plan the work: ___ min
2. Implement: ___ min
3. Resume next day: ___ min (context rebuilding)
4. Complete: ___ min
5. Document: ___ min

Total: ___ minutes

### With Template

Time the same task:
1. /architect: ___ min
2. Implement: ___ min
3. /checkpoint: ___ min
4. /resume next day: ___ min
5. /archive: ___ min

Total: ___ minutes

### Calculate Savings

Efficiency gain: ___%
Context restoration time: Before ___ min → After ___ min
Documentation time: Before ___ min → After ___ min

## Success Metrics

The template is working if:

✓ **Context restoration is < 1 minute**
- vs 5-15 minutes rebuilding context manually

✓ **Zero forgotten work**
- All progress and decisions captured

✓ **Team handoffs are seamless**
- New person productive immediately

✓ **Historical record exists**
- Can reference past features

✓ **System doesn't slow you down**
- Commands are quick
- Overhead is minimal

## Common Issues During Testing

### Issue: Commands not working

**Fix:**
```bash
# Verify files exist
ls -la .claude/commands/

# Check file extensions (.md)
# Restart Claude if needed
```

### Issue: Resume doesn't work

**Fix:**
```bash
# Verify files exist
ls .specs/active-task/

# Check file contents
cat .specs/active-task/context.md

# Ensure you ran /checkpoint before exiting
```

### Issue: Context not detailed enough

**Fix:**
```bash
# Update context manually
> Add more detail to context.md about [specific thing]

# Checkpoint with better notes
> /checkpoint

# Test resume again
```

### Issue: Auto-detection failed

**Fix:**
```bash
# Create package.json or language-specific files
# Run /init again

# Or edit CLAUDE.md manually
```

## After Testing

### If It Works Well

1. ✅ Use it in your real project
2. ✅ Customize for your needs (see [CUSTOMIZATION.md](CUSTOMIZATION.md))
3. ✅ Share with team
4. ✅ Iterate based on usage

### If It Needs Improvement

1. Identify pain points
2. Customize templates
3. Adjust commands
4. Simplify or enhance as needed

### Feedback

Note what worked and what didn't:

**Worked well:**
- [List aspects]

**Needs improvement:**
- [List issues]

**Would like to add:**
- [List features]

## Real Project Adoption

After testing, use it for real:

```bash
# In your actual project
cd /path/to/real-project

# Copy template
cp -r /path/to/claude-spec/* .

# Initialize
claude
> /init

# Use for next feature
> /architect actual-feature
```

Start small:
- Use for one feature first
- Refine your workflow
- Add customizations
- Gradually adopt fully

## Next Steps

- ✅ Complete testing scenarios
- ✅ Evaluate effectiveness
- ✅ Decide on adoption
- ✅ See [CUSTOMIZATION.md](CUSTOMIZATION.md) for adapting
- ✅ See [EXAMPLES.md](EXAMPLES.md) for patterns
- ✅ See [WORKFLOW.md](WORKFLOW.md) for daily usage

---

The best way to evaluate the template is to use it for real work. Testing with a sample project gives you confidence before committing.

Try it, measure the results, and adapt to your needs!
