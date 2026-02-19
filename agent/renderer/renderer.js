let token = localStorage.getItem("auth_token");
let deviceId = localStorage.getItem("device_id");
let isTracking = false;

let lastActivityTime = Date.now();
let isIdle = false;
const IDLE_LIMIT = 60000; // 1 min

if (!deviceId) {
  deviceId = crypto.randomUUID();
  localStorage.setItem("device_id", deviceId);
}

const loginBtn = document.getElementById("loginBtn");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusText = document.getElementById("statusText");
const timerDisplay = document.getElementById("sessionTimer");
const liveIndicator = document.getElementById("liveIndicator");
const dot = document.querySelector(".dot");
const deviceText = document.getElementById("deviceText");
const activityStatus = document.getElementById("activityStatus");

deviceText.innerText = deviceId;

/* ================= STATUS ================= */

function setStatus(text, type = "info") {
  statusText.innerText = text;

  const colors = {
    info: "#ffffff",
    success: "#28c76f",
    error: "#ea5455",
    active: "#00f5d4"
  };

  statusText.style.color = colors[type] || "#ffffff";
}

/* ================= TIMER ================= */

let seconds = 0;
let timerInterval = null;

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;

    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");

    timerDisplay.innerText = `${hrs}:${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  timerDisplay.innerText = "00:00:00";
}

/* ================= IDLE TRACKING ================= */

function markActivity() {
  lastActivityTime = Date.now();

  if (isIdle) {
    isIdle = false;
    activityStatus.classList.remove("idle");
    activityStatus.innerText = "Active";
    setStatus("User Active ✔", "success");
  }
}

window.addEventListener("mousemove", markActivity);
window.addEventListener("keydown", markActivity);

setInterval(() => {
  if (!isTracking) return;

  const now = Date.now();
  if (now - lastActivityTime > IDLE_LIMIT) {
    if (!isIdle) {
      isIdle = true;
      activityStatus.classList.add("idle");
      activityStatus.innerText = "Idle";
      setStatus("Idle detected ⚠", "error");
    }
  }
}, 5000);

/* ================= AUTO LOGIN ================= */

if (token) {
  loginBtn.innerHTML = "✔ Logged In";
  loginBtn.style.background = "#28c76f";
  startBtn.disabled = false;
  setStatus("Session Restored ✔", "success");
}

/* ================= LOGIN ================= */

loginBtn.onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    setStatus("Enter email & password", "error");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.innerHTML = "⏳ Authenticating...";

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, device_id: deviceId })
    });

    const data = await res.json();

    if (!res.ok) throw new Error();

    token = data.token;
    localStorage.setItem("auth_token", token);

    loginBtn.innerHTML = "✔ Logged In";
    loginBtn.style.background = "#28c76f";
    startBtn.disabled = false;

    setStatus("Login successful ✔", "success");
  } catch {
    setStatus("Login failed", "error");
    loginBtn.disabled = false;
    loginBtn.innerHTML = "Login";
  }
};

/* ================= START SESSION ================= */

startBtn.onclick = () => {
  window.agentAPI.startSession({ token, deviceId });

  isTracking = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;

  dot.classList.add("active");
  liveIndicator.lastChild.textContent = " Tracking Active";

  startTimer();
  setStatus("Tracking started 🚀", "active");
};

/* ================= STOP SESSION ================= */

stopBtn.onclick = () => {
  window.agentAPI.endSession();

  isTracking = false;
  stopBtn.disabled = true;
  startBtn.disabled = false;

  dot.classList.remove("active");
  liveIndicator.lastChild.textContent = " Not Tracking";

  stopTimer();
  setStatus("Tracking stopped ⏹", "error");
};

/* ================= SEND ACTIVITY TO MAIN PROCESS ================= */

setInterval(() => {
  if (!isTracking || !token) return;

  window.agentAPI.sendActivity({
    status: isIdle ? "idle" : "active",
    activity_score: isIdle ? 0 : 100
  });

}, 15000); // every 15 sec
setInterval(() => {
  if (!isTracking) return;

  window.agentAPI.sendActivityState({
    idle: isIdle,
    activity_score: isIdle ? 0 : 100
  });

}, 5000);
