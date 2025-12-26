const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const MEDUSA_SERVER_PATH = path.join(process.cwd(), '.medusa', 'server');

// Check if .medusa/server exists - if not, build process failed
if (!fs.existsSync(MEDUSA_SERVER_PATH)) {
  throw new Error('.medusa/server directory not found. This indicates the Medusa build process failed. Please check for build errors.');
}

// Copy package-lock.json if it exists (for npm)
const packageLockPath = path.join(process.cwd(), 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  fs.copyFileSync(
    packageLockPath,
    path.join(MEDUSA_SERVER_PATH, 'package-lock.json')
  );
}

// Copy pnpm-lock.yaml if it exists (for pnpm)
const pnpmLockPath = path.join(process.cwd(), 'pnpm-lock.yaml');
if (fs.existsSync(pnpmLockPath)) {
  fs.copyFileSync(
    pnpmLockPath,
    path.join(MEDUSA_SERVER_PATH, 'pnpm-lock.yaml')
  );
}

// Copy .env if it exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  fs.copyFileSync(
    envPath,
    path.join(MEDUSA_SERVER_PATH, '.env')
  );
}

// Detect package manager and install dependencies
console.log('Installing dependencies in .medusa/server...');

// Check which package manager is available
function getPackageManager() {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      return 'yarn';
    } catch {
      return 'npm';
    }
  }
}

const pm = getPackageManager();
console.log(`Using package manager: ${pm}`);

// Use --legacy-peer-deps for npm to avoid peer dependency conflicts
const commands = {
  pnpm: 'pnpm i --prod',
  yarn: 'yarn install --production',
  npm: 'npm install --omit=dev --legacy-peer-deps'
};

try {
  execSync(commands[pm], {
    cwd: MEDUSA_SERVER_PATH,
    stdio: 'inherit'
  });
  console.log('Post-build completed successfully!');
} catch (error) {
  console.error('Warning: Post-build dependency installation had issues, but continuing...');
  // Don't fail the build for post-build issues
  process.exit(0);
}
