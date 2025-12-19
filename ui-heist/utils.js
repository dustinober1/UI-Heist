(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory();
  } else {
    // Browser
    root.UIHeistUtils = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const RELEVANT_STYLE_PROPS = [
    "color", "background-color", "font-family", "font-size", "font-weight",
    "border", "border-radius", "padding", "margin", "display",
    "flex-direction", "justify-content", "align-items", "gap",
    "box-shadow", "width", "height", "line-height"
  ];

  function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  function filterStyleValue(value) {
    return (value && value !== "0px" && value !== "none" && value !== "auto" && value !== "normal" && value !== "rgba(0, 0, 0, 0)");
  }

  function escapeJSXText(text) {
    if (!text) return "";
    return text
      .replace(/{/g, "{'{'}")
      .replace(/}/g, "{'}'}")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Generates JSX string from a node tree
  function generateJSX(node, level = 0) {
    const indent = '  '.repeat(level);

    if (node.type === 'text') {
      const text = node.content ? node.content.trim() : '';
      if (!text) return null;
      return `${indent}${escapeJSXText(text)}`;
    }

    const tagName = node.tagName.toLowerCase();

    // Generate style prop
    let propsString = "";
    const styleEntries = Object.entries(node.style);
    if (styleEntries.length > 0) {
      const styleProps = styleEntries
        .map(([key, val]) => {
            // Ensure values are properly escaped strings
            const safeVal = val.replace(/"/g, '\"');
            return `${key}: "${safeVal}"`;
        })
        .join(', ');
      propsString = ` style={{ ${styleProps} }}`;
    }

    // Handle children
    if (!node.children || node.children.length === 0) {
      return `${indent}<${tagName}${propsString} />`;
    }

    // Optimization: If single text child, inline it
    if (node.children.length === 1 && node.children[0].type === 'text') {
      const textContent = node.children[0].content ? node.children[0].content.trim() : '';
      if (textContent) {
        return `${indent}<${tagName}${propsString}>${escapeJSXText(textContent)}</${tagName}>`;
      } else {
        return `${indent}<${tagName}${propsString} />`;
      }
    }

    // Process nested children
    const childrenJSX = node.children
      .map(child => generateJSX(child, level + 1))
      .filter(chunk => chunk !== null)
      .join('\n');

    return `${indent}<${tagName}${propsString}>
${childrenJSX}
${indent}</${tagName}>`;
  }

  // Wrapper to generate the full component string
  function generateComponentCode(rootNode) {
    // We start at level 2 so it sits nicely inside the component return
    const jsx = generateJSX(rootNode, 2);

    return `const CapturedComponent = () => {
  return (
${jsx}
  );
};

export default CapturedComponent;`;
  }

  return {
    RELEVANT_STYLE_PROPS,
    kebabToCamel,
    filterStyleValue,
    generateJSX,
    generateComponentCode
  };
}));