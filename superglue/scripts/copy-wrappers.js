#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Copies wrapper files from npm/ to dist/
 * Similar to React's prepareNpmPackage process
 */
function copyWrappers() {
  const npmDir = path.join(__dirname, '..', 'npm');
  const distDir = path.join(__dirname, '..', 'dist');

  if (!fs.existsSync(distDir)) {
    console.error('Error: dist/ folder does not exist. Run build first.');
    process.exit(1);
  }

  // Read all files from npm/ directory
  const files = fs.readdirSync(npmDir);

  files.forEach((file) => {
    const srcPath = path.join(npmDir, file);
    const destPath = path.join(distDir, file);

    // Only copy files (not directories)
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: npm/${file} → dist/${file}`);
    }
  });

  console.log('✓ Wrapper files copied successfully');
}

copyWrappers();
