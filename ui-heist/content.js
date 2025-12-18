// content.js
let activeElement = null;
let isInspecting = false;

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

  // Extract Data
  const stylesObj = getRelevantStyles(el);
  const jsxCode = generateReactComponent(el, stylesObj);

  // Save to storage
  chrome.storage.local.set({ capturedCode: jsxCode }, () => {
    console.log("UI Heist: Asset captured and saved.");
  });

  // Turn off inspector
  toggleOverlay(false);
  removeHighlight();
}

function getRelevantStyles(el) {
  const computed = window.getComputedStyle(el);
  const relevantProps = [
    "color", "background-color", "font-family", "font-size", "font-weight",
    "border", "border-radius", "padding", "margin", "display",
    "flex-direction", "justify-content", "align-items", "gap",
    "box-shadow", "width", "height", "line-height"
  ];

  let styleObj = {};
  relevantProps.forEach(prop => {
    const value = computed.getPropertyValue(prop);
    // Only add if it's not a default/empty value
    if (value && value !== "0px" && value !== "none" && value !== "auto" && value !== "normal" && value !== "rgba(0, 0, 0, 0)") {
      // Convert prop to camelCase
      const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      styleObj[camelProp] = value;
    }
  });

  return styleObj;
}

function generateReactComponent(el, stylesObj) {
  // Clone the element to manipulate it without affecting the page
  const clone = el.cloneNode(true);

  // Remove the highlight class from the clone if it was copied (though we usually remove it before capturing,
  // but capture happens on click where the class is likely still present on the live element)
  clone.classList.remove("ui-heist-highlight");

  // Get outerHTML
  let html = clone.outerHTML;

  // Basic JSX cleanup
  // Replace class= with className=
  html = html.replace(/\sclass=/g, ' className=');
  // Replace for= with htmlFor=
  html = html.replace(/\sfor=/g, ' htmlFor=');
  // Close self-closing tags that might not be closed in HTML (like <input>, <img>, <br>)
  // HTML serializers usually output standard HTML. JSX requires self-closing tags to end with />
  // This is a complex regex task, but for MVP we can try a simple pass for common void elements
  const voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];
  voidElements.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b([^>]*)(?<!\/)>`, 'gi');
    html = html.replace(regex, `<${tag}$1 />`);
  });

  // Create the style string
  const styleString = JSON.stringify(stylesObj, null, 2);

  // Inject style prop into the first tag
  // Find the position of the first space or >
  const firstTagEnd = html.indexOf('>');
  const firstSpace = html.indexOf(' ');

  let insertPos = -1;
  if (firstSpace > 0 && firstSpace < firstTagEnd) {
    insertPos = firstSpace;
  } else {
    insertPos = firstTagEnd;
  }

  const prefix = html.substring(0, insertPos);
  const suffix = html.substring(insertPos);

  // If we want to be cleaner, we can remove the class/className from the root element
  // since we are applying inline styles that are computed (essentially "stealing" the look).
  // The user said: "Capture... output... clean React component".
  // Let's keep className if it exists but usually we want to isolate the component.
  // I'll leave className as converted above.

  const modifiedHtml = `${prefix} style={${styleString}}${suffix}`;

  return `const CapturedComponent = () => {
  return (
${indentLines(modifiedHtml, 4)}
  );
};

export default CapturedComponent;`;
}

function indentLines(str, spaces) {
  const indent = ' '.repeat(spaces);
  return str.split('\n').map(line => indent + line).join('\n');
}
