const { app, BrowserWindow, dialog, Menu, net, protocol, session, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { ORIGIN, isGameURL, contentPath, externalURL } = require('./content.cjs');

protocol.registerSchemesAsPrivileged([{
  scheme: 'escape1829',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true },
}]);

// No local server, remote website, preload bridge or Node API in game pages.
const contentSecurityPolicy = [
  "default-src 'none'", "script-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.whateversleft.co.uk https://basedinchurton.co.uk",
  "connect-src 'self'", "font-src 'self' data:",
  "media-src 'self' blob:", "worker-src 'self' blob:", "base-uri 'self'", "form-action 'none'",
].join('; ');

let mainWindow;
const locationChoices = new Map();

async function openExternal(value) {
  const url = externalURL(value);
  if (url) await shell.openExternal(url);
}

function createWindow() {
  const win = new BrowserWindow({
    title: 'Escape from 1829', width: 1280, height: 900, minWidth: 800, minHeight: 600,
    backgroundColor: '#17251e', show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true },
  });
  mainWindow = win;
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    void openExternal(url).catch(console.error);
    return { action: 'deny' };
  });
  const guardNavigation = event => {
    const url = event.url;
    if (!isGameURL(url)) {
      event.preventDefault();
      void openExternal(url).catch(console.error);
    }
  };
  win.webContents.on('will-navigate', guardNavigation);
  win.webContents.on('will-redirect', guardNavigation);
  win.webContents.on('will-attach-webview', event => event.preventDefault());
  win.on('closed', () => { if (mainWindow === win) mainWindow = null; });
  return win.loadURL(ORIGIN + '/').catch(error => {
    // A user can choose another game mode before the intro finishes loading.
    // Chromium reports that superseded navigation as an abort, not a startup failure.
    if (error.code !== 'ERR_ABORTED' && error.errno !== -3) throw error;
  });
}

app.whenReady().then(async () => {
  const root = path.join(app.getAppPath(), 'web');
  protocol.handle('escape1829', async request => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
      const file = contentPath(root, request.url);
      const response = await net.fetch(pathToFileURL(file).href);
      const headers = new Headers(response.headers);
      if (/\.m?js$/i.test(file)) headers.set('Content-Type', 'text/javascript');
      if (/\.html$/i.test(file)) headers.set('Content-Security-Policy', contentSecurityPolicy);
      headers.set('X-Content-Type-Options', 'nosniff');
      return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers });
    } catch { return new Response('Not found', { status: 404 }); }
  });

  const trusted = (contents, origin) => Boolean(contents && isGameURL(contents.getURL()) && isGameURL(origin));
  session.defaultSession.setPermissionCheckHandler((contents, permission, origin) =>
    trusted(contents, origin) && (['pointerLock', 'fullscreen'].includes(permission) ||
      (permission === 'geolocation' && locationChoices.get(contents.id) === true)));
  session.defaultSession.setPermissionRequestHandler(async (contents, permission, callback, details) => {
    if (!trusted(contents, details.requestingUrl || contents?.getURL())) return callback(false);
    if (['pointerLock', 'fullscreen'].includes(permission)) return callback(true);
    if (permission !== 'geolocation' || !mainWindow) return callback(false);
    if (!locationChoices.has(contents.id)) {
      try {
        const { response } = await dialog.showMessageBox(mainWindow, {
          type: 'question', title: 'Use your location?',
          message: 'Show your position on the hospital grounds?',
          detail: 'Your device location is used only when you request it. Availability depends on Windows location services.',
          buttons: ['Not now', 'Allow for this session'], defaultId: 0, cancelId: 0,
        });
        locationChoices.set(contents.id, response === 1);
      } catch { return callback(false); }
    }
    callback(locationChoices.get(contents.id));
  });
  session.defaultSession.on('will-download', event => event.preventDefault());
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Game', submenu: [
      { label: 'Main menu', click: () => { void mainWindow?.loadURL(ORIGIN + '/'); } },
      { type: 'separator' }, { role: 'quit', label: 'Exit' },
    ] },
    { label: 'View', submenu: [{ role: 'togglefullscreen', accelerator: 'F11' }, { role: 'reload' }] },
  ]));
  await createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow(); });
}).catch(error => {
  console.error(error);
  dialog.showErrorBox('Escape from 1829 could not start', error.message);
  app.quit();
});
app.on('window-all-closed', () => app.quit());
