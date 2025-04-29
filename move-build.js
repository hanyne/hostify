const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'frontend', 'build');
const destination = path.join(__dirname, 'build');

if (fs.existsSync(source)) {
  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true, force: true });
  }
  fs.renameSync(source, destination);
  console.log('Moved build folder to root');
} else {
  console.error('Error: frontend/build folder not found');
  process.exit(1);
}
