---
name: cspec:init-existing
description: Initialize spec system for existing project with auto-detection
---

Initialize Claude-Native Spec system for an **existing project** that already has code. This command auto-detects your tech stack from existing files and confirms with you before generating configuration.

## When to Use

Use `/cspec:init-existing` when:
- You have an existing codebase
- package.json, go.mod, Cargo.toml, or other config files already exist
- You want to add the spec system to your current project

For brand new projects without code, use `/cspec:init-new` instead.

## Usage

```bash
/cspec:init-existing
```

The command will scan your project, show what it detected, and ask for confirmation.

## How It Works

### Step 1: Auto-Detection

The command scans your project for tech stack indicators:

**Language Detection:**
- `package.json` + `tsconfig.json` → TypeScript
- `package.json` (no tsconfig) → JavaScript
- `requirements.txt` or `pyproject.toml` → Python
- `go.mod` → Go
- `Cargo.toml` → Rust
- `pom.xml` or `build.gradle` → Java

**Framework Detection:**

For JavaScript/TypeScript (from package.json dependencies):
- `next` → Next.js (+ version)
- `react` (no next) → React
- `vue` → Vue.js
- `svelte` → Svelte
- `@angular/core` → Angular
- `express` → Express.js
- `@nestjs/core` → Nest.js

For Python (from requirements.txt or pyproject.toml):
- `django` → Django
- `fastapi` → FastAPI
- `flask` → Flask

For Go (from go.mod):
- `github.com/gin-gonic/gin` → Gin
- `github.com/labstack/echo` → Echo
- `github.com/gofiber/fiber` → Fiber

For Rust (from Cargo.toml):
- `axum` → Axum
- `actix-web` → Actix Web
- `rocket` → Rocket

**Package Manager Detection:**
- `pnpm-lock.yaml` → pnpm
- `yarn.lock` → yarn
- `bun.lockb` → bun
- `package-lock.json` → npm
- `poetry.lock` → Poetry
- `Pipfile.lock` → Pipenv
- `Cargo.lock` → Cargo

**Database Detection:**
From dependencies:
- `prisma`, `pg`, `postgres` → PostgreSQL
- `mongoose`, `mongodb` → MongoDB
- `mysql`, `mysql2` → MySQL
- `better-sqlite3`, `sqlite3` → SQLite
- `redis`, `ioredis` → Redis

**Project Structure Detection:**
Scans for directories:
- `src/`, `app/`, `pages/`, `components/` → Frontend patterns
- `backend/`, `api/`, `server/` → Backend patterns
- Determines if code lives in root or subfolder

**CI/CD Detection:**
- `.github/workflows/` → GitHub Actions
- `.gitlab-ci.yml` → GitLab CI
- `.circleci/config.yml` → CircleCI
- `Jenkinsfile` → Jenkins

### Step 2: Confirmation

Shows detected configuration and asks for confirmation:

```
🔍 Detected tech stack:

  Language: TypeScript
  Framework: Next.js 14
  Package Manager: pnpm
  Database: PostgreSQL (detected: Prisma)
  Project Structure: Project root (src/, app/)
  CI/CD: GitHub Actions

Is this correct?
```

Options:
- **Yes, looks good** - Proceed with detected values
- **No, let me adjust** - Ask interactive questions for each setting
- **Cancel** - Don't initialize

### Step 3: Interactive Adjustments (if needed)

If user selects "No, let me adjust", ask questions for any values they want to change:

1. **Language** - Confirm or select different
2. **Framework** - Confirm or select different
3. **Database** - Confirm or select different
4. **Project Structure** - Confirm or select different
5. **CI/CD** - Confirm or select different

Skip questions where user confirms the detected value.

### Step 4: Generate Configuration

Same as `/cspec:init-new`:
- Create CLAUDE.md with tech stack
- Create .claudeignore with language-specific patterns
- Initialize .specs/ directory structure

## Example Session

### Full Auto-Detection

```
> /cspec:init-existing

🔍 Scanning project...

Detected tech stack:
  Language: Python
  Framework: FastAPI
  Package Manager: Poetry
  Database: PostgreSQL
  Project Structure: backend/
  CI/CD: GitHub Actions

Is this correct?
> Yes, looks good

✅ Created CLAUDE.md with:
  - Tech stack configuration
  - Project structure map
  - Development commands
  - Code style guidelines

✅ Created .claudeignore with:
  - Python patterns
  - Build artifacts
  - Environment files

✅ Initialized .specs/ structure:
  - active-task/ (for current work)
  - completed-tasks/ (for archives)
  - template/ (for spec templates)

📝 Next steps:
  1. Review CLAUDE.md and customize if needed
  2. Run /cspec:plan [feature-name] to start your first task
  3. See .specs/README.md for workflow guide

Ready to use!
```

### With Adjustments

```
> /cspec:init-existing

🔍 Scanning project...

Detected tech stack:
  Language: TypeScript
  Framework: React
  Package Manager: npm
  Database: None detected
  Project Structure: Project root
  CI/CD: None detected

Is this correct?
> No, let me adjust

What would you like to adjust?
> Database and CI/CD

Which database are you using?
> PostgreSQL

Which CI/CD platform are you using?
> GitHub Actions

Configuration:
  Language: TypeScript
  Framework: React
  Package Manager: npm
  Database: PostgreSQL
  Project Structure: Project root
  CI/CD: GitHub Actions

✅ Initialization complete!
```

## Detection Algorithm

### 1. Scan Project Files

```bash
# Check for language indicators
- package.json (JS/TS)
- tsconfig.json (TS)
- requirements.txt (Python)
- pyproject.toml (Python)
- go.mod (Go)
- Cargo.toml (Rust)
- pom.xml (Java)
- build.gradle (Java)
```

### 2. Parse Dependencies

For JavaScript/TypeScript:
```javascript
// Read package.json
const pkg = JSON.parse(read('package.json'))
const deps = {...pkg.dependencies, ...pkg.devDependencies}

// Detect framework
if (deps.next) framework = 'Next.js ' + deps.next
else if (deps.react) framework = 'React'
else if (deps.vue) framework = 'Vue.js'
// etc.

// Detect database
if (deps.prisma) database = 'PostgreSQL (Prisma)'
else if (deps.mongoose) database = 'MongoDB'
// etc.
```

For Python:
```python
# Read requirements.txt or pyproject.toml
# Check for: django, fastapi, flask
# Check for: psycopg2, pymongo, etc.
```

### 3. Check Directory Structure

```bash
# Run ls to find directories
ls -d */ 2>/dev/null

# Look for:
- src/ → Root-level src
- app/ → Root-level app (Next.js App Router or generic)
- backend/ → Backend in subfolder
- api/ → API in subfolder
- frontend/ → Frontend in subfolder
```

### 4. Check CI/CD

```bash
# Check for CI/CD config files
- .github/workflows/*.yml → GitHub Actions
- .gitlab-ci.yml → GitLab CI
- .circleci/config.yml → CircleCI
- Jenkinsfile → Jenkins
```

## What Gets Created

Same as `/cspec:init-new`:

1. **CLAUDE.md** - Project context with detected tech stack
2. **.claudeignore** - Language-specific ignore patterns
3. **.specs/** - Directory structure for specs

## Implementation Details

### Auto-Detection Logic

```javascript
async function detectTechStack() {
  const detected = {}

  // Language detection
  if (exists('package.json')) {
    detected.language = exists('tsconfig.json') ? 'TypeScript' : 'JavaScript'
    const pkg = readJSON('package.json')

    // Framework
    const deps = {...pkg.dependencies, ...pkg.devDependencies}
    if (deps.next) detected.framework = 'Next.js'
    else if (deps.react) detected.framework = 'React'
    // etc.

    // Package manager
    if (exists('pnpm-lock.yaml')) detected.packageManager = 'pnpm'
    else if (exists('yarn.lock')) detected.packageManager = 'yarn'
    else detected.packageManager = 'npm'

    // Database
    if (deps.prisma) detected.database = 'PostgreSQL'
    else if (deps.mongoose) detected.database = 'MongoDB'
    // etc.
  }

  else if (exists('requirements.txt') || exists('pyproject.toml')) {
    detected.language = 'Python'
    // Read and parse for framework/database
  }

  else if (exists('go.mod')) {
    detected.language = 'Go'
    // Read go.mod for frameworks
  }

  // ... etc for other languages

  // Project structure
  const dirs = await listDirectories()
  if (dirs.includes('backend')) detected.folder = 'backend'
  else if (dirs.includes('api')) detected.folder = 'api'
  else detected.folder = 'Project root'

  // CI/CD
  if (exists('.github/workflows')) detected.cicd = 'GitHub Actions'
  else if (exists('.gitlab-ci.yml')) detected.cicd = 'GitLab CI'
  // etc.

  return detected
}
```

### Confirmation Flow

1. Run detection
2. Show all detected values
3. Ask single confirmation question with AskUserQuestion
4. If "No, let me adjust", ask follow-up questions
5. Generate files with final configuration

### Edge Cases

**No detection possible:**
- Fall back to asking all questions like `/cspec:init-new`
- Inform user: "Couldn't auto-detect tech stack. Let's configure manually."

**Partial detection:**
- Show what was detected
- Ask questions only for missing values
- Example: "Detected TypeScript + React, but couldn't detect database. Which database are you using?"

**Multiple languages detected:**
- List all detected languages
- Ask which is primary
- Note others in CLAUDE.md

**Conflicting indicators:**
- Example: Both Django and FastAPI in requirements.txt
- Ask user to clarify: "Found both Django and FastAPI. Which is your primary framework?"

## Handle Existing Files

**If CLAUDE.md exists:**
```
CLAUDE.md already exists. What would you like to do?
- Overwrite with detected configuration
- Merge detected info into existing file
- Cancel initialization
```

**If .claudeignore exists:**
```
.claudeignore already exists. Append detected patterns?
- Yes, add missing patterns
- No, keep existing
```

**If .specs/ exists:**
- Don't overwrite existing specs
- Only create missing directories
- Inform user: "Found existing .specs/ directory. Only adding missing directories."

## Success Criteria

After running this command:
- [x] Tech stack accurately detected from existing files
- [x] User confirms or adjusts detected values
- [x] CLAUDE.md created with correct configuration
- [x] .claudeignore has appropriate patterns
- [x] .specs/ structure initialized
- [x] User knows next steps

## Important Notes

- **Always show detected values** before confirming
- **Be conservative** - If uncertain, ask rather than assume
- **Preserve existing work** - Never overwrite without asking
- **Partial detection is OK** - Ask for missing values
- **Framework versions matter** - Detect Next.js 13 vs 14, Django 4 vs 5, etc.

---

**Next:** After initialization, run `/cspec:plan [feature-name]` to start your first task with the spec system.
