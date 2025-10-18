import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { registerRepositories } from './RepositoryAll';
import { ipcMain } from 'electron';
import { trouverEcriture } from './services/accountingService';

ipcMain.handle('ajouter-ecriture', (event, description: string, montant: number) => {
  const ecriture = trouverEcriture(description, montant);
  if (!ecriture) throw new Error('Opération inconnue ou non supportée');
  return ecriture;
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

const createWindow = async () => {
  // Résoudre un chemin preload correct en prod (dans .vite/build) et tolérer le chemin dev si nécessaire
  let resolvedPreload = path.join(__dirname, './preload.cjs');
  if (!fs.existsSync(resolvedPreload)) {
    // fallback vers l'ancien emplacement (utile selon le mode dev/watch)
    resolvedPreload = path.join(__dirname, '../preload/preload.cjs');
  }

  const browserWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      preload: resolvedPreload,
      sandbox: false,
      contextIsolation: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await browserWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await browserWindow.loadFile(
      path.join(__dirname, '../renderer', MAIN_WINDOW_VITE_NAME, 'index.html'),
    );
  }
};

app.whenReady().then(() => {
  registerRepositories();
  return createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
