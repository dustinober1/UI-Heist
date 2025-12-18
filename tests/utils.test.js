const assert = require('node:assert');
const Utils = require('../ui-heist/utils.js');

console.log('Running Tests for UI Heist Utils...');

// Test 1: kebabToCamel
try {
  assert.strictEqual(Utils.kebabToCamel('background-color'), 'backgroundColor');
  assert.strictEqual(Utils.kebabToCamel('font-size'), 'fontSize');
  assert.strictEqual(Utils.kebabToCamel('display'), 'display');
  console.log('✅ kebabToCamel passed');
} catch (e) {
  console.error('❌ kebabToCamel failed', e);
  process.exit(1);
}

// Test 2: filterStyleValue
try {
  assert.strictEqual(Utils.filterStyleValue('10px'), true);
  assert.strictEqual(Utils.filterStyleValue('0px'), false);
  assert.strictEqual(Utils.filterStyleValue('none'), false);
  assert.strictEqual(Utils.filterStyleValue('auto'), false);
  assert.strictEqual(Utils.filterStyleValue('normal'), false);
  assert.strictEqual(Utils.filterStyleValue('rgba(0, 0, 0, 0)'), false);
  console.log('✅ filterStyleValue passed');
} catch (e) {
  console.error('❌ filterStyleValue failed', e);
  process.exit(1);
}

// Test 3: generateJSX (Single Element)
try {
  const node = {
    type: 'element',
    tagName: 'div',
    style: { color: 'red', display: 'flex' },
    children: []
  };
  const jsx = Utils.generateJSX(node);
  const expected = '<div style={{\n  "color": "red",\n  "display": "flex"\n}}></div>';
  // Note: JSON.stringify order is not guaranteed but usually insertion order.
  // We'll normalize whitespace for comparison if needed, but let's try strict first.

  // Actually, JSON.stringify returns "color": "red".
  // Let's assert it contains key parts.
  assert.ok(jsx.includes('<div style={{'));
  assert.ok(jsx.includes('"color": "red"'));
  assert.ok(jsx.includes('}}></div>'));
  console.log('✅ generateJSX (Single Element) passed');
} catch (e) {
  console.error('❌ generateJSX (Single Element) failed', e);
  console.error('Actual:', Utils.generateJSX({
    type: 'element',
    tagName: 'div',
    style: { color: 'red' },
    children: []
  }));
  process.exit(1);
}

// Test 4: generateJSX (Nested with Text)
try {
  const node = {
    type: 'element',
    tagName: 'button',
    style: { padding: '10px' },
    children: [
      {
        type: 'element',
        tagName: 'span',
        style: { fontWeight: 'bold' },
        children: [
          { type: 'text', content: 'Click Me' }
        ]
      }
    ]
  };

  const jsx = Utils.generateJSX(node);
  // Expected roughly: <button style={{...}}><span style={{...}}>Click Me</span></button>

  assert.ok(jsx.startsWith('<button'));
  assert.ok(jsx.includes('<span'));
  assert.ok(jsx.includes('Click Me'));
  assert.ok(jsx.includes('</span>'));
  assert.ok(jsx.includes('</button>'));
  assert.ok(jsx.includes('"padding": "10px"'));
  assert.ok(jsx.includes('"fontWeight": "bold"'));

  console.log('✅ generateJSX (Nested) passed');
} catch (e) {
  console.error('❌ generateJSX (Nested) failed', e);
  console.log(Utils.generateJSX(node));
  process.exit(1);
}

// Test 5: generateJSX (Void Element)
try {
  const node = {
    type: 'element',
    tagName: 'img',
    style: { width: '100px' },
    children: []
  };
  const jsx = Utils.generateJSX(node);
  assert.ok(jsx.includes('<img'));
  assert.ok(jsx.includes('/>'));
  assert.ok(!jsx.includes('</img>'));
  console.log('✅ generateJSX (Void Element) passed');
} catch (e) {
  console.error('❌ generateJSX (Void Element) failed', e);
  process.exit(1);
}

console.log('All tests passed!');
