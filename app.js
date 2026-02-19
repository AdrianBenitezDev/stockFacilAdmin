import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const ADMIN_EMAIL = "artbenitezdev@gmail.com";

const firebaseConfig = {
  apiKey: "AIzaSyDyYK9NtitNWkIiK-UIPUKCZ3PwJ1a10t0",
  authDomain: "kiosco-stock-493c6.firebaseapp.com",
  projectId: "kiosco-stock-493c6",
  storageBucket: "kiosco-stock-493c6.firebasestorage.app",
  messagingSenderId: "997147264141",
  appId: "1:997147264141:web:be41c9744767e474750ec4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const loginPanel = document.getElementById("admin-login-panel");
const dashboardPanel = document.getElementById("admin-dashboard-panel");
const feedbackNode = document.getElementById("admin-feedback");
const loginBtn = document.getElementById("admin-login-btn");
const logoutBtn = document.getElementById("admin-logout-btn");
const refreshBtn = document.getElementById("admin-refresh-btn");
const generatedAtNode = document.getElementById("admin-generated-at");
const tableBody = document.getElementById("admin-users-table-body");
const metricTotalUsers = document.getElementById("metric-total-users");
const metricTotalEmployees = document.getElementById("metric-total-employees");
const metricTotalProducts = document.getElementById("metric-total-products");

init().catch((error) => {
  console.error(error);
  setFeedback("No se pudo iniciar el panel.");
});

async function init() {
  await setPersistence(auth, browserLocalPersistence);

  loginBtn?.addEventListener("click", handleLogin);
  logoutBtn?.addEventListener("click", handleLogout);
  refreshBtn?.addEventListener("click", handleRefresh);

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      showLoggedOutState();
      return;
    }
    const email = String(user.email || "").trim().toLowerCase();
    if (email !== ADMIN_EMAIL) {
      await signOut(auth);
      setFeedback("Esta cuenta no tiene permisos de administrador.");
      showLoggedOutState();
      return;
    }

    await loadOverview();
  });
}

async function handleLogin() {
  setFeedback("");
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error(error);
    setFeedback("No se pudo iniciar sesion con Google.");
  }
}

async function handleLogout() {
  await signOut(auth);
  showLoggedOutState();
}

async function handleRefresh() {
  await loadOverview();
}

async function loadOverview() {
  const user = auth.currentUser;
  if (!user) {
    showLoggedOutState();
    return;
  }

  setFeedback("");
  toggleActionButtons(true);
  setTableLoading();
  try {
    const token = await user.getIdToken(true);
    const response = await fetch(getAdminOverviewEndpoint(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudieron cargar datos.");
    }

    renderOverview(result);
    showLoggedInState();
  } catch (error) {
    console.error(error);
    setFeedback(error.message || "No se pudo cargar el resumen.");
    setTableError(error.message || "No se pudo cargar el resumen.");
    showLoggedInState();
  } finally {
    toggleActionButtons(false);
  }
}

function renderOverview(payload) {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  generatedAtNode.textContent = payload?.generatedAt
    ? `Ultima actualizacion: ${formatDate(payload.generatedAt)}`
    : "";

  metricTotalUsers.textContent = String(rows.length);
  metricTotalEmployees.textContent = String(
    rows.reduce((acc, row) => acc + Number(row?.cantidadEmpleados || 0), 0)
  );
  metricTotalProducts.textContent = String(
    rows.reduce((acc, row) => acc + Number(row?.cantidadProductos || 0), 0)
  );

  if (!rows.length) {
    tableBody.innerHTML = '<tr><td colspan="9">No hay usuarios para mostrar.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows
    .map((row) => {
      return [
        "<tr>",
        `<td>${escapeHtml(row.nombre || "-")}</td>`,
        `<td>${escapeHtml(row.email || "-")}</td>`,
        `<td>${escapeHtml(row.telefono || "-")}</td>`,
        `<td>${escapeHtml(row.planActual || "-")}</td>`,
        `<td>${escapeHtml(formatDate(row.ultimoAcceso))}</td>`,
        `<td>${escapeHtml(formatDate(row.fechaCreacion))}</td>`,
        `<td>${escapeHtml(formatDate(row.fechaPago))}</td>`,
        `<td>${Number(row.cantidadEmpleados || 0)}</td>`,
        `<td>${Number(row.cantidadProductos || 0)}</td>`,
        "</tr>"
      ].join("");
    })
    .join("");
}

function getAdminOverviewEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminGetUsersOverview`;
}

function showLoggedOutState() {
  loginPanel.classList.remove("hidden");
  dashboardPanel.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  refreshBtn.classList.add("hidden");
}

function showLoggedInState() {
  loginPanel.classList.add("hidden");
  dashboardPanel.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  refreshBtn.classList.remove("hidden");
}

function setFeedback(message) {
  feedbackNode.textContent = String(message || "");
}

function setTableLoading() {
  tableBody.innerHTML = '<tr><td colspan="9">Cargando...</td></tr>';
}

function setTableError(message) {
  tableBody.innerHTML = `<tr><td colspan="9">${escapeHtml(String(message || "Error al cargar datos."))}</td></tr>`;
}

function toggleActionButtons(loading) {
  if (refreshBtn) refreshBtn.disabled = loading;
  if (logoutBtn) logoutBtn.disabled = loading;
  if (loginBtn) loginBtn.disabled = loading;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-AR");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

