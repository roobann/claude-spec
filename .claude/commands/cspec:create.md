---
name: cspec:create
description: Create new project with interactive tech stack configuration
---

Create a **new project** with Claude-Native Spec system. This command guides you through selecting your tech stack and sets up the complete development environment.

## When to Use

Use `/cspec:create` when:
- Starting a brand new project
- You want to interactively choose your tech stack
- No package.json, go.mod, or other language config files exist yet

For existing projects with code already written, use `/cspec:configure` instead.

## Usage

```bash
/cspec:create
```

The command will ask you a series of questions to configure your project.

## Interactive Question Flow

The command will ask these questions **ONE AT A TIME** in sequence:

### Question 1: Language Selection

```
Which programming language will you use?
```

Options:
- **TypeScript** - Typed JavaScript for safer code
- **JavaScript** - Classic web development language
- **Python** - General-purpose with great libraries
- **Go** - Fast, compiled language for backends
- **Rust** - Systems programming with safety
- **Java** - Enterprise-grade JVM language

### Question 2: Framework Selection

Based on your language choice, you'll see framework options:

**For TypeScript/JavaScript:**
- **Next.js** - React-based full-stack framework
- **React** - Frontend library only
- **Express** - Minimal Node.js backend
- **Nest.js** - Enterprise Node.js framework
- **Vue.js** - Progressive frontend framework
- **Svelte** - Compiled frontend framework

**For Python:**
- **FastAPI** - Modern async API framework
- **Django** - Full-stack batteries-included
- **Flask** - Lightweight web framework

**For Go:**
- **Gin** - Fast HTTP web framework
- **Echo** - High-performance minimalist framework
- **Fiber** - Express-inspired framework
- **Standard library** - No framework, pure Go

**For Rust:**
- **Axum** - Tokio-based web framework
- **Actix Web** - High-performance framework
- **Rocket** - Easy-to-use framework

**For Java:**
- **Spring Boot** - Enterprise framework
- **Quarkus** - Kubernetes-native Java
- **Micronaut** - Modern JVM framework

### Question 3: Project Structure

```
Where will your code live?
```

Options:
- **Project root** - src/, app/ directly in root (recommended for most)
- **backend/** - All code in backend/ folder (good for monorepos)
- **api/** - All code in api/ folder
- **Other** - Specify custom folder structure

### Question 4: Database

```
Which database will you use?
```

Options:
- **PostgreSQL** - Powerful open-source SQL database
- **MongoDB** - Flexible NoSQL document database
- **MySQL** - Popular open-source SQL database
- **SQLite** - Embedded SQL database
- **Redis** - In-memory data store
- **None/Other** - No database or will specify later

### Question 5: CI/CD Platform

```
Which CI/CD platform will you use?
```

Options:
- **GitHub Actions** - Built into GitHub
- **GitLab CI** - Built into GitLab
- **CircleCI** - Cloud CI/CD platform
- **Jenkins** - Self-hosted automation
- **None/Will set up later** - Skip for now

## What Gets Created

After answering all questions, the command will create:

### 1. CLAUDE.md

Your project's persistent context file containing:
- **Tech Stack** - Your selected configuration
- **Project Structure** - Framework-specific directory layout
- **Critical Rules** - Development best practices
- **Code Style** - Framework conventions
- **Workflow** - How to use /cspec commands
- **Commands** - Docker and development commands
- **Testing** - How to run tests
- **CI/CD** - Setup guidance (if selected)

### 2. .claudeignore

Patterns for files Claude should ignore:
- General patterns (logs, secrets, IDE files)
- Language-specific ignores (node_modules/, __pycache__, etc.)
- Build artifacts (dist/, build/, target/)
- **Never ignores** .specs/, .claude/, or CLAUDE.md

### 3. .specs/ Directory Structure

```
.specs/
├── README.md              # Spec system documentation
├── template/              # Templates for new features
│   ├── spec.yml.template
│   ├── progress.yml.template
│   └── context.md.template
└── tasks/                 # Task management
    ├── progress.yml       # Task index (all tasks tracked here)
    └── (task folders created by /cspec:task)
```

## Example Session

```
> /cspec:create

Which programming language will you use?
> TypeScript

Which framework will you use?
> Next.js

Where will your code live?
> Project root

Which database will you use?
> PostgreSQL

Which CI/CD platform will you use?
> GitHub Actions

🔍 Initializing new project...

Configuration:
  Language: TypeScript
  Framework: Next.js
  Database: PostgreSQL
  App Folder: Project root
  CI/CD: GitHub Actions

✅ Created CLAUDE.md with:
  - Tech stack configuration
  - Project structure map
  - Development commands
  - Code style guidelines

✅ Created .claudeignore with:
  - Node.js/TypeScript patterns
  - Build artifacts
  - Environment files

✅ Initialized project structure:
  - .specs/template/ (for spec templates)
  - .specs/tasks/ (with progress.yml index)

📝 Next steps:
  1. Review CLAUDE.md and customize if needed
  2. Review .claudeignore and adjust patterns
  3. Run /cspec:task [feature-name] to create your first task
  4. See .specs/README.md for workflow guide

Ready to build!
```

## Implementation Details

### 1. Ask Questions Sequentially

- Use `AskUserQuestion` tool for EACH question
- Wait for answer before proceeding to next question
- Framework options must match the selected language
- Each question informs the next

### 2. Generate CLAUDE.md

Read `.specs/template/CLAUDE.md.template` and replace:

**{{PROJECT_NAME}}**: Current directory name

**{{TECH_STACK}}**:
```
- Language: <selected language>
- Framework: <selected framework>
- Database: <selected database or "Not specified">
- Package Manager: <inferred from language>
- App Folder: <selected folder or "Project root">
- CI/CD Platform: <selected platform or "Not specified">
- Container Platform: Docker
```

**{{PROJECT_STRUCTURE}}**: Framework-specific structure:

For Next.js:
```
app/                    # Next.js 13+ App Router
  layout.tsx            # Root layout
  page.tsx              # Home page
components/             # React components
lib/                    # Utility functions
public/                 # Static assets
```

For FastAPI:
```
app/
  main.py               # Application entry
  api/                  # API routes
    routes/             # Route handlers
  models/               # Data models
  services/             # Business logic
tests/                  # Test files
```

(etc., customize for each framework)

**{{CODE_STYLE}}**: Framework-specific conventions

**{{COMMANDS}}**: Framework-specific commands

**{{DEPENDENCIES}}**: Common dependencies for the framework

**{{TESTING_COMMANDS}}**: Framework-specific test commands

**{{CICD_SECTION}}**: CI/CD setup if platform selected

### 3. Generate .claudeignore

Read `.specs/template/.claudeignore.template` and add language-specific patterns:

**For TypeScript/JavaScript:**
```
node_modules/
.next/
.nuxt/
.svelte-kit/
dist/
build/
```

**For Python:**
```
__pycache__/
*.py[cod]
.venv/
venv/
.pytest_cache/
*.egg-info/
```

**For Go:**
```
vendor/
*.exe
*.test
```

**For Rust:**
```
target/
Cargo.lock
**/*.rs.bk
```

**For Java:**
```
target/
.gradle/
build/
*.class
```

### 4. Initialize Project Structure

- Create `.specs/template/` directory
- Create `.specs/tasks/` directory
- Copy template files from `claude-spec/.specs/template/`
- Copy .specs/tasks/progress.yml from template
- Copy README.md from `claude-spec/.specs/README.md`

### 5. Handle Edge Cases

**If CLAUDE.md exists:**
- Ask: "CLAUDE.md exists. Overwrite?"
- Yes: Replace with new
- No: Cancel and exit

**If .claudeignore exists:**
- Ask: "Append to existing .claudeignore?"
- Yes: Add patterns that don't exist
- No: Skip .claudeignore creation

**If .specs/ exists:**
- Don't overwrite existing spec files
- Only create missing directories/templates

## Success Criteria

After running this command:
- [x] CLAUDE.md created with accurate tech stack
- [x] .claudeignore created with appropriate patterns
- [x] .specs/ structure initialized
- [x] User knows how to start first feature
- [x] System ready for `/cspec:task`

## Important Notes

- **One question at a time** - Never ask multiple questions in parallel
- **Language determines framework options** - Don't show Python frameworks for TypeScript
- **Be opinionated with defaults** - Suggest best practices for each framework
- **Make it easy to customize** - Users can edit files after generation
- **Never create actual code files** - Only create configuration and documentation

---

**Next:** After initialization, run `/cspec:architect` to design your project architecture, then `/cspec:task [feature-name]` to start building your first feature.
