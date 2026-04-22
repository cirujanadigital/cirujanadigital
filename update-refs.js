// update-refs.js
const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  // ── index.html y páginas con media="print" ──
  [
    `href="/style-v2.css" media="print"  onload="this.media='all'"`,
    `href="/dist/style-v2.min.css" media="print" onload="this.media='all'"`
  ],
  [
    `href="/style-v2.css" media="print" onload="this.media='all'"`,
    `href="/dist/style-v2.min.css" media="print" onload="this.media='all'"`
  ],
  [
    `href="/components.css" media="print"  onload="this.media='all'"`,
    `href="/dist/components.min.css" media="print" onload="this.media='all'"`
  ],
  [
    `href="/components.css" media="print" onload="this.media='all'"`,
    `href="/dist/components.min.css" media="print" onload="this.media='all'"`
  ],
  // ── noscript media="print" ──
  [
    `href="/components.css">`,
    `href="/dist/components.min.css">`
  ],
  // ── páginas de servicios con preload ──
  [
    `<link
      rel="preload"
      href="/components.css"
      as="style"
      onload="
        this.onload = null;
        this.rel = 'stylesheet';
      "
    />
    <noscript>
      <link rel="stylesheet" href="/components.css" />
    </noscript>`,
    `<link
      rel="preload"
      href="/dist/components.min.css"
      as="style"
      onload="
        this.onload = null;
        this.rel = 'stylesheet';
      "
    />
    <noscript>
      <link rel="stylesheet" href="/dist/components.min.css" />
    </noscript>`
  ],
  // ── scripts ──
  [
    `src="/components.js" defer`,
    `src="/dist/components.min.js" defer`
  ],
  [
    `src="/script.js" defer`,
    `src="/dist/script.min.js" defer`
  ],
];

const HTML_EXTENSIONS = ['.html', '.htm'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [from, to] of REPLACEMENTS) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Actualizado:', filePath);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      walk(fullPath);
    } else if (entry.isFile() && HTML_EXTENSIONS.includes(path.extname(entry.name))) {
      processFile(fullPath);
    }
  }
}

walk('.');
console.log('\n✨ Listo. Revisá los archivos marcados con ✅.');
