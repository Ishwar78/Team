let token = localStorage.getItem("auth_token");
let deviceId = localStorage.getItem("device_id");
let isTracking = false;

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
const themeToggle = document.getElementById("themeToggle");
const activityStatus = document.getElementById("activityStatus");
const screenshotIndicator = document.getElementById("screenshotIndicator");

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
      body: JSON.stringify({
        email,
        password,
        device_id: deviceId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("Login failed", "error");
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Login";
      return;
    }

    token = data.token;
    localStorage.setItem("auth_token", token);

    loginBtn.innerHTML = "✔ Logged In";
    loginBtn.style.background = "#28c76f";

    startBtn.disabled = false;
    setStatus("Login successful ✔", "success");

  } catch {
    setStatus("Server error", "error");
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
  setStatus("Tracking started 🚀", "active");

  startTimer();
};

/* ================= STOP SESSION ================= */

stopBtn.onclick = () => {
  window.agentAPI.endSession();

  isTracking = false;
  stopBtn.disabled = true;
  startBtn.disabled = false;

  dot.classList.remove("active");
  liveIndicator.lastChild.textContent = " Not Tracking";
  setStatus("Tracking stopped ⏹", "error");

  stopTimer();
};

/* ================= IDLE DETECTION ================= */

let idleTimer;
function resetIdle() {
  clearTimeout(idleTimer);
  activityStatus.classList.remove("idle");
  activityStatus.innerText = "Active";

  idleTimer = setTimeout(() => {
    activityStatus.classList.add("idle");
    activityStatus.innerText = "Idle";

    if (isTracking) {
      setStatus("Idle detected ⚠", "error");
    }
  }, 60000); // 1 min idle
}

window.onmousemove = resetIdle;
window.onkeypress = resetIdle;
resetIdle();

/* ================= THEME TOGGLE ================= */

themeToggle.onclick = () => {
  document.body.classList.toggle("light");
};

/* ================= SCREENSHOT INDICATOR ================= */
/* (Call this from preload when screenshot happens) */

window.showScreenshotFlash = () => {
  screenshotIndicator.classList.add("show");
  setTimeout(() => {
    screenshotIndicator.classList.remove("show");
  }, 2000);
};
