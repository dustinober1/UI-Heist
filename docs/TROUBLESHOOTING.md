# Troubleshooting

## Common Issues

### 1. "Start Inspecting" does nothing
- **Cause:** The content script might not be injected properly, or the page requires a reload.
- **Solution:**
  - Refresh the web page you are trying to inspect.
  - If you just installed/reloaded the extension, you **must** refresh any tabs that were already open.

### 2. Highlighting looks wrong or is missing
- **Cause:** Some websites have aggressive CSS or shadow DOM that might interfere.
- **Solution:**
  - Verify that you are not trying to inspect an element inside a cross-origin iframe (this is a browser security limitation).
  - Ensure the page has finished loading.

### 3. Captured code is empty or missing styles
- **Cause:** The element might not have computed styles for the properties we filter (e.g., if it uses default user-agent styles for everything).
- **Solution:** Try capturing a parent element.

### 4. Extension not updating after code changes
- **Cause:** Chrome does not automatically reload "unpacked" extensions when you change files.
- **Solution:**
  - Go to `chrome://extensions`.
  - Click the refresh (circular arrow) icon on the UI Heist card.
  - Reload the page you are testing.
