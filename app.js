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
const navUsersBtn = document.getElementById("admin-nav-users-btn");
const navProductsBtn = document.getElementById("admin-nav-products-btn");
const navPlansBtn = document.getElementById("admin-nav-plans-btn");
const usersSection = document.getElementById("admin-users-section");
const plansSection = document.getElementById("admin-plans-section");
const productsSection = document.getElementById("admin-products-section");
const usersSearchInput = document.getElementById("admin-users-search");
const globalLoadingNode = document.getElementById("admin-global-loading");
const generatedAtNode = document.getElementById("admin-generated-at");
const tableBody = document.getElementById("admin-users-table-body");
const userActionsPanel = document.getElementById("admin-user-actions-panel");
const selectedUserMeta = document.getElementById("admin-selected-user-meta");
const toggleUserStatusBtn = document.getElementById("admin-toggle-user-status-btn");
const openWhatsappBtn = document.getElementById("admin-open-whatsapp-btn");
const employeesTableBody = document.getElementById("admin-employees-table-body");
const metricTotalUsers = document.getElementById("metric-total-users");
const metricTotalEmployees = document.getElementById("metric-total-employees");
const metricTotalProducts = document.getElementById("metric-total-products");
const metricEstimatedRevenue = document.getElementById("metric-estimated-revenue");
const plansFeedbackNode = document.getElementById("admin-plans-feedback");
const planCardsNode = document.getElementById("admin-plan-cards");
const planForm = document.getElementById("admin-plan-form");
const planIdInput = document.getElementById("admin-plan-id");
const planTitleInput = document.getElementById("admin-plan-title");
const planPriceInput = document.getElementById("admin-plan-price");
const planDescriptionInput = document.getElementById("admin-plan-description");
const planFeaturesInput = document.getElementById("admin-plan-features");
const planMaxEmployeesInput = document.getElementById("admin-plan-max-employees");
const planOrderInput = document.getElementById("admin-plan-order");
const planActiveInput = document.getElementById("admin-plan-active");
const planSaveBtn = document.getElementById("admin-plan-save-btn");

let allUserRows = [];
let allPlans = [];
let selectedPlanId = "";
let activeSection = "users";
let selectedUserUid = "";
let selectedUserRow = null;
let selectedEmployees = [];
let pendingGlobalLoads = 0;

init().catch((error) => {
  console.error(error);
  setFeedback("No se pudo iniciar el panel.");
});

async function init() {
  await setPersistence(auth, browserLocalPersistence);

  loginBtn?.addEventListener("click", handleLogin);
  logoutBtn?.addEventListener("click", handleLogout);
  refreshBtn?.addEventListener("click", handleRefresh);
  navUsersBtn?.addEventListener("click", () => setActiveSection("users"));
  navPlansBtn?.addEventListener("click", () => setActiveSection("plans"));
  
  navProductsBtn?.addEventListener("click", () => setActiveSection("products"));
  
  usersSearchInput?.addEventListener("input", applyUsersFilter);
  tableBody?.addEventListener("click", handleUserRowClick);
  planCardsNode?.addEventListener("click", handlePlanCardClick);
  planForm?.addEventListener("submit", handlePlanSave);
  toggleUserStatusBtn?.addEventListener("click", handleToggleUserStatus);
  openWhatsappBtn?.addEventListener("click", openSelectedUserWhatsapp);
  employeesTableBody?.addEventListener("click", handleEmployeeToggleClick);

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

    showLoggedInState();
    await loadDashboardData();
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
  if (activeSection === "plans") {
    await loadPlans();
    return;
  }
  await loadOverview();
}

async function loadDashboardData() {
  await Promise.allSettled([loadOverview(), loadPlans()]);
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
    const response = await fetchWithLoading(getAdminOverviewEndpoint(), {
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
  } catch (error) {
    console.error(error);
    setFeedback(error.message || "No se pudo cargar el resumen.");
    setTableError(error.message || "No se pudo cargar el resumen.");
  } finally {
    toggleActionButtons(false);
  }
}

function renderOverview(payload) {
  allUserRows = Array.isArray(payload?.rows) ? payload.rows : [];
  if (selectedUserUid) {
    selectedUserRow =
      allUserRows.find((row) => String(row?.uid || "").trim() === selectedUserUid) || null;
    if (!selectedUserRow) {
      selectedUserUid = "";
      selectedEmployees = [];
      userActionsPanel?.classList.add("hidden");
      setEmployeesPlaceholder("Selecciona un usuario para ver sus empleados.");
    } else {
      renderSelectedUserActions();
    }
  }
  generatedAtNode.textContent = payload?.generatedAt
    ? `Ultima actualizacion: ${formatDate(payload.generatedAt)}`
    : "";

  metricTotalUsers.textContent = String(allUserRows.length);
  metricTotalEmployees.textContent = String(
    allUserRows.reduce((acc, row) => acc + Number(row?.cantidadEmpleados || 0), 0)
  );
  metricTotalProducts.textContent = String(
    allUserRows.reduce((acc, row) => acc + Number(row?.cantidadProductos || 0), 0)
  );
  updateEstimatedRevenueMetric();
  applyUsersFilter();
}

function applyUsersFilter() {
  const query = normalizeText(usersSearchInput?.value || "");
  const rows = !query
    ? allUserRows
    : allUserRows.filter((row) => {
        const searchBlob = [
          row?.nombre,
          row?.nombreNegocio,
          row?.email,
          row?.direccionNegocio
        ]
          .map((entry) => normalizeText(entry))
          .join(" ");
        return searchBlob.includes(query);
      });

  if (!rows.length) {
    tableBody.innerHTML = '<tr><td colspan="11">No hay usuarios para mostrar.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows
    .map((row) => {
      const isSelected = selectedUserUid && selectedUserUid === String(row?.uid || "").trim();
      const rowClass = isSelected ? ' class="is-selected"' : "";
      return [
        `<tr data-user-uid="${escapeHtml(String(row.uid || ""))}"${rowClass}>`,
        `<td>${escapeHtml(row.nombre || "-")}</td>`,
        `<td>${escapeHtml(row.email || "-")}</td>`,
        `<td>${escapeHtml(row.telefono || "-")}</td>`,
        `<td>${escapeHtml(row.nombreNegocio || "-")}</td>`,
        `<td>${escapeHtml((row.direccionNegocio || "-").slice(0, 10))}</td>`,
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

function handleUserRowClick(event) {
  const rowNode = event.target.closest("tr[data-user-uid]");
  if (!rowNode) return;
  const uid = String(rowNode.getAttribute("data-user-uid") || "").trim();
  if (!uid) return;

  const row = allUserRows.find((entry) => String(entry?.uid || "").trim() === uid);
  if (!row) return;

  selectUserRow(row);
}

async function selectUserRow(row) {
  selectedUserUid = String(row?.uid || "").trim();
  selectedUserRow = row || null;
  selectedEmployees = [];

  applyUsersFilter();
  renderSelectedUserActions();
  userActionsPanel?.classList.remove("hidden");
  setEmployeesLoading();

  await loadSelectedUserDetails();
}

function getAdminOverviewEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminGetUsersOverview`;
}

function getAdminPlansEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminManagePlans`;
}

function getAdminAccountsEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminManageAccounts`;
}

async function loadPlans() {
  const user = auth.currentUser;
  if (!user) return;

  setPlansFeedback("Cargando planes...");
  if (planCardsNode) planCardsNode.innerHTML = "";

  try {
    const token = await user.getIdToken(true);
    const response = await fetchWithLoading(getAdminPlansEndpoint(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudieron cargar los planes.");
    }

    allPlans = normalizePlans(result?.plans);
    renderPlanCards(allPlans);
    updateEstimatedRevenueMetric();
    setPlansFeedback("");
    if (!allPlans.length) {
      selectedPlanId = "";
      planForm?.classList.add("hidden");
      return;
    }

    const nextPlanId =
      selectedPlanId && allPlans.some((plan) => plan.id === selectedPlanId)
        ? selectedPlanId
        : allPlans[0].id;
    selectPlan(nextPlanId);
  } catch (error) {
    console.error(error);
    setPlansFeedback(error.message || "No se pudieron cargar los planes.");
  }
}

function normalizePlans(source) {
  if (!Array.isArray(source)) return [];
  return source
    .map((plan) => {
      const id = String(plan?.id || "").trim().toLowerCase();
      return {
        id,
        titulo: String(plan?.titulo || plan?.nombre || id).trim(),
        precio: String(plan?.precio || "").trim(),
        descripcion: String(plan?.descripcion || "").trim(),
        caracteristicas: Array.isArray(plan?.caracteristicas)
          ? plan.caracteristicas.map((entry) => String(entry || "").trim()).filter(Boolean)
          : [],
        activo: Boolean(plan?.activo),
        orden: Number.isFinite(Number(plan?.orden)) ? Number(plan.orden) : 0,
        maxEmpleados: Number.isFinite(Number(plan?.maxEmpleados))
          ? Number(plan.maxEmpleados)
          : 0
      };
    })
    .filter((plan) => Boolean(plan.id))
    .sort((a, b) => a.orden - b.orden);
}

function renderPlanCards(plans) {
  if (!planCardsNode) return;
  planCardsNode.innerHTML = plans
    .map(
      (plan) => `
        <button type="button" class="plan-card${plan.id === selectedPlanId ? " is-selected" : ""}" data-plan-id="${escapeHtml(plan.id)}">
          <span class="plan-card-title">${escapeHtml(plan.titulo || plan.id)}</span>
          <span class="plan-card-price">${escapeHtml(plan.precio || "")}</span>
          <span class="plan-card-description">${escapeHtml(plan.descripcion || "")}</span>
          <span class="plan-card-features">${plan.caracteristicas.map((entry) => escapeHtml(entry)).join(" | ")}</span>
        </button>
      `
    )
    .join("");
}

function handlePlanCardClick(event) {
  const target = event.target.closest("[data-plan-id]");
  if (!target) return;
  const planId = String(target.getAttribute("data-plan-id") || "").trim().toLowerCase();
  if (!planId) return;
  selectPlan(planId);
}

function selectPlan(planId) {
  const plan = allPlans.find((item) => item.id === planId);
  if (!plan) return;

  selectedPlanId = plan.id;
  planCardsNode?.querySelectorAll("[data-plan-id]").forEach((node) => {
    node.classList.toggle("is-selected", node.getAttribute("data-plan-id") === selectedPlanId);
  });

  planIdInput.value = plan.id;
  planTitleInput.value = plan.titulo;
  planPriceInput.value = plan.precio;
  planDescriptionInput.value = plan.descripcion;
  planFeaturesInput.value = plan.caracteristicas.join("\n");
  planMaxEmployeesInput.value = String(plan.maxEmpleados || 0);
  planOrderInput.value = String(plan.orden || 0);
  planActiveInput.checked = Boolean(plan.activo);
  planForm?.classList.remove("hidden");
}

async function handlePlanSave(event) {
  event.preventDefault();
  if (!selectedPlanId || !auth.currentUser) return;

  setPlansFeedback("");
  if (planSaveBtn) planSaveBtn.disabled = true;

  try {
    const token = await auth.currentUser.getIdToken(true);
    const payload = {
      id: selectedPlanId,
      titulo: String(planTitleInput.value || "").trim(),
      precio: String(planPriceInput.value || "").trim(),
      descripcion: String(planDescriptionInput.value || "").trim(),
      caracteristicas: String(planFeaturesInput.value || "")
        .split("\n")
        .map((entry) => String(entry || "").trim())
        .filter(Boolean),
      maxEmpleados: toPositiveInteger(planMaxEmployeesInput.value),
      orden: toPositiveInteger(planOrderInput.value),
      activo: Boolean(planActiveInput.checked)
    };

    const response = await fetchWithLoading(getAdminPlansEndpoint(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudo guardar el plan.");
    }

    const updated = normalizePlans([result.plan])[0];
    allPlans = allPlans.map((plan) => (plan.id === updated.id ? updated : plan));
    allPlans.sort((a, b) => a.orden - b.orden);
    renderPlanCards(allPlans);
    selectPlan(updated.id);
    setPlansFeedback("Cambios guardados correctamente.");
  } catch (error) {
    console.error(error);
    setPlansFeedback(error.message || "No se pudo guardar el plan.");
  } finally {
    if (planSaveBtn) planSaveBtn.disabled = false;
  }
}

function showLoggedOutState() {
  loginPanel.classList.remove("hidden");
  dashboardPanel.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  refreshBtn.classList.add("hidden");
  allUserRows = [];
  allPlans = [];
  selectedPlanId = "";
  selectedUserUid = "";
  selectedUserRow = null;
  selectedEmployees = [];
  pendingGlobalLoads = 0;
  tableBody.innerHTML = '<tr><td colspan="11">Sin datos.</td></tr>';
  if (metricEstimatedRevenue) metricEstimatedRevenue.textContent = "$0,00 / mes";
  if (planCardsNode) planCardsNode.innerHTML = "";
  planForm?.classList.add("hidden");
  userActionsPanel?.classList.add("hidden");
  globalLoadingNode?.classList.add("hidden");
  setEmployeesPlaceholder("Selecciona un usuario para ver sus empleados.");
}

function showLoggedInState() {
  loginPanel.classList.add("hidden");
  dashboardPanel.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  refreshBtn.classList.remove("hidden");
  setActiveSection(activeSection);
}

function setActiveSection(sectionId) {
  activeSection = sectionId === "plans" ? "plans" : "users";
  activeSection = sectionId === "products" ? "products" : activeSection;

  usersSection?.classList.toggle("hidden", activeSection !== "users");
  plansSection?.classList.toggle("hidden", activeSection !== "plans");
  productsSection?.classList.toggle("hidden", activeSection !== "products");


  navUsersBtn?.classList.toggle("is-active", activeSection === "users");
  navPlansBtn?.classList.toggle("is-active", activeSection === "plans");
  navProductsBtn?.classList.toggle("is-active", activeSection === "products");
}

function setFeedback(message) {
  feedbackNode.textContent = String(message || "");
}

function setTableLoading() {
  tableBody.innerHTML = '<tr><td colspan="11">Cargando...</td></tr>';
}

function setTableError(message) {
  tableBody.innerHTML = `<tr><td colspan="11">${escapeHtml(String(message || "Error al cargar datos."))}</td></tr>`;
}

function setPlansFeedback(message) {
  if (!plansFeedbackNode) return;
  plansFeedbackNode.textContent = String(message || "");
}

function toggleActionButtons(loading) {
  if (refreshBtn) refreshBtn.disabled = loading;
  if (logoutBtn) logoutBtn.disabled = loading;
  if (loginBtn) loginBtn.disabled = loading;
  if (planSaveBtn) planSaveBtn.disabled = loading;
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

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function toPositiveInteger(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.trunc(numeric);
}

async function fetchWithLoading(input, init) {
  showGlobalLoading();
  try {
    return await fetch(input, init);
  } finally {
    hideGlobalLoading();
  }
}

function showGlobalLoading() {
  pendingGlobalLoads += 1;
  globalLoadingNode?.classList.remove("hidden");
}

function hideGlobalLoading() {
  pendingGlobalLoads = Math.max(0, pendingGlobalLoads - 1);
  if (pendingGlobalLoads === 0) {
    globalLoadingNode?.classList.add("hidden");
  }
}

function renderSelectedUserActions() {
  if (!selectedUserRow) {
    userActionsPanel?.classList.add("hidden");
    return;
  }

  const nombre = selectedUserRow?.nombre || "-";
  const negocio = selectedUserRow?.nombreNegocio || "-";
  const estado = selectedUserRow?.activo === false ? "suspendida" : "activa";
  if (selectedUserMeta) {
    selectedUserMeta.textContent = `${nombre} | ${negocio} | Cuenta ${estado}`;
  }

  const nextActionLabel =
    selectedUserRow?.activo === false ? "Habilitar cuenta" : "Suspender cuenta";
  if (toggleUserStatusBtn) {
    toggleUserStatusBtn.textContent = nextActionLabel;
    toggleUserStatusBtn.disabled = false;
  }

  const phoneDigits = sanitizePhoneToDigits(selectedUserRow?.telefono);
  if (openWhatsappBtn) {
    openWhatsappBtn.disabled = !phoneDigits;
  }
}

async function loadSelectedUserDetails() {
  if (!selectedUserRow || !auth.currentUser) return;

  try {
    const token = await auth.currentUser.getIdToken(true);
    const params = new URLSearchParams({
      uid: String(selectedUserRow?.uid || "").trim(),
      tenantId: String(selectedUserRow?.tenantId || "").trim()
    });
    const response = await fetchWithLoading(`${getAdminAccountsEndpoint()}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudieron cargar los detalles de la cuenta.");
    }

    if (result?.employer) {
      selectedUserRow = {
        ...selectedUserRow,
        activo: result.employer.activo !== false
      };
      allUserRows = allUserRows.map((row) =>
        String(row?.uid || "").trim() === selectedUserUid
          ? { ...row, activo: selectedUserRow.activo }
          : row
      );
      applyUsersFilter();
      renderSelectedUserActions();
    }

    selectedEmployees = Array.isArray(result?.employees) ? result.employees : [];
    renderEmployeesTable();
  } catch (error) {
    console.error(error);
    setEmployeesPlaceholder(error.message || "No se pudieron cargar los empleados.");
  }
}

async function handleToggleUserStatus() {
  if (!selectedUserRow || !auth.currentUser) return;

  const nextActive = selectedUserRow?.activo === false;
  if (toggleUserStatusBtn) toggleUserStatusBtn.disabled = true;

  try {
    const token = await auth.currentUser.getIdToken(true);
    const response = await fetchWithLoading(getAdminAccountsEndpoint(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        targetType: "employer",
        uid: String(selectedUserRow?.uid || "").trim(),
        tenantId: String(selectedUserRow?.tenantId || "").trim(),
        active: nextActive
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudo actualizar la cuenta.");
    }

    selectedUserRow = {
      ...selectedUserRow,
      activo: result?.employer?.activo !== false
    };
    allUserRows = allUserRows.map((row) =>
      String(row?.uid || "").trim() === selectedUserUid
        ? { ...row, activo: selectedUserRow.activo }
        : row
    );
    applyUsersFilter();
    renderSelectedUserActions();
  } catch (error) {
    console.error(error);
    setFeedback(error.message || "No se pudo actualizar la cuenta del usuario.");
  } finally {
    if (toggleUserStatusBtn) toggleUserStatusBtn.disabled = false;
  }
}

function openSelectedUserWhatsapp() {
  if (!selectedUserRow) return;
  const digits = sanitizePhoneToDigits(selectedUserRow?.telefono);
  if (!digits) return;
  window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
}

function sanitizePhoneToDigits(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 6 ? digits : "";
}

function setEmployeesLoading() {
  if (!employeesTableBody) return;
  employeesTableBody.innerHTML = '<tr><td colspan="5">Cargando empleados...</td></tr>';
}

function setEmployeesPlaceholder(message) {
  if (!employeesTableBody) return;
  employeesTableBody.innerHTML = `<tr><td colspan="5">${escapeHtml(String(message || "Sin datos."))}</td></tr>`;
}

function renderEmployeesTable() {
  if (!employeesTableBody) return;
  if (!selectedEmployees.length) {
    setEmployeesPlaceholder("No hay empleados para este usuario.");
    return;
  }

  employeesTableBody.innerHTML = selectedEmployees
    .map((employee) => {
      const active = employee?.activo !== false;
      const actionLabel = active ? "Deshabilitar" : "Habilitar";
      return [
        "<tr>",
        `<td>${escapeHtml(employee?.nombre || "-")}</td>`,
        `<td>${escapeHtml(employee?.email || "-")}</td>`,
        `<td>${escapeHtml(employee?.telefono || "-")}</td>`,
        `<td>${escapeHtml(active ? "Activo" : "Inactivo")}</td>`,
        `<td><button type="button" class="employee-toggle-btn mode-btn-secondary" data-employee-uid="${escapeHtml(String(employee?.uid || ""))}" data-next-active="${active ? "false" : "true"}">${actionLabel}</button></td>`,
        "</tr>"
      ].join("");
    })
    .join("");
}

async function handleEmployeeToggleClick(event) {
  const target = event.target.closest("[data-employee-uid]");
  if (!target || !auth.currentUser || !selectedUserRow) return;

  const employeeUid = String(target.getAttribute("data-employee-uid") || "").trim();
  const nextActive = String(target.getAttribute("data-next-active") || "").trim() === "true";
  if (!employeeUid) return;

  target.disabled = true;
  try {
    const token = await auth.currentUser.getIdToken(true);
    const response = await fetchWithLoading(getAdminAccountsEndpoint(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        targetType: "employee",
        uid: employeeUid,
        tenantId: String(selectedUserRow?.tenantId || "").trim(),
        active: nextActive
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudo actualizar el empleado.");
    }

    const updated = result?.employee || {};
    selectedEmployees = selectedEmployees.map((employee) =>
      String(employee?.uid || "").trim() === String(updated?.uid || "").trim()
        ? { ...employee, activo: updated?.activo !== false }
        : employee
    );
    renderEmployeesTable();
  } catch (error) {
    console.error(error);
    setFeedback(error.message || "No se pudo actualizar el empleado.");
    target.disabled = false;
  }
}

function updateEstimatedRevenueMetric() {
  if (!metricEstimatedRevenue) return;
  const total = allUserRows.reduce((acc, row) => acc + resolvePlanValue(row), 0);
  metricEstimatedRevenue.textContent = `${formatMoney(total)} / mes`;
}

function resolvePlanValue(row) {
  const planLabel = String(row?.planActual || "").trim();
  if (!planLabel) return 0;

  const normalizedPlan = normalizeText(planLabel);
  const matchedPlan = allPlans.find((plan) => {
    const byId = normalizeText(plan?.id || "");
    const byTitle = normalizeText(plan?.titulo || "");
    return normalizedPlan === byId || normalizedPlan === byTitle;
  });

  if (matchedPlan) {
    return parseMoneyValue(matchedPlan.precio);
  }

  return parseMoneyValue(planLabel);
}

function parseMoneyValue(raw) {
  const text = String(raw || "").trim();
  if (!text) return 0;

  const hasCurrencyHint = /[$€£]|ars|usd|mxn|cop|clp|brl/i.test(text);
  const numericMatch = text.match(/-?\d[\d.,]*/);
  if (!numericMatch) return 0;

  // Evita tomar valores no monetarios de textos como "7 dias" cuando no hay pista de moneda.
  if (!hasCurrencyHint && !/^-?\d+(?:[.,]\d+)?$/.test(text)) {
    return 0;
  }

  const numeric = Number(normalizeNumericToken(numericMatch[0]));
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return numeric;
}

function normalizeNumericToken(value) {
  const token = String(value || "").trim();
  if (!token) return "0";

  const lastComma = token.lastIndexOf(",");
  const lastDot = token.lastIndexOf(".");

  if (lastComma === -1 && lastDot === -1) {
    return token.replace(/[^\d-]/g, "");
  }

  const useComma = lastComma > lastDot;
  const separator = useComma ? "," : ".";
  const lastIndex = token.lastIndexOf(separator);
  const intPart = token.slice(0, lastIndex).replace(/[^\d-]/g, "");
  let decimalPart = token.slice(lastIndex + 1).replace(/[^\d]/g, "");

  if (
    (separator === "." && lastComma === -1 && decimalPart.length === 3) ||
    (separator === "," && lastDot === -1 && decimalPart.length === 3)
  ) {
    return `${intPart}${decimalPart}`;
  }

  decimalPart = decimalPart.slice(0, 2);
  return decimalPart ? `${intPart}.${decimalPart}` : intPart;
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
