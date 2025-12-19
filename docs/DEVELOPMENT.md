# Development Guide

## Project Structure

```
.
├── ui-heist/           # Extension Source Code
│   ├── manifest.json   # Extension configuration
│   ├── popup.html      # Popup UI
│   ├── popup.js        # Popup logic
│   ├── content.js      # Content script (runs on pages)
│   ├── utils.js        # Shared utility logic (UMD module)
│   └── styles.css      # Content script styles (highlighting)
├── tests/              # Unit Tests
│   └── utils.test.js   # Tests for utils.js
├── verification/       # E2E Verification Scripts
│   └── verify_ui_heist.py
├── e2e/                # E2E Test Assets
│   ├── simulation.html # Test page
│   └── chrome-mock.js  # Mocks Chrome API
└── docs/               # Documentation
```

## Running Unit Tests

The core logic for code generation is located in `ui-heist/utils.js`. It is designed as a UMD module to work in both the browser and Node.js.

To run the unit tests:

```bash
node tests/utils.test.js
```

These tests verify:
- Helper functions (camelCase conversion, style filtering).
- JSX generation logic.

## Running End-to-End (E2E) Tests

E2E tests verify the extension's behavior in a real browser environment using Playwright.

### Prerequisites for E2E
- Python 3
- Playwright

```bash
pip install playwright
playwright install chromium
```

### Running the E2E Script

```bash
python3 verification/verify_ui_heist.py
```

This script will:
1. Launch a headless Chromium instance.
2. Load a local simulation page (`e2e/simulation.html`).
3. Inject the extension scripts.
4. Simulate user interactions (hover, click).
5. Verify the captured output matches expectations.
