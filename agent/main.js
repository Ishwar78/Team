const { app, BrowserWindow, desktopCapturer, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const activeWin = require('active-win');

let mainWindow;
let screenshotInterval = null;
let activityInterval = null;
let token = null;
let sessionId = null;

let currentIdle = false;              // 🔥 NEW
let currentActivityScore = 100;       // 🔥 NEW

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

/* ================= RECEIVE IDLE STATE FROM RENDERER ================= */

ipcMain.on('activity-state', (event, data) => {
  currentIdle = data.idle;
  currentActivityScore = data.activity_score;
});

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

/* ================= ACTIVITY ================= */

async function sendActivityLog() {
  if (!token || !sessionId) return;

  try {
    const windowInfo = await getActiveWindow();
    const now = new Date();
    const start = new Date(now.getTime() - 10000);

    await axios.post(`${API_BASE}/api/activity`, {
      session_id: sessionId,
      logs: [{
        timestamp: now.toISOString(),
        interval_start: start.toISOString(),
        interval_end: now.toISOString(),
        keyboard_events: 0,
        mouse_events: 0,
        mouse_distance: 0,

        // 🔥 UPDATED HERE
        activity_score: currentActivityScore,
        idle: currentIdle,

        active_window: {
          title: windowInfo.title,
          app_name: windowInfo.app,
          url: "",
          category: "Uncategorized"
        }
      }]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

  } catch (err) {
    console.error("Activity error:", err.response?.data || err.message);
  }
}

/* ================= SCREENSHOT ================= */

async function captureScreenshot() {
  if (!token || !sessionId) return;

  try {
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

    // 🔥 Now activity score matches idle state
    form.append('activity_score', currentActivityScore);

    await axios.post(`${API_BASE}/api/agent/screenshots`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      }
    });

    console.log("Screenshot uploaded");

  } catch (err) {
    console.error("Screenshot error:", err.response?.data || err.message);
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

    screenshotInterval = setInterval(captureScreenshot, 5 * 60 * 1000);
    activityInterval = setInterval(sendActivityLog, 10000);

  } catch (err) {
    console.error("Session start error:", err.response?.data || err.message);
  }
});

/* ================= END SESSION ================= */

ipcMain.on('end-session', async () => {
  try {
    if (!sessionId) return;

    clearInterval(screenshotInterval);
    clearInterval(activityInterval);

    await axios.put(`${API_BASE}/api/sessions/${sessionId}/end`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    sessionId = null;
    token = null;
    currentIdle = false;
    currentActivityScore = 100;

  } catch (err) {
    console.error("Session end error:", err.response?.data || err.message);
  }
});
