const path = require('node:path');

const ORIGIN = 'escape1829://game';
function isGameURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'escape1829:' && url.hostname === 'game' &&
      !url.port && !url.username && !url.password;
  } catch { return false; }
}

function contentPath(root, value) {
  if (!isGameURL(value)) throw new Error('Invalid game origin');
  const pathname = decodeURIComponent(new URL(value).pathname);
  if (/[\\:\x00]/.test(pathname) || pathname.split('/').some(part => part === '..' || /[. ]$/.test(part))) {
    throw new Error('Invalid asset path');
  }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(path.resolve(root) + path.sep)) throw new Error('Asset outside game');
  return file;
}

function externalURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

module.exports = { ORIGIN, isGameURL, contentPath, externalURL };
