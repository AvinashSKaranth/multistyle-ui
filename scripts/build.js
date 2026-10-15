import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, statSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';

const watch = process.argv.includes('--watch');
execFileSync(process.execPath, ['scripts/gen-themes.js'], { stdio: 'inherit' });

const common = { bundle: true, minify: true, logLevel: 'warning' };
const vendor = [
  ['node_modules/alpinejs/dist/cdn.min.js', 'docs/vendor/alpine.min.js'],
  ['node_modules/chart.js/dist/chart.umd.min.js', 'docs/vendor/chart.umd.min.js'],
];
mkdirSync('docs/vendor', { recursive: true });
for (const [a, b] of vendor) copyFileSync(a, b);

// Each bundle copies/reports only its own output: touching the other bundle's
// file while esbuild writes it races (EBUSY on Windows).
const onEnd = (f) => ({
  name: 'copy',
  setup: (b) => b.onEnd((r) => {
    if (r.errors.length) return;
    copyFileSync(f, f.replace('dist/', 'docs/'));
    console.log(`${f}: ${(statSync(f).size / 1024).toFixed(1)} KB min, ${(gzipSync(readFileSync(f)).length / 1024).toFixed(1)} KB gzip`);
  }),
});

const css = { ...common, entryPoints: ['src/css/index.css'], outfile: 'dist/multistyle.min.css', plugins: [onEnd('dist/multistyle.min.css')] };
const js = { ...common, entryPoints: ['src/js/index.js'], outfile: 'dist/multistyle.min.js', format: 'iife', target: 'es2022', plugins: [onEnd('dist/multistyle.min.js')] };

if (watch) {
  const [c, j] = await Promise.all([esbuild.context(css), esbuild.context(js)]);
  await Promise.all([c.watch(), j.watch()]);
  const { port } = await c.serve({ servedir: 'docs' });
  console.log(`serving docs on http://localhost:${port}`);
} else {
  await Promise.all([esbuild.build(css), esbuild.build(js)]);
}
