const fs = require('fs-extra');
const path = require('path');
const { minify } = require('html-minifier-terser');

const srcDir = path.join(__dirname, 'public');
const outDir = path.join(__dirname, 'dist');

async function minifyHtmlFile(filePath, destPath) {
  const content = await fs.readFile(filePath, 'utf8');
  const min = await minify(content, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    keepClosingSlash: true
  });
  await fs.outputFile(destPath, min, 'utf8');
}

async function build() {
  await fs.remove(outDir);
  await fs.copy(srcDir, outDir);

  // Minify HTML files
  const files = await fs.readdir(outDir);
  for (const file of files) {
    const full = path.join(outDir, file);
    const stat = await fs.stat(full);
    if (stat.isFile() && file.endsWith('.html')) {
      await minifyHtmlFile(full, full);
    }
    // For nested folders, do a quick recursive minify
    if (stat.isDirectory()) {
      const walk = async (dir) => {
        const entries = await fs.readdir(dir);
        for (const e of entries) {
          const p = path.join(dir, e);
          const s = await fs.stat(p);
          if (s.isFile() && e.endsWith('.html')) await minifyHtmlFile(p, p);
          if (s.isDirectory()) await walk(p);
        }
      };
      await walk(full);
    }
  }

  console.log('Build complete — output in dist/');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
