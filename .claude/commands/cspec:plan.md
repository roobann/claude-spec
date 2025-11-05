---
name: cspec:plan
description: Start a new feature with comprehensive planning in plan mode
---

Plan and create a specification for a new feature.

**Usage:** `/plan [feature-name]`

**Example:** `/plan user-authentication`

## Process

### 1. Review Project Configuration

**IMPORTANT:** Before starting, read `CLAUDE.md` to understand:
- Project structure and conventions
- App folder configuration (if specified in Tech Stack section)
- Code style guidelines
- Existing patterns and conventions

**App Folder Awareness:**
If the Tech Stack section in CLAUDE.md specifies an "App Folder" (e.g., `backend/`, `frontend/`), all new application code should be created within that folder. Keep this in mind when:
- Researching existing code (search within the app folder)
- Planning file locations in the spec
- Creating directory paths in the technical design

### 2. Clarify Requirements

Ask the user clarifying questions about the feature:

- What problem does this solve?
- Who is this for? (users, admins, developers, etc.)
- What are the key functional requirements?
- Are there any technical constraints?
- Are there any design requirements (UI/UX)?
- What are the success criteria?
- Any dependencies on other features?
- Priority level? (must-have, should-have, nice-to-have)

**Use AskUserQuestion for Test-Driven Development approach:**

```
Should this feature use Test-Driven Development (TDD)?
```
Options:
- "Yes - Write tests first (TDD approach)"
- "No - Focus on implementation, minimal tests"
- "Balanced - Tests alongside implementation"

**Impact on task breakdown:**
- **TDD (Yes)**: Each phase includes test writing BEFORE implementation
- **Minimal (No)**: Single test phase at the end, focus on functionality
- **Balanced**: Tests integrated into implementation phases

Get enough information to create a complete specification.

### 3. Research Existing Code with Plan Agent

**IMPORTANT:** Use the Task tool with Plan subagent (very thorough) to comprehensively analyze the codebase before planning.

Launch Plan agent with this prompt structure:

```
Analyze the codebase to prepare for implementing [feature-name]:

1. **App Folder Context**: Read CLAUDE.md to identify the app folder (if specified in Tech Stack section)
2. **Search Strategy**: Focus all searches within the app folder if specified
3. **Related Features**: Find similar features or patterns already implemented
4. **Reusable Components**: Identify existing components/utilities that can be reused
5. **Conventions**: Check established conventions:
   - API patterns and endpoint structure
   - Component/class naming conventions
   - Database schema patterns
   - Error handling approaches
   - Testing patterns
6. **Code Location**: Identify where new code should live based on existing structure
7. **Dependencies**: Check what dependencies are already available
8. **Test Patterns**: Find existing test examples to follow

Provide a comprehensive summary including:
- Key files/patterns to reference
- Reusable components
- Recommended file locations (respecting app folder)
- Conventions to follow
- Any potential conflicts or considerations
```

**Thoroughness Level:** very thorough

This ensures comprehensive codebase understanding before creating the specification.

### 4. Handle Active Task

Check if `.specs/active-task/` exists and contains files:
- If it does, ask user: "There's already an active task. Do you want to:
  1. Archive it first (recommended)
  2. Overwrite it
  3. Cancel and continue with current task"

Create or clear directory: `.specs/active-task/`

**Note on feature naming:**
- Feature name from command (e.g., `user-authentication`) is used for:
  - Archive folder name when task is completed: `.specs/completed-tasks/user-authentication/`
  - Documentation and reference
- Use kebab-case (lowercase with hyphens)
- Keep it concise and descriptive
- No dates needed (tracked in spec.md metadata)

### 5. Create Specification (spec.md)

Write comprehensive specification using this structure:

```markdown
# Feature: [Feature Name]

**Created:** [YYYY-MM-DD]
**Status:** Planning
**Priority:** [High/Medium/Low]

## Overview

[Brief 2-3 sentence description of what this feature does and why it's needed]

## User Problem

[Describe the problem from the user's perspective]

## User Stories

- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

## Functional Requirements

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Non-Functional Requirements

- **Performance:** [Requirements or N/A]
- **Security:** [Considerations or N/A]
- **Accessibility:** [Standards like WCAG or N/A]
- **Browser Support:** [Requirements or N/A]

## Technical Design

### Architecture

[High-level approach - which parts of the system are affected]

### Components/Modules

[List of components, APIs, or modules to be created or modified]

### Data Models

[If applicable, describe data structures or database changes]

```typescript
// Example data model
interface User {
  id: string;
  email: string;
  // ...
}
```

### API Endpoints (if applicable)

- `POST /api/endpoint` - Description
- `GET /api/endpoint/:id` - Description

### Dependencies

- [External packages needed]
- [Related features or modules]
- [Services or APIs to integrate]

## UI/UX Design

[If applicable, describe user interface requirements, user flows, or reference mockups]

## Success Criteria

[How do we know this feature is complete and working?]

- [ ] Success criterion 1
- [ ] Success criterion 2
- [ ] Success criterion 3

## Testing Strategy

- [ ] Unit tests for [components/functions]
- [ ] Integration tests for [workflows]
- [ ] E2E tests for [critical paths]
- [ ] Manual testing for [edge cases]

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| [Potential issue] | [How to handle it] |

## Out of Scope

[Explicitly list what is NOT included in this feature to prevent scope creep]

## Future Enhancements

[Ideas for later iterations]
```

**IMPORTANT:** In the spec, ensure all file paths respect the app folder structure from CLAUDE.md. For example, if app folder is `backend/`, then specify paths like `backend/app/models/user.py` instead of `app/models/user.py`.

### 6. Create Progress Tracker (progress.md)

Break down the spec into actionable tasks based on the chosen testing approach.

**Task Breakdown Structure depends on TDD choice:**

**If TDD (Write tests first):**
```markdown
# Progress: [Feature Name]

**Status:** Not Started
**Started:** [Will be filled when work begins]
**Last Updated:** [YYYY-MM-DD]
**Current Phase:** Planning
**Testing Approach:** Test-Driven Development (TDD)

## Task Breakdown

### Phase 1: Setup & Test Foundation
- [ ] Set up test environment and fixtures
- [ ] Write tests for [Feature Component 1]
- [ ] Write tests for [Feature Component 2]

### Phase 2: Core Implementation (TDD)
- [ ] Implement [Component 1] to pass tests
- [ ] Implement [Component 2] to pass tests
- [ ] Refactor and optimize

### Phase 3: Integration & Polish
- [ ] Integration tests
- [ ] Edge case handling
- [ ] Performance optimization
```

**If Minimal Testing (Focus on implementation):**
```markdown
# Progress: [Feature Name]

**Status:** Not Started
**Started:** [Will be filled when work begins]
**Last Updated:** [YYYY-MM-DD]
**Current Phase:** Planning
**Testing Approach:** Implementation-focused with minimal tests

## Task Breakdown

### Phase 1: Setup & Foundation
- [ ] Set up basic structure
- [ ] Configure dependencies

### Phase 2: Core Implementation
- [ ] Implement [Feature Component 1]
- [ ] Implement [Feature Component 2]
- [ ] Add error handling

### Phase 3: Basic Testing & Polish
- [ ] Add essential tests for critical paths
- [ ] Manual testing
- [ ] Documentation
```

**If Balanced (Tests alongside implementation):**
```markdown
# Progress: [Feature Name]

**Status:** Not Started
**Started:** [Will be filled when work begins]
**Last Updated:** [YYYY-MM-DD]
**Current Phase:** Planning
**Testing Approach:** Balanced (tests with implementation)

## Task Breakdown

### Phase 1: Setup & Foundation
- [ ] Set up structure and test framework
- [ ] Basic configuration

### Phase 2: Core Implementation with Tests
- [ ] Implement [Component 1] + unit tests
- [ ] Implement [Component 2] + unit tests
- [ ] Integration between components + tests

### Phase 3: Final Testing & Polish
- [ ] Edge case tests
- [ ] Performance tests
- [ ] Refinement and optimization
```

## Completed
[Empty initially]

## In Progress
[Empty initially]

## Blocked
[Empty initially]

## Next Steps

1. Review spec with stakeholders
2. Begin Phase 1 implementation
3. [Other initial steps]

## Decisions Made

[Will be filled during implementation]

## Issues Encountered

[Will be filled during implementation]

## Time Estimates

- **Estimated Total:** [X hours/days]
- **Time Spent:** 0 hours
- **Remaining:** [X hours/days]
```

### 7. Create Context File (context.md)

Initialize resumption context:

```markdown
# Context: [Feature Name]

**Created:** [YYYY-MM-DD]
**Status:** Planning Complete
**Testing Approach:** [TDD / Minimal / Balanced]

## What We're Building

[One paragraph summary of the feature]

## Current State

**Phase:** Planning
**Files Created:**
- `.specs/active-task/spec.md` - Feature specification
- `.specs/active-task/progress.md` - Task breakdown
- `.specs/active-task/context.md` - This file

**Testing Strategy:**
- [If TDD: Write tests before implementation, focus on test coverage]
- [If Minimal: Focus on implementation, add essential tests at the end]
- [If Balanced: Write tests alongside implementation]

**Next Action:** Review spec and begin Phase 1 implementation

## Architecture Context

[Key architectural decisions or patterns to follow]

## Related Files/Patterns

[Files to reference or patterns to follow from existing code]

## For Next Session

When starting work:
1. Read spec.md to understand requirements
2. Read progress.md to see task breakdown
3. Begin with Phase 1, first task
4. Update progress.md as you complete each task

## Notes

[Any additional context that would be helpful when resuming]
```

**IMPORTANT:** In context.md, include the app folder information:
```markdown
## App Folder Structure

App Folder: <folder from CLAUDE.md or "Project root">

All code for this feature should be created in: <appropriate path respecting folder structure>
```

### 8. Update CLAUDE.md if Needed

**HIGH PRIORITY:** Review if CLAUDE.md needs updates based on this feature:

**Update CLAUDE.md if:**
- Adding new dependencies not listed
- Introducing new project structure directories
- Adding new commands or scripts
- Establishing new code patterns/conventions
- Adding new testing approaches

**How to update:**
1. Read current CLAUDE.md
2. Identify what section needs updating (Dependencies, Project Structure, Commands, etc.)
3. Make minimal, focused updates
4. Keep changes relevant and concise
5. Don't remove existing important information

**Report what was updated:**
```
📝 Updated CLAUDE.md:
- Added [dependency] to Dependencies section
- Updated Project Structure with [new directory]
```

If no updates needed, skip this step.

### 9. Present Plan

Show the user:
1. Summary of what will be built
2. Key technical decisions
3. Task breakdown with estimated phases
4. Files created (spec.md, progress.md, context.md)
5. Any CLAUDE.md updates made

**IMPORTANT:** Do NOT start implementation. Present the plan and stop.

### 10. Complete Planning

Once all three files are created:
1. Present a concise summary of the plan
2. Show the user the file locations
3. Report any CLAUDE.md updates
4. End with this message:

```
✅ Plan created successfully!

Files created:
- .specs/active-task/spec.md (specification)
- .specs/active-task/progress.md (task breakdown)
- .specs/active-task/context.md (resumption context)

Review the plan and run `/cspec:implement` when ready to begin implementation.
```

**DO NOT proceed with implementation.** The user will review and run `/cspec:implement` when ready.

## Tips for Good Specifications

- **Be specific:** Clear, measurable requirements
- **Be realistic:** Don't over-commit on scope
- **Be organized:** Logical task breakdown
- **Be thorough:** Cover edge cases and error states
- **Reference existing code:** Reuse established patterns
- **Think about testing:** Plan for testability from the start

## Edge Cases

**If feature is very small:**
- Create simplified spec with just requirements and tasks
- Skip sections that aren't relevant

**If feature is very large:**
- Consider breaking into multiple smaller features
- Create this spec for Phase 1 only
- Plan future phases separately

**If unclear requirements:**
- Ask more questions before creating spec
- Mark unclear items with `[NEEDS CLARIFICATION]`
- Don't proceed with implementation until clear

## Success Criteria

- Spec.md contains clear, complete requirements
- Progress.md has actionable task breakdown
- Context.md enables easy resumption
- User understands and approves the plan
- Ready to begin implementation
