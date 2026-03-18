#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = __dirname;
const INPUT = path.join(ROOT, 'markup-tool.js');
const OUTPUT = path.join(ROOT, 'bookmarklet.txt');
const INSTALL_TEMPLATE = path.join(ROOT, 'install-template.html');
const INSTALL_PAGE = path.join(ROOT, 'install.html');

async function build() {
  console.log('Building bookmarklet...');

  const source = fs.readFileSync(INPUT, 'utf8');

  // Minify with terser
  const result = await minify(source, {
    compress: {
      passes: 2,
      drop_console: false,
    },
    mangle: true,
    output: {
      ascii_only: true,
    },
  });

  if (result.error) {
    console.error('Terser error:', result.error);
    process.exit(1);
  }

  const minified = result.code;

  // Validate minified JS syntax before encoding
  try {
    new Function(minified);
    console.log('Minified JS syntax: VALID');
  } catch (e) {
    console.error('Minified JS syntax: INVALID —', e.message);
    process.exit(1);
  }

  // Use base64 encoding — bulletproof, no URI encoding issues
  const b64 = Buffer.from(minified).toString('base64');
  const bookmarklet = "javascript:void(eval(atob('" + b64 + "')))";

  // Write raw bookmarklet
  fs.writeFileSync(OUTPUT, bookmarklet, 'utf8');
  console.log(`Bookmarklet written to: ${OUTPUT}`);
  console.log(`Size: ${bookmarklet.length} chars`);

  // Validate round-trip: decode base64 and syntax-check
  try {
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    new Function(decoded);
    console.log('Round-trip syntax check: PASSED');
  } catch (e) {
    console.error('Round-trip syntax check: FAILED —', e.message);
    process.exit(1);
  }

  // Generate install page
  const template = fs.readFileSync(INSTALL_TEMPLATE, 'utf8');
  // bookmarklet only contains javascript:void(eval(atob('...'))) — safe chars only
  const installHtml = template.replace(
    '"__BOOKMARKLET_PLACEHOLDER__"',
    '"' + bookmarklet + '"'
  );
  fs.writeFileSync(INSTALL_PAGE, installHtml, 'utf8');
  console.log(`Install page written to: ${INSTALL_PAGE}`);

  console.log('\nDone! Open install.html in a browser and drag the bookmarklet to your bookmarks bar.');
}

build().catch(e => {
  console.error(e);
  process.exit(1);
});
