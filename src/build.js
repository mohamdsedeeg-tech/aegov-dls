const fs = require('fs-extra');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('@tailwindcss/postcss');
const postcssImport = require('postcss-import');
const postcssGlobImport = require('postcss-import-ext-glob');
const postcssJs = require('postcss-js');
const chokidar = require('chokidar');

const entryFile = 'plugin.css';
const distFile = 'plugin.js';
const OUR_LAYERS = ['aegov-base', 'aegov-components', 'aegov-utilities'];

// Since build.js is now in src, we need to adjust the paths
const projectRoot = path.join(__dirname, '..');

async function compile() {
  try {
    const srcPath = path.join(__dirname, entryFile);
    const css = await fs.readFile(srcPath, 'utf8');

    const plugins = [ postcssGlobImport(), postcssImport(), tailwindcss ];
    const fullResult = await postcss(plugins).process(css, { from: srcPath });

    const cleanRoot = postcss.root();
    fullResult.root.walkAtRules('layer', (layerRule) => {
      if (OUR_LAYERS.includes(layerRule.params)) {
        cleanRoot.append(layerRule.clone());
      }
    });

    const jsObject = postcssJs.objectify(cleanRoot);
    const distPath = path.join(projectRoot, 'dist', distFile);
    const fileContent = `module.exports = ${JSON.stringify(jsObject, null, 2)};`;

    await fs.ensureDir(path.join(projectRoot, 'dist'));
    await fs.writeFile(distPath, fileContent);
    console.log(`✅ Compiled ${entryFile} to ${distFile}`);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    console.error(`❌ Error compiling:`, error);
  }
}

compile();

if (process.argv.includes('--watch')) {
  console.log('\n👀 Watching for all CSS changes in src/...');
  // chokidar paths are relative to the CWD, which is the project root
  const watcher = chokidar.watch('./src/**/*.css', { persistent: true });
  watcher.on('all', () => compile());
}
