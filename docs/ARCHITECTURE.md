# Architecture & Internals

This document explains the internal workings of **UI Heist**, including its component interaction, data flow, and core algorithms.

## High-Level Overview

UI Heist operates as a standard Chrome Extension (Manifest V3). It consists of two main parts:

1.  **Popup (UI):** The control center where the user starts inspection and views the results.
2.  **Content Script (The Agent):** Runs inside the context of the web page to inspect DOM elements and extract styles.

They communicate via Chrome's messaging API.

## Component Responsibilities

### 1. `manifest.json`
The entry point. It declares:
-   `permissions`: Needs `activeTab` and `storage`.
-   `content_scripts`: Injects `utils.js` and `content.js` into every page.
-   `action`: Defines `popup.html` as the default popup.

### 2. `ui-heist/utils.js` (The Brain)
A Universal Module Definition (UMD) file that contains the pure logic for code generation.
-   **Why UMD?** It allows the same code to be used in the browser (attached to `window`) and in Node.js unit tests (via `require`).
-   **Responsibilities:**
    -   `kebabToCamel`: Converts CSS props to JS props (e.g., `background-color` -> `backgroundColor`).
    -   `generateJSX`: Recursively builds a JSX string from a simplified node tree.
    -   `filterStyleValue`: Removes default/invalid styles to keep output clean.

### 3. `ui-heist/content.js` (The Operative)
The script running on the target page.
-   **State:** Tracks `isInspecting` and the `activeElement`.
-   **Event Listeners:**
    -   `mouseover`: Adds the `.ui-heist-highlight` class to the target.
    -   `click`: Triggers the capture process.
-   **Capture Logic:** Uses `window.getComputedStyle()` to read the *actual* rendered styles of elements.

### 4. `ui-heist/popup.js` (The Commander)
-   Sends the `"toggle_inspect"` message to the active tab.
-   Reads the captured code from `chrome.storage.local`.

## The "Heist" Logic (Data Flow)

When a user clicks an element to capture it, the following pipeline executes:

1.  **Selection:** `content.js` identifies the clicked `HTMLElement`.
2.  **Recursion (`captureDOM`):**
    -   The script traverses the element and its children.
    -   It filters out non-visual tags (`script`, `style`).
    -   It extracts computed styles for a whitelist of properties (defined in `utils.js`).
    -   It produces a simplified JSON tree representing the UI structure.
3.  **Generation:**
    -   The JSON tree is passed to `Utils.generateComponentCode`.
    -   This function converts the tree into a string of React/JSX code with inline styles.
4.  **Persistence:**
    -   The generated string is saved to `chrome.storage.local`.
5.  **Retrieval:**
    -   The popup reads this string and displays it to the user.

## Testing Strategy

### Unit Tests (`tests/utils.test.js`)
Since the core logic is isolated in `utils.js`, we test it in Node.js without a browser.
-   **Verify:** String manipulation, logic for filtering styles, and JSX syntax generation.
-   **Runner:** Custom script using Node's built-in `assert`.

### E2E Tests (`verification/verify_ui_heist.py`)
We use **Playwright** and a **Mock Environment** to test the extension flow.
-   **Simulation:** `e2e/simulation.html` mimics a real website.
-   **Chrome Mock:** `e2e/chrome-mock.js` stubs the `chrome.runtime` and `chrome.storage` APIs so the extension thinks it's running in a real browser.
-   **Verify:** That clicking an element actually produces the expected code in the mock storage.
