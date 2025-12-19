# UI Heist

UI Heist is a Chrome extension that allows you to "steal" (inspect) UI elements from any website and convert them into ready-to-use React components with computed styles.

## Features

- **Inspect Mode**: Highlight DOM elements on hover.
- **Click to Capture**: Click an element to generate clean React/JSX code.
- **Computed Styles**: Automatically extracts relevant CSS (colors, spacing, typography, layout) and converts them to inline styles.
- **Clipboard Ready**: One-click copy to clipboard.

## Installation

1. Clone this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the `ui-heist` directory inside this repository.

## Usage

1. Click the UI Heist icon in your Chrome toolbar.
2. Click **Start Inspecting**.
3. Hover over elements on the page to see the highlighter.
4. Click the element you want to capture.
5. The extension popup will reopen (or you can open it) to view the generated React code.
6. Click **Copy Code** to use it in your project.
