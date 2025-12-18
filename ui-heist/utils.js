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

  // Indent lines helper
  function indentLines(str, spaces) {
    const indent = ' '.repeat(spaces);
    return str.split('\n').map(line => indent + line).join('\n');
  }

  // Generates JSX string from a node tree
  function generateJSX(node) {
    // Handle text nodes
    if (node.type === 'text') {
      const text = node.content ? node.content.trim() : '';
      return text ? text : '';
    }

    const tagName = node.tagName.toLowerCase();

    // Convert style object to string
    const styleString = JSON.stringify(node.style, null, 2);

    // Props string (style + any other attributes if we decide to keep them)
    // For now, only style is "heisted".
    let props = "";
    if (Object.keys(node.style).length > 0) {
      // If style object is multiline, we want it to look nice
      // But JSON.stringify gives "{\n  ... \n}". We need to fit it into `style={...}`.
      // Let's remove the outer braces of the JSON and re-wrap if needed?
      // Actually `style={...}` expects an object. In JSX text it looks like `style={{ color: 'red' }}`.
      props = ` style={${styleString}}`;
    }

    const childrenJSX = node.children.map(child => generateJSX(child)).join('');

    // Self closing?
    const voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];
    if (voidElements.includes(tagName) && !childrenJSX) {
      return `<${tagName}${props} />`;
    }

    return `<${tagName}${props}>${childrenJSX}</${tagName}>`;
  }

  // Wrapper to generate the full component string
  function generateComponentCode(rootNode) {
    const jsx = generateJSX(rootNode);
    // Beautify? For now just simple indentation might be hard on a recursive string.
    // Let's just wrap it.

    return `const CapturedComponent = () => {
  return (
    <>
${indentLines(jsx, 6)}
    </>
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
