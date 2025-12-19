# Usage Guide

## Inspecting and Capturing UI

1. **Navigate to Target Page**
   - Go to any website containing the UI element you wish to capture.

2. **Open UI Heist**
   - Click the **UI Heist** icon in your Chrome toolbar.
   - The popup window will open.

3. **Start Inspection**
   - Click the **Start Inspecting** button.
   - The popup will close, and your cursor will change to a crosshair to indicate inspection mode is active.

4. **Highlight Element**
   - Move your mouse over the page.
   - Elements will be highlighted with a border as you hover over them.
   - **Tip:** To capture a container (like a Card), hover near the edge or padding of the container to ensure the parent element is highlighted, not just its children.

5. **Capture**
   - Click on the highlighted element.
   - The inspection mode will automatically exit (cursor returns to normal).
   - The element and all its children have been converted to React code and saved.

6. **Retrieve Code**
   - Open the **UI Heist** popup again.
   - You will see the generated React code in the text area.
   - Click **Copy to Clipboard** to use it in your project.

   ![Code Output Example](placeholder-image-url)

## Notes

- **Inline Styles:** The generated code uses inline styles (`style={{ ... }}`) derived from the computed styles of the original element.
- **Filtering:** The extension filters for relevant styling properties (e.g., layout, colors, fonts) to keep the code clean, but you may need to adjust the output manually.
- **Images:** Image tags are captured, but `src` attributes pointing to relative URLs might need adjustment if used on a different domain.
