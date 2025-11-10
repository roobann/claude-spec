#!/bin/bash

# Claude-Native Spec System Setup Script
# This script copies command files and templates to your project

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMANDS_TEMPLATE_DIR="${SCRIPT_DIR}/.claude/commands"
COMMANDS_TARGET_DIR="$(pwd)/.claude/commands"
SPECS_TEMPLATE_DIR="${SCRIPT_DIR}/.specs/template"
SPECS_TARGET_DIR="$(pwd)/.specs/template"
TEMPLATES_SOURCE_DIR="${SCRIPT_DIR}"
TASKS_DIR="$(pwd)/.specs/tasks"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Claude-Native Spec System - Setup Script              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if template directories exist
if [ ! -d "$COMMANDS_TEMPLATE_DIR" ]; then
    echo -e "${RED}✗ Error: Commands template directory not found at:${NC}"
    echo -e "  ${COMMANDS_TEMPLATE_DIR}"
    echo ""
    echo -e "Make sure the script is in the claude-spec folder with .claude/commands/ subdirectory."
    exit 1
fi

# Create target directories if they don't exist
echo -e "${BLUE}Setting up directory structure...${NC}"

if [ ! -d "$COMMANDS_TARGET_DIR" ]; then
    mkdir -p "$COMMANDS_TARGET_DIR"
    echo -e "${GREEN}✓ Created .claude/commands/${NC}"
fi

if [ ! -d "$SPECS_TARGET_DIR" ]; then
    mkdir -p "$SPECS_TARGET_DIR"
    echo -e "${GREEN}✓ Created .specs/template/${NC}"
fi

echo ""

# Counters
total_copied=0
total_replaced=0

# ═══════════════════════════════════════════════════════════
# 1. Copy Command Files (.claude/commands/*.md)
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}Copying command files...${NC}"

command_files=$(find "$COMMANDS_TEMPLATE_DIR" -maxdepth 1 -name "*.md" | wc -l)

if [ "$command_files" -eq 0 ]; then
    echo -e "${YELLOW}⚠ No command files found${NC}"
else
    while IFS= read -r -d '' file; do
        filename=$(basename "$file")
        target_file="${COMMANDS_TARGET_DIR}/${filename}"

        if [ -f "$target_file" ]; then
            cp "$file" "$target_file"
            echo -e "${GREEN}✓ Replaced:${NC} commands/${filename}"
            total_replaced=$((total_replaced + 1))
        else
            cp "$file" "$target_file"
            echo -e "${GREEN}✓ Copied:${NC}   commands/${filename}"
            total_copied=$((total_copied + 1))
        fi
    done < <(find "$COMMANDS_TEMPLATE_DIR" -maxdepth 1 -name "*.md" -print0)
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 2. Copy Spec Template Files (.specs/template/*)
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}Copying spec template files...${NC}"

if [ -d "$SPECS_TEMPLATE_DIR" ]; then
    while IFS= read -r -d '' file; do
        filename=$(basename "$file")
        target_file="${SPECS_TARGET_DIR}/${filename}"

        if [ -f "$target_file" ]; then
            cp "$file" "$target_file"
            echo -e "${GREEN}✓ Replaced:${NC} specs/${filename}"
            total_replaced=$((total_replaced + 1))
        else
            cp "$file" "$target_file"
            echo -e "${GREEN}✓ Copied:${NC}   specs/${filename}"
            total_copied=$((total_copied + 1))
        fi
    done < <(find "$SPECS_TEMPLATE_DIR" -maxdepth 1 -type f -print0)
else
    echo -e "${YELLOW}⚠ No spec templates found${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 3. Copy Init Template Files (CLAUDE.md.template, .claudeignore.template) to .specs/template/
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}Copying init template files...${NC}"

# Copy CLAUDE.md.template
if [ -f "${TEMPLATES_SOURCE_DIR}/CLAUDE.md.template" ]; then
    target_file="${SPECS_TARGET_DIR}/CLAUDE.md.template"
    if [ -f "$target_file" ]; then
        cp "${TEMPLATES_SOURCE_DIR}/CLAUDE.md.template" "$target_file"
        echo -e "${GREEN}✓ Replaced:${NC} CLAUDE.md.template"
        total_replaced=$((total_replaced + 1))
    else
        cp "${TEMPLATES_SOURCE_DIR}/CLAUDE.md.template" "$target_file"
        echo -e "${GREEN}✓ Copied:${NC}   CLAUDE.md.template"
        total_copied=$((total_copied + 1))
    fi
fi

# Copy .claudeignore.template
if [ -f "${TEMPLATES_SOURCE_DIR}/.claudeignore.template" ]; then
    target_file="${SPECS_TARGET_DIR}/.claudeignore.template"
    if [ -f "$target_file" ]; then
        cp "${TEMPLATES_SOURCE_DIR}/.claudeignore.template" "$target_file"
        echo -e "${GREEN}✓ Replaced:${NC} .claudeignore.template"
        total_replaced=$((total_replaced + 1))
    else
        cp "${TEMPLATES_SOURCE_DIR}/.claudeignore.template" "$target_file"
        echo -e "${GREEN}✓ Copied:${NC}   .claudeignore.template"
        total_copied=$((total_copied + 1))
    fi
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 4. Initialize Tasks Directory Structure
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}Initializing tasks directory...${NC}"

if [ ! -d "$TASKS_DIR" ]; then
    mkdir -p "$TASKS_DIR"
    echo -e "${GREEN}✓ Created:${NC}  .specs/tasks/"
fi

# Copy progress.yml template
if [ -f "${SPECS_TEMPLATE_DIR}/tasks-progress.yml.template" ]; then
    target_file="${TASKS_DIR}/progress.yml"
    if [ -f "$target_file" ]; then
        cp "${SPECS_TEMPLATE_DIR}/tasks-progress.yml.template" "$target_file"
        echo -e "${GREEN}✓ Replaced:${NC} .specs/tasks/progress.yml"
        total_replaced=$((total_replaced + 1))
    else
        cp "${SPECS_TEMPLATE_DIR}/tasks-progress.yml.template" "$target_file"
        echo -e "${GREEN}✓ Copied:${NC}   .specs/tasks/progress.yml"
        total_copied=$((total_copied + 1))
    fi
else
    echo -e "${YELLOW}⚠ tasks-progress.yml.template not found${NC}"
fi

# ═══════════════════════════════════════════════════════════
# 5. Copy Subagents to .claude/agents/
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}Copying subagents...${NC}"

AGENTS_SOURCE_DIR="${SCRIPT_DIR}/.specs/agents"
AGENTS_TARGET_DIR="$(pwd)/.claude/agents"

if [ -d "$AGENTS_SOURCE_DIR" ]; then
    if [ ! -d "$AGENTS_TARGET_DIR" ]; then
        mkdir -p "$AGENTS_TARGET_DIR"
        echo -e "${GREEN}✓ Created:${NC}  .claude/agents/"
    fi

    agent_count=0
    while IFS= read -r -d '' file; do
        filename=$(basename "$file")
        cp "$file" "${AGENTS_TARGET_DIR}/${filename}"
        agent_count=$((agent_count + 1))
    done < <(find "$AGENTS_SOURCE_DIR" -maxdepth 1 -name "*.md" -print0)

    echo -e "${GREEN}✓ Copied:${NC}   ${agent_count} subagents to .claude/agents/"
    total_copied=$((total_copied + agent_count))
else
    echo -e "${YELLOW}⚠ .specs/agents folder not found in template${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "Summary:"
echo -e "  ${GREEN}New files:${NC}      ${total_copied}"
echo -e "  ${GREEN}Updated files:${NC}  ${total_replaced}"
echo ""

# List installed commands
if [ "$total_copied" -gt 0 ] || [ "$total_replaced" -gt 0 ]; then
    echo -e "${BLUE}Available commands:${NC}"
    for file in "$COMMANDS_TARGET_DIR"/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file" .md)
            # Try to extract description from frontmatter
            description=$(grep -m 1 "^description:" "$file" | sed 's/^description: *//' || echo "")
            if [ -n "$description" ]; then
                echo -e "  ${GREEN}/${filename}${NC} - ${description}"
            else
                echo -e "  ${GREEN}/${filename}${NC}"
            fi
        fi
    done
    echo ""
fi

echo -e "${BLUE}Files copied to:${NC}"
echo -e "  ${GREEN}.claude/commands/${NC}      - Command files"
echo -e "  ${GREEN}.claude/agents/${NC}        - Subagents (domain experts)"
echo -e "  ${GREEN}.specs/template/${NC}       - All templates (spec files + init templates)"
echo -e "  ${GREEN}.specs/tasks/${NC}          - Task management (progress.yml index)"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "  1. ${YELLOW}(Optional)${NC} Delete the claude-spec folder - all files are copied"
echo -e "     ${BLUE}rm -rf claude-spec${NC}"
echo -e ""
echo -e "  2. Start Claude Code in this directory"
echo -e "     ${BLUE}claude${NC}"
echo -e ""
echo -e "  3. Initialize your project"
echo -e "     ${GREEN}/cspec:configure${NC}  # Auto-detect tech stack (existing projects)"
echo -e "     ${GREEN}/cspec:create${NC}      # Interactive setup (new projects)"
echo -e ""
echo -e "  4. Design your first feature"
echo -e "     ${GREEN}/cspec:architect user-authentication${NC}"
echo ""
echo -e "${YELLOW}Tip:${NC} All templates are now in your project. You can safely delete the claude-spec folder!"
echo ""
