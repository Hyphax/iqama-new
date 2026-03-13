const path = require('node:path');
const fs = require('node:fs');

const VIRTUAL_ROOT = path.resolve(__dirname, '..', '.virtual-modules');
const VIRTUAL_ROOT_UNRESOLVED = path.resolve(VIRTUAL_ROOT, 'unresolved');

// Pre-create directory
fs.mkdirSync(VIRTUAL_ROOT_UNRESOLVED, { recursive: true });

// Pre-create a default empty stub
const defaultStubPath = path.join(VIRTUAL_ROOT_UNRESOLVED, '_empty.js');
if (!fs.existsSync(defaultStubPath)) {
  fs.writeFileSync(defaultStubPath, 'module.exports = {};');
}

function handleResolveRequestError({ error, context, platform, moduleName }) {
  // Sanitize module name for filesystem
  const safeName = moduleName.replace(/[^a-zA-Z0-9._-]/g, '_') + '.js';
  const stubFile = path.join(VIRTUAL_ROOT_UNRESOLVED, safeName);

  try {
    if (!fs.existsSync(stubFile)) {
      fs.writeFileSync(stubFile, 'module.exports = {};');
    }
    return {
      type: 'sourceFile',
      filePath: stubFile,
    };
  } catch (e) {
    // Fallback to the pre-created default stub
    return {
      type: 'sourceFile',
      filePath: defaultStubPath,
    };
  }
}

module.exports = {
  handleResolveRequestError,
  VIRTUAL_ROOT,
  VIRTUAL_ROOT_UNRESOLVED,
};
