const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('agentAPI', {
  startSession: (data) => ipcRenderer.send('start-session', data),
  endSession: () => ipcRenderer.send('end-session'),

  sendActivityState: (data) => ipcRenderer.send('activity-state', data)
});
