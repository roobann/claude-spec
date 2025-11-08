#!/bin/bash

# Claude-Native Spec System Setup Script
# This script copies command files from the template to your .claude/commands/ directory

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="${SCRIPT_DIR}/.claude/commands"
TARGET_DIR="$(pwd)/.claude/commands"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Claude-Native Spec System - Setup Script              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if template directory exists
if [ ! -d "$TEMPLATE_DIR" ]; then
    echo -e "${RED}✗ Error: Template directory not found at:${NC}"
    echo -e "  ${TEMPLATE_DIR}"
    echo ""
    echo -e "Make sure the script is in the claude-spec folder with .claude/commands/ subdirectory."
    exit 1
fi

# Create target directory if it doesn't exist
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${BLUE}Creating .claude/commands/ directory...${NC}"
    mkdir -p "$TARGET_DIR"
    echo -e "${GREEN}✓ Directory created${NC}"
    echo ""
fi

# Count files to process
total_files=$(find "$TEMPLATE_DIR" -maxdepth 1 -name "*.md" | wc -l)

if [ "$total_files" -eq 0 ]; then
    echo -e "${YELLOW}⚠ No command files found in template directory${NC}"
    exit 0
fi

echo -e "${BLUE}Found ${total_files} command file(s) in template${NC}"
echo ""

# Copy files (replace existing)
copied=0
replaced=0

while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    target_file="${TARGET_DIR}/${filename}"

    if [ -f "$target_file" ]; then
        cp "$file" "$target_file"
        echo -e "${GREEN}✓ Replaced:${NC} ${filename}"
        replaced=$((replaced + 1))
    else
        cp "$file" "$target_file"
        echo -e "${GREEN}✓ Copied:${NC}   ${filename}"
        copied=$((copied + 1))
    fi
done < <(find "$TEMPLATE_DIR" -maxdepth 1 -name "*.md" -print0)

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "Summary:"
echo -e "  ${GREEN}New:${NC}      ${copied} file(s)"
echo -e "  ${GREEN}Updated:${NC}  ${replaced} file(s)"
echo ""

# List installed commands
if [ "$copied" -gt 0 ] || [ "$replaced" -gt 0 ]; then
    echo -e "${BLUE}Available commands:${NC}"
    for file in "$TARGET_DIR"/*.md; do
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

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "  1. Start Claude Code in this directory"
echo -e "  2. Run ${GREEN}/cspec:init${NC} to initialize your project"
echo -e "     - Auto-detects tech stack for existing projects"
echo -e "     - Interactive setup with guided questions"
echo -e "     - Or specify tech stack explicitly"
echo -e ""
echo -e "${BLUE}Examples:${NC}"
echo -e "  ${GREEN}/cspec:init${NC}                                                    # Auto-detect everything"
echo -e "  ${GREEN}/cspec:init language=TypeScript framework=\"Next.js 14\"${NC}         # Specify tech stack"
echo -e "  ${GREEN}/cspec:init language=Python framework=FastAPI database=PostgreSQL folder=backend${NC}"
echo ""
echo -e "${YELLOW}Tip:${NC} See ${SCRIPT_DIR}/docs/ for detailed documentation"
echo ""
