const { app, BrowserWindow, desktopCapturer, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const activeWin = require('active-win');

let mainWindow;
let trackingInterval = null;
let token = null;
let sessionId = null;

const API_BASE = "http://localhost:5000";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  mainWindow.loadFile('renderer/index.html');
}

app.whenReady().then(createWindow);

/* ================= ACTIVE WINDOW ================= */

async function getActiveWindow() {
  try {
    const win = await activeWin();
    return {
      title: win?.title || '',
      app: win?.owner?.name || ''
    };
  } catch {
    return { title: '', app: '' };
  }
}

/* ================= SCREENSHOT ================= */

async function captureScreenshot() {
  try {
    if (!token || !sessionId) return;

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1280, height: 720 }
    });

    if (!sources.length) return;

    const image = sources[0].thumbnail.toPNG();
    const windowInfo = await getActiveWindow();

    const form = new FormData();
    form.append('file', image, {
      filename: 'screenshot.png',
      contentType: 'image/png'
    });

    form.append('session_id', sessionId);
    form.append('timestamp', new Date().toISOString());
    form.append('resolution_width', 1280);
    form.append('resolution_height', 720);
    form.append('window_title', windowInfo.title);
    form.append('app_name', windowInfo.app);
    form.append('activity_score', 0);

    await axios.post(`${API_BASE}/api/agent/screenshots`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      }
    });

    console.log("Screenshot saved to MongoDB");

  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message);
  }
}

/* ================= START SESSION ================= */

ipcMain.on('start-session', async (event, data) => {
  try {
    token = data.token;

    const res = await axios.post(`${API_BASE}/api/sessions/start`, {
      device_id: data.deviceId,
      timestamp: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    sessionId = res.data.session_id;

    await captureScreenshot();

    trackingInterval = setInterval(() => {
      captureScreenshot();
    }, 5 * 60 * 1000);

  } catch (err) {
    console.error("Session start error:", err.response?.data || err.message);
  }
});

/* ================= END SESSION ================= */

ipcMain.on('end-session', async () => {
  try {
    if (!sessionId) return;

    clearInterval(trackingInterval);

    await axios.put(`${API_BASE}/api/sessions/${sessionId}/end`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    sessionId = null;
    token = null;

  } catch (err) {
    console.error("Session end error:", err.response?.data || err.message);
  }
});
