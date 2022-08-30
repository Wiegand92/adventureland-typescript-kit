// Imports //
const chokidar = require('chokidar');
const path = require('path');
const rollup = require('rollup');
const loadConfigFile = require('rollup/loadConfigFile');

console.clear();
console.log('Watcher Initializing...');

// Global State //
let initialized = false;
let rollupWatcher: any;
const watcher = chokidar.watch(path.join(__dirname, './src/uploads'));

watcher.on('add', (file: any) => {
  if (initialized) {
    console.log(`${file} has been added!`);
    if (rollupWatcher) {
      rollupWatcher.close();
      startRollup();
    }
  }
});

watcher.on('ready', () => {
  console.log('Initial scan complete, waiting for changes...');
  initialized = true;
  startRollup();
});

watcher.on('change', (file: any) => {
  console.log(`${file} has been changed`);
});

function startRollup() {
  return loadConfigFile(path.resolve(__dirname, 'rollup.config.ts'), {
    configPlugin: 'typescript',
  }).then(async ({ options, warnings }: any) => {
    rollupWatcher = rollup.watch(options);
    rollupWatcher.on('event', ({ result }: any) => {
      if (result) {
        result.close();
      }
    });
  });
}
