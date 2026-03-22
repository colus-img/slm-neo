import * as esbuild from 'npm:esbuild@0.20.1';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import fs from 'node:fs';

const gzipAsync = promisify(gzip);

import path from 'node:path';

const browserRequirePlugin = {
  name: 'browser-require',
  setup(build) {
    build.onResolve({ filter: /custom_require\.js$/ }, args => {
      return { path: path.resolve(args.resolveDir, 'custom_require_browser.js') }
    })
  }
};

async function buildPlatform(entry, outfile, globalName) {
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile: outfile,
    format: 'iife',
    globalName: globalName,
    platform: 'browser',
    target: ['es2015'],
    plugins: [browserRequirePlugin]
  });
  
  const minOutfile = outfile.replace('.js', '.min.js');
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile: minOutfile,
    format: 'iife',
    globalName: globalName,
    platform: 'browser',
    target: ['es2015'],
    minify: true,
    mangleProps: /_[\w]+/,
    reserveProps: /^__/,
    plugins: [browserRequirePlugin]
  });

  const content = fs.readFileSync(minOutfile);
  const zipped = await gzipAsync(content);
  fs.writeFileSync(minOutfile + '.gz', zipped);
  
  console.log(`Built ${outfile}, ${minOutfile}, and ${minOutfile}.gz`);
}

async function main() {
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  await buildPlatform('lib/slm_browser.js', 'dist/slm-browser.js', 'Slm');
  await buildPlatform('lib/vm_browser.js', 'dist/slm-vm-browser.js', 'SlmVM');
  
  esbuild.stop();
}

main().catch(e => {
  console.error(e.errors || e);
  process.exit(1);
});
