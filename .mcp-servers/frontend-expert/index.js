#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { chromium, firefox, webkit } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

// Browser instance (lazy loaded)
let browser = null;
let browserType = process.env.BROWSER_TYPE || 'chromium';
let headless = process.env.HEADLESS !== 'false';

const initBrowser = async () => {
  if (!browser) {
    const browsers = { chromium, firefox, webkit };
    browser = await browsers[browserType].launch({ headless });
  }
  return browser;
};

// Create MCP server
const server = new Server({
  name: 'frontend-expert',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
    resources: {},
  },
});

// ========================================
// TOOL: Run Browser
// ========================================
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'run_browser',
        description: 'Launch browser and navigate to URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to navigate to',
            },
            action: {
              type: 'string',
              enum: ['navigate', 'click', 'fill', 'screenshot', 'get_content'],
              description: 'Action to perform',
              default: 'navigate',
            },
            selector: {
              type: 'string',
              description: 'CSS selector for click/fill actions',
            },
            value: {
              type: 'string',
              description: 'Value for fill action',
            },
            waitFor: {
              type: 'number',
              description: 'Time to wait in ms',
              default: 1000,
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'test_component',
        description: 'Test a frontend component',
        inputSchema: {
          type: 'object',
          properties: {
            componentPath: {
              type: 'string',
              description: 'Path to component file',
            },
            testCommand: {
              type: 'string',
              description: 'Command to run component tests',
            },
            pattern: {
              type: 'string',
              description: 'Test pattern to match',
            },
          },
          required: ['testCommand'],
        },
      },
      {
        name: 'take_screenshot',
        description: 'Capture screenshot of current page or element',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to capture',
            },
            selector: {
              type: 'string',
              description: 'CSS selector to capture (optional)',
            },
            filename: {
              type: 'string',
              description: 'Output filename',
              default: 'screenshot.png',
            },
            fullPage: {
              type: 'boolean',
              description: 'Capture full page',
              default: false,
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'validate_accessibility',
        description: 'Run accessibility checks on page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to check',
            },
            standard: {
              type: 'string',
              enum: ['wcag2a', 'wcag2aa', 'wcag2aaa'],
              description: 'WCAG standard to check against',
              default: 'wcag2aa',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'measure_performance',
        description: 'Measure page load performance',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to measure',
            },
            runs: {
              type: 'number',
              description: 'Number of test runs',
              default: 3,
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'run_e2e_tests',
        description: 'Execute end-to-end tests',
        inputSchema: {
          type: 'object',
          properties: {
            testPath: {
              type: 'string',
              description: 'Path to test file or directory',
            },
            pattern: {
              type: 'string',
              description: 'Test pattern to match',
            },
            headless: {
              type: 'boolean',
              description: 'Run in headless mode',
              default: true,
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'run_browser':
        return await handleRunBrowser(args);
      case 'test_component':
        return await handleTestComponent(args);
      case 'take_screenshot':
        return await handleTakeScreenshot(args);
      case 'validate_accessibility':
        return await handleValidateAccessibility(args);
      case 'measure_performance':
        return await handleMeasurePerformance(args);
      case 'run_e2e_tests':
        return await handleRunE2ETests(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ========================================
// Tool Handlers
// ========================================

async function handleRunBrowser(args) {
  const { url, action = 'navigate', selector, value, waitFor = 1000 } = args;

  try {
    const browserInstance = await initBrowser();
    const context = await browserInstance.newContext();
    const page = await context.newPage();

    await page.goto(url);
    await page.waitForTimeout(waitFor);

    let result = { action, url };

    switch (action) {
      case 'navigate':
        result.title = await page.title();
        result.status = 'navigated';
        break;

      case 'click':
        if (!selector) throw new Error('selector required for click action');
        await page.click(selector);
        result.clicked = selector;
        break;

      case 'fill':
        if (!selector) throw new Error('selector required for fill action');
        if (!value) throw new Error('value required for fill action');
        await page.fill(selector, value);
        result.filled = selector;
        result.value = value;
        break;

      case 'screenshot':
        const screenshotPath = join(process.cwd(), 'screenshot-temp.png');
        await page.screenshot({ path: screenshotPath });
        result.screenshot = screenshotPath;
        break;

      case 'get_content':
        if (selector) {
          result.content = await page.textContent(selector);
        } else {
          result.content = await page.content();
        }
        break;
    }

    await context.close();

    return {
      content: [
        {
          type: 'text',
          text: `Browser action '${action}' completed successfully`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://browser',
            mimeType: 'application/json',
            text: JSON.stringify(result, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Browser error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleTestComponent(args) {
  const { componentPath, testCommand, pattern } = args;

  try {
    let cmd = testCommand;
    if (componentPath) cmd += ` ${componentPath}`;
    if (pattern) cmd += ` -t "${pattern}"`;

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: process.cwd(),
      timeout: 60000,
      env: { ...process.env, CI: 'true' },
    });

    const passed = !stderr.includes('FAIL') && !stdout.includes('FAIL');

    return {
      content: [
        {
          type: 'text',
          text: `Component tests ${passed ? 'passed ✅' : 'failed ❌'}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://tests',
            mimeType: 'text/plain',
            text: stdout || stderr,
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Test execution failed: ${error.message}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://test-error',
            mimeType: 'text/plain',
            text: error.stdout || error.stderr || error.message,
          },
        },
      ],
      isError: true,
    };
  }
}

async function handleTakeScreenshot(args) {
  const { url, selector, filename = 'screenshot.png', fullPage = false } = args;

  try {
    const browserInstance = await initBrowser();
    const context = await browserInstance.newContext();
    const page = await context.newPage();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const screenshotPath = join(process.cwd(), filename);

    if (selector) {
      const element = await page.$(selector);
      if (element) {
        await element.screenshot({ path: screenshotPath });
      } else {
        throw new Error(`Element not found: ${selector}`);
      }
    } else {
      await page.screenshot({ path: screenshotPath, fullPage });
    }

    await context.close();

    return {
      content: [
        {
          type: 'text',
          text: `Screenshot saved: ${screenshotPath}`,
        },
        {
          type: 'resource',
          resource: {
            uri: `file://${screenshotPath}`,
            mimeType: 'image/png',
            text: `Screenshot of ${url}${selector ? ` (${selector})` : ''}`,
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Screenshot error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleValidateAccessibility(args) {
  const { url, standard = 'wcag2aa' } = args;

  try {
    const browserInstance = await initBrowser();
    const context = await browserInstance.newContext();
    const page = await context.newPage();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // Inject axe-core for accessibility testing
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js',
    });

    // Run accessibility scan
    const results = await page.evaluate((standard) => {
      return new Promise((resolve) => {
        axe.run({ runOnly: [standard] }, (err, results) => {
          if (err) throw err;
          resolve(results);
        });
      });
    }, standard);

    await context.close();

    const violations = results.violations || [];
    const passed = violations.length === 0;

    return {
      content: [
        {
          type: 'text',
          text: `Accessibility scan ${passed ? 'passed ✅' : `found ${violations.length} violations ❌`}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://accessibility',
            mimeType: 'application/json',
            text: JSON.stringify({
              url,
              standard,
              passed,
              violations: violations.map(v => ({
                id: v.id,
                impact: v.impact,
                description: v.description,
                nodes: v.nodes.length,
              })),
            }, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Accessibility check error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleMeasurePerformance(args) {
  const { url, runs = 3 } = args;

  try {
    const browserInstance = await initBrowser();
    const measurements = [];

    for (let i = 0; i < runs; i++) {
      const context = await browserInstance.newContext();
      const page = await context.newPage();

      const startTime = Date.now();
      await page.goto(url, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      const metrics = await page.evaluate(() => {
        const perf = performance.timing;
        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
          loadComplete: perf.loadEventEnd - perf.navigationStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        };
      });

      measurements.push({
        run: i + 1,
        loadTime,
        ...metrics,
      });

      await context.close();
    }

    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const summary = {
      runs,
      averageLoadTime: Math.round(avg(measurements.map(m => m.loadTime))),
      averageDomContentLoaded: Math.round(avg(measurements.map(m => m.domContentLoaded))),
      averageLoadComplete: Math.round(avg(measurements.map(m => m.loadComplete))),
      measurements,
    };

    return {
      content: [
        {
          type: 'text',
          text: `Performance measured: ${summary.averageLoadTime}ms average load time`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://performance',
            mimeType: 'application/json',
            text: JSON.stringify(summary, null, 2),
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Performance measurement error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleRunE2ETests(args) {
  const { testPath, pattern, headless = true } = args;

  try {
    const testCmd = process.env.E2E_TEST_COMMAND || 'npm run test:e2e';
    let cmd = testCmd;

    if (testPath) cmd += ` ${testPath}`;
    if (pattern) cmd += ` -g "${pattern}"`;

    const env = { ...process.env, CI: 'true' };
    if (headless) env.HEADLESS = 'true';

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: process.cwd(),
      timeout: 120000, // 2 minutes for E2E tests
      env,
    });

    const passed = !stderr.includes('FAIL') && !stdout.includes('failed');

    return {
      content: [
        {
          type: 'text',
          text: `E2E tests ${passed ? 'passed ✅' : 'failed ❌'}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://e2e-tests',
            mimeType: 'text/plain',
            text: stdout || stderr,
          },
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `E2E test execution failed: ${error.message}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'result://e2e-error',
            mimeType: 'text/plain',
            text: error.stdout || error.stderr || error.message,
          },
        },
      ],
      isError: true,
    };
  }
}

// ========================================
// Resources
// ========================================

server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'browser://viewport',
        name: 'Browser Viewport Info',
        description: 'Current browser viewport configuration',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  if (uri === 'browser://viewport') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            browserType: process.env.BROWSER_TYPE || 'chromium',
            headless: process.env.HEADLESS !== 'false',
            viewportWidth: parseInt(process.env.VIEWPORT_WIDTH) || 1920,
            viewportHeight: parseInt(process.env.VIEWPORT_HEIGHT) || 1080,
          }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// ========================================
// Start Server
// ========================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Frontend Expert MCP Server started');
}

// Cleanup on exit
process.on('SIGTERM', async () => {
  if (browser) await browser.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
