// content.js
let activeElement = null;
let isInspecting = false;

// Access the shared utils. In browser this is global.
// Note: In Node test environment this might be undefined unless mocked,
// but this file runs in Chrome.
const Utils = window.UIHeistUtils;

// 1. Listen for messages from popup to toggle inspection
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_inspect") {
    isInspecting = !isInspecting;
    toggleOverlay(isInspecting);
  }
});

function toggleOverlay(active) {
  if (active) {
    document.addEventListener("mouseover", handleHover);
    document.addEventListener("click", handleClick);
    // Add a global cursor style to body to indicate inspection mode
    document.body.style.cursor = "crosshair";
  } else {
    document.removeEventListener("mouseover", handleHover);
    document.removeEventListener("click", handleClick);
    document.body.style.cursor = "";
    removeHighlight();
    isInspecting = false;
  }
}

// 2. Highlight element on hover
function handleHover(e) {
  e.stopPropagation();
  e.preventDefault();

  if (activeElement === e.target) return;

  if (activeElement) removeHighlight();

  activeElement = e.target;
  activeElement.classList.add("ui-heist-highlight");
}

function removeHighlight() {
  if (activeElement) {
    activeElement.classList.remove("ui-heist-highlight");
    activeElement = null;
  }
}

// 3. Handle Click & Extract
function handleClick(e) {
  if (!isInspecting) return;

  e.preventDefault();
  e.stopPropagation();

  const el = e.target;

  // Recursively Capture Data
  // We need to ensure we don't capture the highlight class
  // Although captureDOM reads computed styles, the highlight class mainly adds outline.
  // Outline is not in our whitelist, so it's safe.
  // However, cursor: crosshair might be picked up?
  // 'cursor' is not in RELEVANT_STYLE_PROPS.

  const nodeTree = captureDOM(el);

  // Generate Code using Utils
  const jsxCode = Utils.generateComponentCode(nodeTree);

  // Save to storage
  chrome.storage.local.set({ capturedCode: jsxCode }, () => {
    console.log("UI Heist: Asset captured and saved.");
  });

  // Turn off inspector
  toggleOverlay(false);
  removeHighlight();
}

/**
 * Recursively captures the DOM structure and computed styles.
 * Returns a tree object.
 */
function captureDOM(el) {
  // Handle Text Nodes
  if (el.nodeType === Node.TEXT_NODE) {
    // Only return text nodes that have content
    if (el.textContent.trim().length > 0) {
      return {
        type: 'text',
        content: el.textContent
      };
    }
    return null;
  }

  // Handle Elements
  if (el.nodeType === Node.ELEMENT_NODE) {
    // Skip script, style, noscript tags
    const tagName = el.tagName.toLowerCase();
    if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
      return null;
    }

    const computed = window.getComputedStyle(el);
    let styleObj = {};

    Utils.RELEVANT_STYLE_PROPS.forEach(prop => {
      const value = computed.getPropertyValue(prop);
      if (Utils.filterStyleValue(value)) {
        styleObj[Utils.kebabToCamel(prop)] = value;
      }
    });

    const nodeData = {
      type: 'element',
      tagName: tagName,
      style: styleObj,
      children: []
    };

    // Recursively process children
    el.childNodes.forEach(child => {
      const childData = captureDOM(child);
      if (childData) {
        nodeData.children.push(childData);
      }
    });

    return nodeData;
  }

  return null;
}
