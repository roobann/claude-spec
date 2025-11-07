# Frontend Expert MCP Server

Domain-specific MCP server providing frontend development tools for claude-spec.

## Features

### Tools

- **run_browser**: Launch browser and perform actions (navigate, click, fill, screenshot, get content)
- **test_component**: Test frontend components
- **take_screenshot**: Capture screenshots of pages or elements
- **validate_accessibility**: Run WCAG accessibility checks
- **measure_performance**: Measure page load performance metrics
- **run_e2e_tests**: Execute end-to-end tests

### Resources

- **browser://viewport**: Browser viewport configuration

## Installation

### Global Installation (Recommended)

```bash
npm install -g @claude-spec/frontend-mcp-server
```

### Project-Specific Installation

```bash
npm install @claude-spec/frontend-mcp-server
```

### Direct Usage (No Installation)

```bash
npx @claude-spec/frontend-mcp-server
```

## Configuration

### Add to Claude Code

```bash
claude mcp add frontend-expert \
  --env BASE_URL="http://localhost:3000" \
  --env BROWSER_TYPE="chromium" \
  --env HEADLESS="true" \
  --env VIEWPORT_WIDTH="1920" \
  --env VIEWPORT_HEIGHT="1080" \
  --env E2E_TEST_COMMAND="npm run test:e2e" \
  -- npx @claude-spec/frontend-mcp-server
```

### Project-Level Configuration (.mcp.json)

```json
{
  "mcpServers": {
    "frontend-expert": {
      "command": "npx",
      "args": ["@claude-spec/frontend-mcp-server"],
      "env": {
        "BASE_URL": "http://localhost:3000",
        "BROWSER_TYPE": "chromium",
        "HEADLESS": "true",
        "VIEWPORT_WIDTH": "1920",
        "VIEWPORT_HEIGHT": "1080",
        "E2E_TEST_COMMAND": "npm run test:e2e"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BASE_URL` | Base URL of frontend application | No | http://localhost:3000 |
| `BROWSER_TYPE` | Browser to use (chromium, firefox, webkit) | No | chromium |
| `HEADLESS` | Run browser in headless mode | No | true |
| `VIEWPORT_WIDTH` | Browser viewport width | No | 1920 |
| `VIEWPORT_HEIGHT` | Browser viewport height | No | 1080 |
| `E2E_TEST_COMMAND` | Command to run E2E tests | No | npm run test:e2e |

## Usage

Once configured, Claude Code can use frontend tools automatically:

### Run Browser Actions

```
User: "Navigate to the login page and fill in the form"
Claude: [Uses @frontend-expert run_browser tool]
        Action: navigate to http://localhost:3000/login
        Action: fill #email with "test@example.com"
        Action: fill #password with "password123"
        → Form filled successfully
```

### Test Components

```
User: "Test the LoginForm component"
Claude: [Uses @frontend-expert test_component tool]
        npm test -- LoginForm.test.tsx
        → All tests passed ✅
```

### Take Screenshots

```
User: "Take a screenshot of the homepage"
Claude: [Uses @frontend-expert take_screenshot tool]
        URL: http://localhost:3000
        → Screenshot saved: screenshot.png
```

### Validate Accessibility

```
User: "Check if the login page is accessible"
Claude: [Uses @frontend-expert validate_accessibility tool]
        URL: http://localhost:3000/login
        Standard: WCAG 2.1 AA
        → Accessibility scan passed ✅ (or shows violations)
```

### Measure Performance

```
User: "How fast does the homepage load?"
Claude: [Uses @frontend-expert measure_performance tool]
        URL: http://localhost:3000
        Runs: 3
        → Average load time: 850ms
```

### Run E2E Tests

```
User: "Run the authentication E2E tests"
Claude: [Uses @frontend-expert run_e2e_tests tool]
        Pattern: "authentication"
        → E2E tests passed ✅
```

## Integration with claude-spec

This MCP server integrates with the claude-spec multi-agent system:

1. **During Planning** (`/cspec:plan`):
   - Spec identifies feature needs frontend work
   - Sets `domains: [frontend]` or `domains: [backend, frontend]`

2. **During Implementation** (`/cspec:implement`):
   - Orchestrator detects frontend-expert MCP server
   - Spawns frontend-expert agent with browser tools
   - Agent uses tools (browser automation, testing, screenshots)
   - Updates progress and completes frontend tasks

3. **Tools Available to Agent**:
   - Browser automation for testing UI
   - Component testing
   - Screenshot capture for validation
   - Accessibility checks
   - Performance measurements

## Browser Support

Supports three browser engines via Playwright:
- **Chromium** (Chrome, Edge) - Default
- **Firefox** (Mozilla Firefox)
- **WebKit** (Safari)

Change browser with `BROWSER_TYPE` environment variable.

## Common Workflows

### Testing a New Component

```javascript
// Agent workflow:
1. Use test_component to run unit tests
2. Use run_browser to visually verify component
3. Use take_screenshot to capture appearance
4. Use validate_accessibility to check WCAG compliance
5. Report results back to orchestrator
```

### E2E User Flow Testing

```javascript
// Agent workflow:
1. Use run_browser(action: 'navigate') to start flow
2. Use run_browser(action: 'fill') to fill forms
3. Use run_browser(action: 'click') to submit
4. Use run_browser(action: 'get_content') to verify result
5. Use take_screenshot to document flow
6. Update progress.yml with test results
```

### Performance Optimization

```javascript
// Agent workflow:
1. Use measure_performance (baseline)
2. Make code changes
3. Use measure_performance (after changes)
4. Compare results
5. Document improvements in context.yml
```

## Security

### Browser Isolation

- Browser runs in sandboxed Playwright environment
- No access to host filesystem beyond screenshots
- Network requests follow same-origin policy
- Cookies/storage isolated per context

### Secrets Management

Store credentials in environment variables, never in code:

```bash
# .env.local (gitignored)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=SecurePassword123!

# Use in MCP config
claude mcp add frontend-expert \
  --env TEST_USER_EMAIL="${TEST_USER_EMAIL}" \
  --env TEST_USER_PASSWORD="${TEST_USER_PASSWORD}" \
  -- npx @claude-spec/frontend-mcp-server
```

## Troubleshooting

### Browser Not Launching

**Symptom:** Browser launch fails

**Solutions:**

1. Install Playwright browsers:
```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

2. Check headless mode:
```bash
# Try non-headless for debugging
claude mcp add frontend-expert --env HEADLESS="false" ...
```

3. Verify system dependencies (Linux):
```bash
# Ubuntu/Debian
sudo apt-get install libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1

# Arch
sudo pacman -S nss at-spi2-core libdrm mesa
```

### Tests Not Running

**Symptom:** test_component or run_e2e_tests fail

**Solutions:**

1. Verify test command works manually:
```bash
npm test
npm run test:e2e
```

2. Check E2E_TEST_COMMAND is set correctly:
```json
{
  "env": {
    "E2E_TEST_COMMAND": "npm run test:e2e"
  }
}
```

3. Ensure tests are configured for CI mode:
```javascript
// In test config
module.exports = {
  testEnvironment: 'jsdom', // or playwright
  ci: process.env.CI === 'true',
};
```

### Screenshots Not Saving

**Symptom:** take_screenshot returns success but no file

**Solutions:**

1. Check file permissions in current directory
2. Verify path is writable
3. Use absolute paths:
```javascript
filename: '/absolute/path/to/screenshot.png'
```

### Accessibility Checks Failing

**Symptom:** validate_accessibility errors

**Solutions:**

1. Ensure page is fully loaded:
```javascript
// Wait for network idle
await page.waitForLoadState('networkidle');
```

2. Check if axe-core loads (needs internet):
```javascript
// Or inject local axe-core
await page.addScriptTag({ path: './node_modules/axe-core/axe.min.js' });
```

## Supported Frameworks

- React (Create React App, Next.js, Vite)
- Vue (Vue CLI, Nuxt, Vite)
- Angular
- Svelte (SvelteKit)
- Vanilla JavaScript
- Any framework with HTML output

## Development

### Running Locally

```bash
cd .mcp-servers/frontend-expert
npm install
npm start
```

### Testing

```bash
npm test
```

### Debugging

Set environment variable:

```bash
DEBUG=pw:api npm start  # Playwright debug logs
```

## Contributing

See main project CONTRIBUTING.md for guidelines.

## License

MIT
