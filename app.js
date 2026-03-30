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
import { BUSINESS_CATALOG_SEED } from "./businessCatalogSeed.js";

const ALLOWED_ADMIN_EMAILS = new Set([
  "artbenitezdev@gmail.com",
  "admin@stockfacil.com.ar"
]);
const TRIAL_PLAN_ID = "prueba";
const STARTER_PLAN_ID = "starter";

const STARTER_PLAN_SEED = Object.freeze({
  id: STARTER_PLAN_ID,
  titulo: "Starter",
  precio: "$ 5000",
  descripcion: "Plan inicial para empezar a usar StockFacil.",
  caracteristicas: [
    "Gestion de productos y stock",
    "Registro de ventas y caja",
    "1 cuenta empleado incluida",
    "Metricas mensuales",
    "Sin Sincronización en la nube",
    "1 solo dispositivo habilitado",
    "ideal para pequeños negocios",
    "Soporte por WhatsApp Limitado"
  ],
  maxEmpleados: 1,
  orden: 1,
  activo: true
});
const DEFAULT_TRIAL_CONTROL = {
  trialAccessAllowed: true,
  trialWarningEnabled: false,
  trialWarningText: "Tu prueba esta por finalizar, actualiza tu plan para seguir usando la sincronizacion.",
  trialWarningCtaLabel: "Actualizar suscripcion",
  trialWarningCtaUrl: "planes.html",
  trialBlockTitle: "Tu periodo de prueba finalizo",
  trialBlockMessage: "Para seguir usando StockFacil debes actualizar tu plan.",
  trialBlockWhatsappNumber: "",
  trialBlockWhatsappText: "Hola, necesito ayuda para actualizar mi plan."
};

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
const navEmployeesBtn = document.getElementById("admin-nav-employees-btn");
const navPlansBtn = document.getElementById("admin-nav-plans-btn");
const navManagerBtn = document.getElementById("admin-nav-manager-btn");
const navChangePlanBtn = document.getElementById("admin-nav-change-plan-btn");
const managerNavProductsBtn = document.getElementById("admin-manager-nav-products-btn");
const managerNavSalesBtn = document.getElementById("admin-manager-nav-sales-btn");
const managerNavCashboxesBtn = document.getElementById("admin-manager-nav-cashboxes-btn");
const managerNavBackupsBtn = document.getElementById("admin-manager-nav-backups-btn");
const usersSection = document.getElementById("admin-users-section");
const employeesSection = document.getElementById("admin-employees-section");
const plansSection = document.getElementById("admin-plans-section");
const managerSection = document.getElementById("admin-manager-section");
const changePlanSection = document.getElementById("admin-change-plan-section");
const productsSection = document.getElementById("admin-products-section");
const salesSection = document.getElementById("admin-sales-section");
const cashboxesSection = document.getElementById("admin-cashboxes-section");
const backupsSection = document.getElementById("admin-backups-section");
const managerUserSelect = document.getElementById("admin-manager-user-select");
const usersSearchInput = document.getElementById("admin-users-search");
const globalLoadingNode = document.getElementById("admin-global-loading");
const globalToastNode = document.getElementById("admin-global-toast");
const generatedAtNode = document.getElementById("admin-generated-at");
const tableBody = document.getElementById("admin-users-table-body");
const userActionsPanel = document.getElementById("admin-user-actions-panel");
const selectedUserMeta = document.getElementById("admin-selected-user-meta");
const toggleUserStatusBtn = document.getElementById("admin-toggle-user-status-btn");
const openWhatsappBtn = document.getElementById("admin-open-whatsapp-btn");
const userTrialControlGroup = document.getElementById("admin-user-trial-control-group");
const userTrialAccessAllowedInput = document.getElementById("admin-user-trial-access-allowed");
const userTrialWarningEnabledInput = document.getElementById("admin-user-trial-warning-enabled");
const userTrialSaveBtn = document.getElementById("admin-user-trial-save-btn");
const userTrialFeedbackNode = document.getElementById("admin-user-trial-feedback");
const employeesFeedbackNode = document.getElementById("admin-employees-feedback");
const employeesUserSelect = document.getElementById("admin-employees-user-select");
const employeesTableBody = document.getElementById("admin-employees-table-body");
const userDocOverlay = document.getElementById("admin-user-doc-overlay");
const userDocOverlayMeta = document.getElementById("admin-user-doc-overlay-meta");
const userDocOverlayUserContent = document.getElementById("admin-user-doc-overlay-user-content");
const userDocOverlayTenantContent = document.getElementById("admin-user-doc-overlay-tenant-content");
const userDocOverlayRefreshBtn = document.getElementById("admin-user-doc-overlay-refresh-btn");
const userDocOverlayCloseBtn = document.getElementById("admin-user-doc-overlay-close-btn");
const metricTotalUsers = document.getElementById("metric-total-users");
const metricTotalEmployees = document.getElementById("metric-total-employees");
const metricTotalProducts = document.getElementById("metric-total-products");
const metricEstimatedRevenue = document.getElementById("metric-estimated-revenue");
const plansFeedbackNode = document.getElementById("admin-plans-feedback");
const seedStarterPlanBtn = document.getElementById("admin-seed-starter-plan-btn");
const seedBusinessCatalogBtn = document.getElementById("admin-seed-business-catalog-btn");
const changePlanFeedbackNode = document.getElementById("admin-change-plan-feedback");
const changePlanCurrentMetaNode = document.getElementById("admin-change-plan-current-meta");
const changePlanPreviewNode = document.getElementById("admin-change-plan-preview");
const changePlanUserSelect = document.getElementById("admin-change-plan-user-select");
const changePlanPlanSelect = document.getElementById("admin-change-plan-plan-select");
const changePlanSaveBtn = document.getElementById("admin-change-plan-save-btn");
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
const trialControlGroup = document.getElementById("admin-trial-control-group");
const planTrialAccessAllowedInput = document.getElementById("admin-plan-trial-access-allowed");
const planTrialWarningEnabledInput = document.getElementById("admin-plan-trial-warning-enabled");
const planTrialWarningTextInput = document.getElementById("admin-plan-trial-warning-text");
const planTrialWarningCtaLabelInput = document.getElementById("admin-plan-trial-warning-cta-label");
const planTrialWarningCtaUrlInput = document.getElementById("admin-plan-trial-warning-cta-url");
const planTrialBlockTitleInput = document.getElementById("admin-plan-trial-block-title");
const planTrialBlockMessageInput = document.getElementById("admin-plan-trial-block-message");
const planTrialWhatsappNumberInput = document.getElementById("admin-plan-trial-whatsapp-number");
const planTrialWhatsappTextInput = document.getElementById("admin-plan-trial-whatsapp-text");
const TRIAL_CONTROL_INPUTS = [
  planTrialAccessAllowedInput,
  planTrialWarningEnabledInput,
  planTrialWarningTextInput,
  planTrialWarningCtaLabelInput,
  planTrialWarningCtaUrlInput,
  planTrialBlockTitleInput,
  planTrialBlockMessageInput,
  planTrialWhatsappNumberInput,
  planTrialWhatsappTextInput
].filter(Boolean);
const planSaveBtn = document.getElementById("admin-plan-save-btn");
const productsFeedbackNode = document.getElementById("admin-products-feedback");
const productsSearchInput = document.getElementById("admin-products-search");
const productsTableBody = document.getElementById("admin-products-table-body");
const productsBackupBtn = document.getElementById("admin-products-backup-btn");
const salesFeedbackNode = document.getElementById("admin-sales-feedback");
const salesSearchInput = document.getElementById("admin-sales-search");
const salesTableBody = document.getElementById("admin-sales-table-body");
const salesBackupBtn = document.getElementById("admin-sales-backup-btn");
const cashboxesFeedbackNode = document.getElementById("admin-cashboxes-feedback");
const cashboxesSearchInput = document.getElementById("admin-cashboxes-search");
const cashboxesTableBody = document.getElementById("admin-cashboxes-table-body");
const cashboxesBackupBtn = document.getElementById("admin-cashboxes-backup-btn");
const cashboxDetailFeedbackNode = document.getElementById("admin-cashbox-detail-feedback");
const cashboxDetailContentNode = document.getElementById("admin-cashbox-detail-content");
const cashboxProductsFeedbackNode = document.getElementById("admin-cashbox-products-feedback");
const cashboxProductsContentNode = document.getElementById("admin-cashbox-products-content");
const backupsFeedbackNode = document.getElementById("admin-backups-feedback");
const backupsSearchInput = document.getElementById("admin-backups-search");
const backupsTableBody = document.getElementById("admin-backups-table-body");
const backupSalesFeedbackNode = document.getElementById("admin-backup-sales-feedback");
const backupSalesTableBody = document.getElementById("admin-backup-sales-table-body");
const backupDownloadBtn = document.getElementById("admin-backup-download-btn");
const importBackupFeedbackNode = document.getElementById("admin-import-backup-feedback");
const importTargetUserSelect = document.getElementById("admin-import-target-user-select");
const importBackupFileInput = document.getElementById("admin-import-backup-file");
const importBackupTypeSelect = document.getElementById("admin-import-backup-type");
const importPreviewTableBody = document.getElementById("admin-import-preview-table-body");
const importFloatingActionsNode = document.getElementById("admin-import-floating-actions");
const importConfirmBtn = document.getElementById("admin-import-confirm-btn");
const importCancelBtn = document.getElementById("admin-import-cancel-btn");

let allUserRows = [];
let allPlans = [];
let selectedPlanId = "";
let activeSection = "users";
let activeManagerSubsection = "products";
let selectedManagerUserUid = "";
let selectedManagerTenantId = "";
let selectedUserUid = "";
let selectedUserRow = null;
let selectedEmployees = [];
let selectedEmployeesUserUid = "";
let selectedEmployeesTenantId = "";
let latestEmployeesRequestId = 0;
let latestUserDocRequestId = 0;
let selectedProductsUserUid = "";
let selectedProductsTenantId = "";
let allProductRows = [];
let productsSearchDebounce = null;
let latestProductsRequestId = 0;
let selectedSalesUserUid = "";
let selectedSalesTenantId = "";
let allSalesRows = [];
let salesSearchDebounce = null;
let latestSalesRequestId = 0;
let selectedCashboxesUserUid = "";
let selectedCashboxesTenantId = "";
let allCashboxesRows = [];
let allCashboxesSourceRows = [];
let cashboxesSearchDebounce = null;
let latestCashboxesRequestId = 0;
let selectedCashboxRowKey = "";
let selectedCashboxRow = null;
let selectedBackupsUserUid = "";
let selectedBackupsTenantId = "";
let allBackupsRows = [];
let backupsSearchDebounce = null;
let latestBackupsRequestId = 0;
let selectedBackupRowPath = "";
let selectedBackupRow = null;
let selectedImportTargetUserUid = "";
let selectedImportTargetTenantId = "";
let selectedImportBackupType = "sales";
let selectedChangePlanUserUid = "";
let selectedChangePlanTenantId = "";
let selectedChangePlanCurrentPlanId = "";
let selectedChangePlanTargetPlanId = "";
let importPreviewPayload = null;
let importPreviewRows = [];
let pendingGlobalLoads = 0;
let globalToastTimeout = null;

const ADMIN_CACHE_DB_NAME = "stockfacil-admin-cache";
const ADMIN_CACHE_DB_VERSION = 4;
const CASHBOXES_CACHE_STORE = "cashboxes_by_tenant";
const SECTION_ROWS_CACHE_STORE = "section_rows_by_tenant";
const USER_DOCS_CACHE_STORE = "user_tenant_docs_by_uid";
let adminCacheDbPromise = null;

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
  navEmployeesBtn?.addEventListener("click", () => setActiveSection("employees"));
  navPlansBtn?.addEventListener("click", () => setActiveSection("plans"));
  navManagerBtn?.addEventListener("click", () => setActiveSection("manager"));
  navChangePlanBtn?.addEventListener("click", () => setActiveSection("change-plan"));
  managerNavProductsBtn?.addEventListener("click", () => setActiveManagerSubsection("products"));
  managerNavSalesBtn?.addEventListener("click", () => setActiveManagerSubsection("sales"));
  managerNavCashboxesBtn?.addEventListener("click", () => setActiveManagerSubsection("cashboxes"));
  managerNavBackupsBtn?.addEventListener("click", () => setActiveManagerSubsection("backups"));
  managerUserSelect?.addEventListener("change", handleManagerUserSelectChange);
  changePlanUserSelect?.addEventListener("change", handleChangePlanUserSelectChange);
  changePlanPlanSelect?.addEventListener("change", handleChangePlanPlanSelectChange);
  changePlanSaveBtn?.addEventListener("click", () => void handleChangePlanSaveClick());
  usersSearchInput?.addEventListener("input", applyUsersFilter);
  employeesUserSelect?.addEventListener("change", handleEmployeesUserSelectChange);
  productsSearchInput?.addEventListener("input", handleProductsSearchInput);
  productsBackupBtn?.addEventListener("click", handleProductsBackupClick);
  salesSearchInput?.addEventListener("input", handleSalesSearchInput);
  salesBackupBtn?.addEventListener("click", handleSalesBackupClick);
  cashboxesSearchInput?.addEventListener("input", handleCashboxesSearchInput);
  cashboxesBackupBtn?.addEventListener("click", handleCashboxesBackupClick);
  cashboxesTableBody?.addEventListener("click", handleCashboxRowClick);
  backupsSearchInput?.addEventListener("input", handleBackupsSearchInput);
  backupsTableBody?.addEventListener("click", handleBackupRowClick);
  backupDownloadBtn?.addEventListener("click", handleBackupDownloadClick);
  importTargetUserSelect?.addEventListener("change", handleImportTargetUserSelectChange);
  importBackupTypeSelect?.addEventListener("change", handleImportBackupTypeSelectChange);
  importBackupFileInput?.addEventListener("change", () => void handleImportBackupFileInputChange());
  importConfirmBtn?.addEventListener("click", () => void handleImportConfirmClick());
  importCancelBtn?.addEventListener("click", handleImportCancelClick);
  tableBody?.addEventListener("click", handleUserRowClick);
  userDocOverlay?.addEventListener("click", handleUserDocOverlayClick);
  userDocOverlayRefreshBtn?.addEventListener("click", handleUserDocOverlayRefreshClick);
  userDocOverlayCloseBtn?.addEventListener("click", closeUserDocOverlay);
  userDocOverlayUserContent?.addEventListener("click", handleUserDocCardRowCopyClick);
  userDocOverlayTenantContent?.addEventListener("click", handleUserDocCardRowCopyClick);
  planCardsNode?.addEventListener("click", handlePlanCardClick);
  planForm?.addEventListener("submit", handlePlanSave);
  seedStarterPlanBtn?.addEventListener("click", handleSeedStarterPlanClick);
  seedBusinessCatalogBtn?.addEventListener("click", handleSeedBusinessCatalogClick);
  toggleUserStatusBtn?.addEventListener("click", handleToggleUserStatus);
  openWhatsappBtn?.addEventListener("click", openSelectedUserWhatsapp);
  userTrialSaveBtn?.addEventListener("click", handleSaveSelectedUserTrialControl);
  employeesTableBody?.addEventListener("click", handleEmployeeToggleClick);
  document.addEventListener("keydown", handleGlobalKeydown);

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      showLoggedOutState();
      return;
    }
    const email = String(user.email || "").trim().toLowerCase();
    if (!ALLOWED_ADMIN_EMAILS.has(email)) {
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
  if (activeSection === "employees") {
    await loadEmployeesForSelectedUser();
    return;
  }
  if (activeSection === "manager") {
    if (activeManagerSubsection === "products") {
      await loadProductsForSelectedUser({ forceRemote: true });
      return;
    }
    if (activeManagerSubsection === "sales") {
      await loadSalesForSelectedUser({ forceRemote: true });
      return;
    }
    if (activeManagerSubsection === "cashboxes") {
      await loadCashboxesForSelectedUser({ forceRemote: true });
      return;
    }
    if (activeManagerSubsection === "backups") {
      await loadBackupsForSelectedUser({ forceRemote: true });
      return;
    }
    return;
  }
  if (activeSection === "change-plan") {
    await Promise.allSettled([loadOverview(), loadPlans()]);
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
    const previousSelectedRow = selectedUserRow;
    selectedUserRow =
      allUserRows.find((row) => String(row?.uid || "").trim() === selectedUserUid) || null;
    if (!selectedUserRow) {
      selectedUserUid = "";
      userActionsPanel?.classList.add("hidden");
    } else {
      if (previousSelectedRow && String(previousSelectedRow?.uid || "").trim() === selectedUserUid) {
        selectedUserRow = {
          ...selectedUserRow,
          trialAccessAllowed: previousSelectedRow?.trialAccessAllowed,
          trialWarningEnabled: previousSelectedRow?.trialWarningEnabled,
          trialControlLoaded: previousSelectedRow?.trialControlLoaded === true
        };
      }
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
  renderEmployeesUserOptions();
  renderManagerUserOptions();
  renderImportTargetUserOptions(getActiveScopedUsers());
  renderChangePlanUserOptions();
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
      const isTrialPlan = normalizePlanId(row?.planActual) === TRIAL_PLAN_ID;
      const rowClasses = [];
      if (isSelected) rowClasses.push("is-selected");
      if (isTrialPlan) rowClasses.push("is-trial");
      const rowClass = rowClasses.length ? ` class="${rowClasses.join(" ")}"` : "";
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
  selectedUserRow = row
    ? {
        ...row,
        trialAccessAllowed: toTrialBoolean(row?.trialAccessAllowed, true),
        trialWarningEnabled: toTrialBoolean(row?.trialWarningEnabled, false),
        trialControlLoaded: row?.trialControlLoaded === true
      }
    : null;

  applyUsersFilter();
  setUserTrialFeedback("");
  renderSelectedUserActions();
  userActionsPanel?.classList.remove("hidden");
  renderUserDocOverlayLoading(selectedUserRow);

  void loadAndRenderSelectedUserDocs(selectedUserRow, () => loadSelectedUserAccountDetails());
}

function getAdminOverviewEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminGetUsersOverview`;
}

function getAdminPlansEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminManagePlans`;
}

function getAdminSeedBusinessCatalogEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminSeedBusinessCatalog`;
}

function getAdminAccountsEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminManageAccounts`;
}

function getAdminTenantEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminGetTenantById`;
}

function getAdminProductsEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminManageProducts`;
}

function getAdminSalesEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminManageSales`;
}

function getAdminCashboxesEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminManageCashboxes`;
}

function getAdminBackupsEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminManageBackups`;
}

function getAdminReadBackupEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminReadBackup`;
}

function getAdminBackupDownloadUrlEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminGetBackupDownloadUrl`;
}

function getAdminImportBackupEndpoint() {
  const projectId = String(firebaseConfig?.projectId || "").trim();
  return `https://us-central1-${projectId}.cloudfunctions.net/adminImportBackup`;
}

function mapScopedUserRow(row) {
  const uid = String(row?.uid || "").trim();
  const tenantId = String(row?.tenantId || "").trim();
  const nombre = String(row?.nombre || "-").trim();
  const negocio = String(row?.nombreNegocio || "-").trim();
  const email = String(row?.email || "-").trim();
  const active = row?.activo !== false;
  const estado = active ? "Activo" : "Inactivo";
  const tenantLabel = tenantId ? `Tenant ${tenantId}` : "Sin tenant";
  const currentPlanId = normalizePlanId(row?.planActual) || String(row?.planActual || "").trim().toLowerCase();
  return {
    uid,
    tenantId,
    nombre,
    negocio,
    email,
    active,
    estado,
    tenantLabel,
    currentPlanId
  };
}

function getScopedUserRows(options = {}) {
  const onlyActive = options?.onlyActive === true;
  const requireTenant = options?.requireTenant === true;
  return allUserRows
    .map((row) => mapScopedUserRow(row))
    .filter((row) => Boolean(row.uid))
    .filter((row) => !onlyActive || row.active)
    .filter((row) => !requireTenant || Boolean(row.tenantId));
}

function getActiveScopedUsers() {
  return getScopedUserRows({ onlyActive: true, requireTenant: true }).map((row) => ({
    uid: row.uid,
    tenantId: row.tenantId,
    label: `${row.nombre} | ${row.negocio}`
  }));
}

function renderEmployeesUserOptions() {
  if (!employeesUserSelect) return;

  const activeUsers = getActiveScopedUsers();
  const previousUserUid = selectedEmployeesUserUid;
  const nextUserUid =
    previousUserUid && activeUsers.some((item) => item.uid === previousUserUid)
      ? previousUserUid
      : activeUsers[0]?.uid || "";
  const selectedUser = activeUsers.find((item) => item.uid === nextUserUid) || null;

  selectedEmployeesUserUid = nextUserUid;
  selectedEmployeesTenantId = selectedUser?.tenantId || "";
  employeesUserSelect.innerHTML =
    `<option value="">Selecciona un usuario...</option>` +
    activeUsers
      .map(
        (item) =>
          `<option value="${escapeHtml(item.uid)}"${item.uid === selectedEmployeesUserUid ? " selected" : ""}>${escapeHtml(item.label)}</option>`
      )
      .join("");
  employeesUserSelect.disabled = activeUsers.length === 0;

  if (!activeUsers.length) {
    selectedEmployees = [];
    setEmployeesPlaceholder("No hay usuarios activos para consultar empleados.");
    setEmployeesFeedback("");
    return;
  }

  if (activeSection === "employees") {
    void loadEmployeesForSelectedUser();
  }
}

function renderManagerUserOptions() {
  const activeUsers = getActiveScopedUsers();
  const previousUid = selectedManagerUserUid;
  const nextUid =
    previousUid && activeUsers.some((item) => item.uid === previousUid)
      ? previousUid
      : activeUsers[0]?.uid || "";
  const selectedUser = activeUsers.find((item) => item.uid === nextUid) || null;

  selectedManagerUserUid = nextUid;
  selectedManagerTenantId = selectedUser?.tenantId || "";
  syncManagerSelectionToSectionTargets(selectedManagerUserUid, selectedManagerTenantId);

  if (managerUserSelect) {
    managerUserSelect.innerHTML =
      `<option value="">Selecciona un usuario...</option>` +
      activeUsers
        .map(
          (item) =>
            `<option value="${escapeHtml(item.uid)}"${item.uid === selectedManagerUserUid ? " selected" : ""}>${escapeHtml(item.label)}</option>`
        )
        .join("");
    managerUserSelect.disabled = activeUsers.length === 0;
  }

  if (!activeUsers.length) {
    allProductRows = [];
    allSalesRows = [];
    allCashboxesRows = [];
    allCashboxesSourceRows = [];
    allBackupsRows = [];
    selectedCashboxRowKey = "";
    selectedCashboxRow = null;
    selectedBackupRowPath = "";
    selectedBackupRow = null;
    importPreviewPayload = null;
    importPreviewRows = [];
    if (importBackupFileInput) importBackupFileInput.value = "";
    renderSelectedCashboxDetail();
    renderBackupSalesTable([]);
    setProductsPlaceholder("No hay usuarios activos para consultar productos.");
    setProductsFeedback("");
    setSalesPlaceholder("No hay usuarios activos para consultar ventas.");
    setSalesFeedback("");
    setCashboxesPlaceholder("No hay usuarios activos para consultar cajas.");
    setCashboxesFeedback("");
    setBackupsPlaceholder("No hay usuarios activos para consultar backups.");
    setBackupsFeedback("");
    setBackupSalesFeedback("Selecciona un backup para ver sus ventas.");
    setImportPreviewPlaceholder("Selecciona un archivo para simular la carga.");
    setImportBackupFeedback("Selecciona usuario destino, tipo y archivo para simular.");
    syncBackupButtonsState();
    return;
  }

  syncBackupButtonsState();
  if (activeSection === "manager") {
    void loadManagerActiveSubsection();
  }
}

function syncManagerSelectionToSectionTargets(uid, tenantId) {
  const safeUid = String(uid || "").trim();
  const safeTenantId = String(tenantId || "").trim();
  selectedProductsUserUid = safeUid;
  selectedProductsTenantId = safeTenantId;
  selectedSalesUserUid = safeUid;
  selectedSalesTenantId = safeTenantId;
  selectedCashboxesUserUid = safeUid;
  selectedCashboxesTenantId = safeTenantId;
  selectedBackupsUserUid = safeUid;
  selectedBackupsTenantId = safeTenantId;
}

function handleManagerUserSelectChange() {
  const uid = String(managerUserSelect?.value || "").trim();
  const row = getActiveScopedUsers().find((entry) => String(entry?.uid || "").trim() === uid) || null;
  selectedManagerUserUid = uid;
  selectedManagerTenantId = String(row?.tenantId || "").trim();
  syncManagerSelectionToSectionTargets(selectedManagerUserUid, selectedManagerTenantId);
  allProductRows = [];
  allSalesRows = [];
  allCashboxesRows = [];
  allCashboxesSourceRows = [];
  allBackupsRows = [];
  selectedCashboxRowKey = "";
  selectedCashboxRow = null;
  selectedBackupRowPath = "";
  selectedBackupRow = null;
  renderSelectedCashboxDetail();
  renderBackupSalesTable([]);
  setBackupSalesFeedback("Selecciona un backup para ver sus ventas.");
  syncBackupButtonsState();
  void loadManagerActiveSubsection();
}

async function loadManagerActiveSubsection(options = {}) {
  if (activeManagerSubsection === "products") {
    await loadProductsForSelectedUser(options);
    return;
  }
  if (activeManagerSubsection === "sales") {
    await loadSalesForSelectedUser(options);
    return;
  }
  if (activeManagerSubsection === "cashboxes") {
    await loadCashboxesForSelectedUser(options);
    return;
  }
  if (activeManagerSubsection === "backups") {
    await loadBackupsForSelectedUser(options);
  }
}

function getChangePlanSelectableUsers() {
  return getScopedUserRows().map((row) => ({
    uid: row.uid,
    tenantId: row.tenantId,
    nombre: row.nombre,
    negocio: row.negocio,
    email: row.email,
    estado: row.estado,
    currentPlanId: row.currentPlanId,
    label: `${row.nombre} | ${row.negocio}`
  }));
}

function getSelectedChangePlanUserRow() {
  const uid = String(selectedChangePlanUserUid || "").trim();
  if (!uid) return null;
  return allUserRows.find((row) => String(row?.uid || "").trim() === uid) || null;
}

function resolvePlanDisplayName(planId) {
  const normalizedId = normalizePlanId(planId) || String(planId || "").trim().toLowerCase();
  if (!normalizedId) return "-";
  const plan = allPlans.find((item) => item.id === normalizedId) || null;
  if (!plan) return normalizedId;
  const title = String(plan?.titulo || "").trim();
  return title || normalizedId;
}

function renderChangePlanUserOptions() {
  if (!changePlanUserSelect) return;

  const users = getChangePlanSelectableUsers();
  const previousUid = selectedChangePlanUserUid;
  const nextUid =
    previousUid && users.some((item) => item.uid === previousUid)
      ? previousUid
      : users[0]?.uid || "";
  const selectedUser = users.find((item) => item.uid === nextUid) || null;

  selectedChangePlanUserUid = nextUid;
  selectedChangePlanTenantId = selectedUser?.tenantId || "";
  selectedChangePlanCurrentPlanId = selectedUser?.currentPlanId || "";

  changePlanUserSelect.innerHTML =
    `<option value="">Selecciona un usuario...</option>` +
    users
      .map(
        (item) =>
          `<option value="${escapeHtml(item.uid)}"${item.uid === selectedChangePlanUserUid ? " selected" : ""}>${escapeHtml(item.label)}</option>`
      )
      .join("");
  changePlanUserSelect.disabled = users.length === 0;

  if (!users.length) {
    selectedChangePlanUserUid = "";
    selectedChangePlanTenantId = "";
    selectedChangePlanCurrentPlanId = "";
    selectedChangePlanTargetPlanId = "";
    if (changePlanPlanSelect) {
      changePlanPlanSelect.innerHTML = '<option value="">Selecciona un plan...</option>';
      changePlanPlanSelect.disabled = true;
    }
    setChangePlanFeedback("");
    if (changePlanCurrentMetaNode) {
      changePlanCurrentMetaNode.textContent = "No hay usuarios para cambiar plan.";
    }
    if (changePlanPreviewNode) {
      changePlanPreviewNode.textContent =
        "Selecciona un plan diferente para ver los cambios que se aplicaran en Firebase.";
    }
    syncChangePlanSaveState();
    return;
  }

  renderChangePlanPlanOptions();
}

function renderChangePlanPlanOptions() {
  if (!changePlanPlanSelect) return;

  const currentPlanId =
    normalizePlanId(selectedChangePlanCurrentPlanId) ||
    String(selectedChangePlanCurrentPlanId || "").trim().toLowerCase();
  const activePlans = allPlans.filter((plan) => plan?.activo === true);
  const options = activePlans.map((plan) => ({
    id: plan.id,
    title: plan.titulo || plan.id,
    active: true
  }));
  if (currentPlanId && !options.some((plan) => plan.id === currentPlanId)) {
    options.unshift({
      id: currentPlanId,
      title: `${resolvePlanDisplayName(currentPlanId)} (plan actual no activo)`,
      active: false
    });
  }

  const nextTargetPlanId =
    selectedChangePlanTargetPlanId && options.some((plan) => plan.id === selectedChangePlanTargetPlanId)
      ? selectedChangePlanTargetPlanId
      : currentPlanId && options.some((plan) => plan.id === currentPlanId)
        ? currentPlanId
        : options[0]?.id || "";

  selectedChangePlanTargetPlanId = nextTargetPlanId;

  changePlanPlanSelect.innerHTML =
    `<option value="">Selecciona un plan...</option>` +
    options
      .map(
        (plan) =>
          `<option value="${escapeHtml(plan.id)}"${plan.id === selectedChangePlanTargetPlanId ? " selected" : ""}>${escapeHtml(plan.title)}</option>`
      )
      .join("");
  changePlanPlanSelect.disabled =
    !selectedChangePlanUserUid || !selectedChangePlanTenantId || options.length === 0;

  renderChangePlanCurrentMeta();
  renderChangePlanPreview();
  syncChangePlanSaveState();
}

function renderChangePlanCurrentMeta() {
  if (!changePlanCurrentMetaNode) return;
  const row = getSelectedChangePlanUserRow();
  if (!row) {
    changePlanCurrentMetaNode.textContent = "Selecciona un usuario para ver su plan actual.";
    return;
  }
  const currentPlanId =
    normalizePlanId(selectedChangePlanCurrentPlanId || row?.planActual) ||
    String(selectedChangePlanCurrentPlanId || row?.planActual || "").trim().toLowerCase();
  const currentPlanName = resolvePlanDisplayName(currentPlanId);
  const nombre = String(row?.nombre || "-").trim();
  const negocio = String(row?.nombreNegocio || "-").trim();
  const tenantId = String(row?.tenantId || "").trim();
  const tenantText = tenantId ? `Tenant: ${tenantId}` : "Sin tenant asignado";
  changePlanCurrentMetaNode.textContent =
    `Usuario: ${nombre} | Negocio: ${negocio} | ${tenantText} | Plan actual: ${currentPlanName} (${currentPlanId || "-"})`;
}

function buildChangePlanPreviewMessage() {
  const row = getSelectedChangePlanUserRow();
  if (!row || !selectedChangePlanUserUid) {
    return "Selecciona un usuario para ver los cambios que se aplicaran en Firebase.";
  }
  if (!selectedChangePlanTenantId) {
    return "El usuario seleccionado no tiene tenant asignado. No se puede cambiar plan.";
  }

  const currentPlanId =
    normalizePlanId(selectedChangePlanCurrentPlanId || row?.planActual) ||
    String(selectedChangePlanCurrentPlanId || row?.planActual || "").trim().toLowerCase();
  const targetPlanId =
    normalizePlanId(selectedChangePlanTargetPlanId || changePlanPlanSelect?.value || "") ||
    String(selectedChangePlanTargetPlanId || changePlanPlanSelect?.value || "").trim().toLowerCase();

  if (!targetPlanId || targetPlanId === currentPlanId) {
    return "Selecciona un plan diferente para ver los cambios que se aplicaran en Firebase.";
  }

  const lines = [];
  lines.push("Cambios que se aplicaran en Firebase:");
  lines.push(`tenants/${selectedChangePlanTenantId}/planId: \"${currentPlanId || "-"}\" -> \"${targetPlanId}\"`);
  lines.push(`tenants/${selectedChangePlanTenantId}/planActual: \"${currentPlanId || "-"}\" -> \"${targetPlanId}\"`);
  lines.push(`adminManageAccounts/${selectedChangePlanUserUid}/planActual: \"${currentPlanId || "-"}\" -> \"${targetPlanId}\"`);

  const targetPlan = allPlans.find((plan) => plan.id === targetPlanId) || null;
  const trialControl =
    targetPlan && targetPlan.id === TRIAL_PLAN_ID ? normalizeTrialControl(targetPlan?.trialControl) : null;
  if (trialControl) {
    lines.push(
      `tenants/${selectedChangePlanTenantId}/trialControl/trialAccessAllowed: ${String(
        Boolean(trialControl.trialAccessAllowed)
      )}`
    );
    lines.push(
      `tenants/${selectedChangePlanTenantId}/trialControl/trialWarningEnabled: ${String(
        Boolean(trialControl.trialWarningEnabled)
      )}`
    );
    lines.push(
      `tenants/${selectedChangePlanTenantId}/trialControl/trialWarningText: \"${String(
        trialControl.trialWarningText || ""
      )}\"`
    );
    lines.push(
      `tenants/${selectedChangePlanTenantId}/trialControl/trialWarningCtaLabel: \"${String(
        trialControl.trialWarningCtaLabel || ""
      )}\"`
    );
    lines.push(
      `tenants/${selectedChangePlanTenantId}/trialControl/trialWarningCtaUrl: \"${String(
        trialControl.trialWarningCtaUrl || ""
      )}\"`
    );
  }

  return lines.join("\n");
}

function renderChangePlanPreview() {
  if (!changePlanPreviewNode) return;
  changePlanPreviewNode.textContent = buildChangePlanPreviewMessage();
}

function syncChangePlanSaveState() {
  if (!changePlanSaveBtn) return;
  const currentPlanId =
    normalizePlanId(selectedChangePlanCurrentPlanId) ||
    String(selectedChangePlanCurrentPlanId || "").trim().toLowerCase();
  const targetPlanId =
    normalizePlanId(selectedChangePlanTargetPlanId || changePlanPlanSelect?.value || "") ||
    String(selectedChangePlanTargetPlanId || changePlanPlanSelect?.value || "").trim().toLowerCase();
  const canSave =
    Boolean(selectedChangePlanUserUid) &&
    Boolean(selectedChangePlanTenantId) &&
    Boolean(targetPlanId) &&
    targetPlanId !== currentPlanId;
  changePlanSaveBtn.disabled = !canSave;
}

function setChangePlanFeedback(message) {
  if (!changePlanFeedbackNode) return;
  changePlanFeedbackNode.textContent = String(message || "");
}

function handleChangePlanUserSelectChange() {
  const uid = String(changePlanUserSelect?.value || "").trim();
  const selectedUser = getChangePlanSelectableUsers().find((item) => item.uid === uid) || null;
  selectedChangePlanUserUid = uid;
  selectedChangePlanTenantId = selectedUser?.tenantId || "";
  selectedChangePlanCurrentPlanId = selectedUser?.currentPlanId || "";
  selectedChangePlanTargetPlanId = "";
  setChangePlanFeedback("");
  renderChangePlanPlanOptions();
}

function handleChangePlanPlanSelectChange() {
  selectedChangePlanTargetPlanId = normalizePlanId(changePlanPlanSelect?.value || "") || "";
  setChangePlanFeedback("");
  renderChangePlanPreview();
  syncChangePlanSaveState();
}

async function handleChangePlanSaveClick() {
  if (!auth.currentUser) return;
  const row = getSelectedChangePlanUserRow();
  const uid = String(selectedChangePlanUserUid || "").trim();
  const tenantId = String(selectedChangePlanTenantId || "").trim();
  const currentPlanId =
    normalizePlanId(selectedChangePlanCurrentPlanId || row?.planActual) ||
    String(selectedChangePlanCurrentPlanId || row?.planActual || "").trim().toLowerCase();
  const targetPlanId =
    normalizePlanId(selectedChangePlanTargetPlanId || changePlanPlanSelect?.value || "") ||
    String(selectedChangePlanTargetPlanId || changePlanPlanSelect?.value || "").trim().toLowerCase();

  if (!row || !uid || !tenantId) {
    setChangePlanFeedback("Selecciona un usuario valido para cambiar plan.");
    return;
  }
  if (!targetPlanId || targetPlanId === currentPlanId) {
    setChangePlanFeedback("Selecciona un plan distinto al actual.");
    return;
  }

  const targetPlanName = resolvePlanDisplayName(targetPlanId);
  const confirmed = window.confirm(
    `Vas a cambiar el plan de ${row?.nombre || "-"} (${row?.nombreNegocio || "-"}) a ${targetPlanName} (${targetPlanId}). Deseas continuar?`
  );
  if (!confirmed) return;

  if (changePlanSaveBtn) changePlanSaveBtn.disabled = true;
  setChangePlanFeedback("Guardando cambio de plan...");
  try {
    const token = await auth.currentUser.getIdToken(true);
    const response = await fetchWithLoading(getAdminAccountsEndpoint(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        action: "update_user_plan",
        targetType: "employer",
        uid,
        tenantId,
        planId: targetPlanId,
        planActual: targetPlanId
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudo cambiar el plan del usuario.");
    }

    const resolvedPlanId =
      normalizePlanId(
        result?.tenant?.planId || result?.tenant?.planActual || result?.employer?.planActual || targetPlanId
      ) || targetPlanId;
    const hasTrialControl =
      typeof result?.tenant?.trialControl === "object" && result?.tenant?.trialControl !== null;

    selectedChangePlanCurrentPlanId = resolvedPlanId;
    selectedChangePlanTargetPlanId = resolvedPlanId;

    allUserRows = allUserRows.map((userRow) => {
      if (String(userRow?.uid || "").trim() !== uid) return userRow;
      return {
        ...userRow,
        planActual: resolvedPlanId,
        trialAccessAllowed: hasTrialControl
          ? toTrialBoolean(result?.tenant?.trialControl?.trialAccessAllowed, userRow?.trialAccessAllowed)
          : userRow?.trialAccessAllowed,
        trialWarningEnabled: hasTrialControl
          ? toTrialBoolean(result?.tenant?.trialControl?.trialWarningEnabled, userRow?.trialWarningEnabled)
          : userRow?.trialWarningEnabled,
        trialControlLoaded: hasTrialControl ? true : userRow?.trialControlLoaded
      };
    });

    if (selectedUserRow && String(selectedUserRow?.uid || "").trim() === uid) {
      selectedUserRow = {
        ...selectedUserRow,
        planActual: resolvedPlanId,
        trialAccessAllowed: hasTrialControl
          ? toTrialBoolean(
              result?.tenant?.trialControl?.trialAccessAllowed,
              selectedUserRow?.trialAccessAllowed
            )
          : selectedUserRow?.trialAccessAllowed,
        trialWarningEnabled: hasTrialControl
          ? toTrialBoolean(
              result?.tenant?.trialControl?.trialWarningEnabled,
              selectedUserRow?.trialWarningEnabled
            )
          : selectedUserRow?.trialWarningEnabled,
        trialControlLoaded: hasTrialControl ? true : selectedUserRow?.trialControlLoaded
      };
      renderSelectedUserActions();
    }

    applyUsersFilter();
    renderManagerUserOptions();
    renderChangePlanUserOptions();
    setChangePlanFeedback(
      `Plan actualizado correctamente a ${resolvePlanDisplayName(resolvedPlanId)} (${resolvedPlanId}).`
    );
    showGlobalToast("Plan actualizado correctamente.");
  } catch (error) {
    console.error(error);
    setChangePlanFeedback(error.message || "No se pudo cambiar el plan del usuario.");
    showGlobalToast(error.message || "No se pudo cambiar el plan del usuario.", "error");
  } finally {
    syncChangePlanSaveState();
  }
}

function renderImportTargetUserOptions(activeUsers) {
  if (!importTargetUserSelect) return;
  const list = Array.isArray(activeUsers) ? activeUsers : [];
  const previousUid = selectedImportTargetUserUid;
  const nextUid =
    previousUid && list.some((item) => item.uid === previousUid)
      ? previousUid
      : list[0]?.uid || "";
  const selectedUser = list.find((item) => item.uid === nextUid) || null;

  selectedImportTargetUserUid = nextUid;
  selectedImportTargetTenantId = selectedUser?.tenantId || "";
  importTargetUserSelect.innerHTML =
    `<option value="">Selecciona un usuario...</option>` +
    list
      .map(
        (item) =>
          `<option value="${escapeHtml(item.uid)}"${item.uid === selectedImportTargetUserUid ? " selected" : ""}>${escapeHtml(item.label)}</option>`
      )
      .join("");
  importTargetUserSelect.disabled = list.length === 0;
  if (importBackupTypeSelect) {
    importBackupTypeSelect.disabled = list.length === 0;
    if (!importBackupTypeSelect.value) {
      importBackupTypeSelect.value = selectedImportBackupType || "sales";
    }
    selectedImportBackupType =
      normalizeBackupType(importBackupTypeSelect.value || selectedImportBackupType || "sales") || "sales";
  }
}

function handleEmployeesUserSelectChange() {
  const uid = String(employeesUserSelect?.value || "").trim();
  const row = allUserRows.find((entry) => String(entry?.uid || "").trim() === uid);
  selectedEmployeesUserUid = uid;
  selectedEmployeesTenantId = String(row?.tenantId || "").trim();
  selectedEmployees = [];
  void loadEmployeesForSelectedUser();
}

function handleProductsSearchInput() {
  if (productsSearchDebounce) {
    clearTimeout(productsSearchDebounce);
  }
  productsSearchDebounce = setTimeout(() => {
    void loadProductsForSelectedUser();
  }, 300);
}

async function loadProductsForSelectedUser(options = {}) {
  if (!auth.currentUser) return;
  if (!selectedProductsTenantId) {
    allProductRows = [];
    setProductsPlaceholder("Selecciona un usuario en Administrador para ver productos.");
    setProductsFeedback("");
    return;
  }

  const forceRemote = options?.forceRemote === true;
  const requestId = ++latestProductsRequestId;
  const query = String(productsSearchInput?.value || "").trim();
  setProductsFeedback(forceRemote ? "Actualizando productos desde Firebase..." : "Buscando productos...");
  if (productsTableBody) {
    productsTableBody.innerHTML = '<tr><td colspan="6">Cargando productos...</td></tr>';
  }

  try {
    let sourceRows = [];
    let source = "cache";
    if (!forceRemote) {
      sourceRows = await getCachedSectionRows("products", selectedProductsTenantId);
    }
    if (forceRemote || !sourceRows.length) {
      sourceRows = await fetchProductsRowsByTenant(selectedProductsTenantId);
      source = "remote";
      await saveCachedSectionRows("products", selectedProductsTenantId, sourceRows);
    }
    if (requestId !== latestProductsRequestId) return;

    const normalizedRows = normalizeProductRows(sourceRows);
    allProductRows = applyProductsQuery(normalizedRows, query);
    renderProductsTable(allProductRows);
    if (!normalizedRows.length) {
      setProductsPlaceholder("No hay productos para este usuario.");
      setProductsFeedback("No hay productos para este usuario.");
      return;
    }
    setProductsFeedback(
      allProductRows.length
        ? source === "cache"
          ? `${allProductRows.length} producto(s) desde cache local.`
          : `${allProductRows.length} producto(s) actualizados desde Firebase.`
        : "Sin coincidencias para la busqueda."
    );
  } catch (error) {
    console.error(error);
    if (requestId !== latestProductsRequestId) return;
    allProductRows = [];
    setProductsPlaceholder(error.message || "No se pudieron cargar productos.");
    setProductsFeedback(error.message || "No se pudieron cargar productos.");
  }
}

async function fetchProductsRowsByTenant(tenantId) {
  if (!auth.currentUser) return [];
  const token = await auth.currentUser.getIdToken(true);
  const params = new URLSearchParams({
    tenantId: String(tenantId || "").trim()
  });
  const response = await fetchWithLoading(`${getAdminProductsEndpoint()}?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result?.error || "No se pudieron cargar los productos.");
  }
  return Array.isArray(result?.products || result?.rows) ? result.products || result.rows : [];
}

function applyProductsQuery(rows, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return Array.isArray(rows) ? rows : [];
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    const blob = [row?.codigo, row?.nombre, row?.categoria]
      .map((entry) => normalizeText(entry))
      .join(" ");
    return blob.includes(normalizedQuery);
  });
}

function normalizeProductRows(source) {
  if (!Array.isArray(source)) return [];
  return source
    .map((row) => {
      const codigo = String(row?.codigo || row?.barcode || row?.id || "").trim();
      const nombre = String(row?.nombre || row?.name || "").trim();
      const categoria = String(row?.categoria || row?.category || "").trim();
      const stock = Number(row?.stock || 0);
      const precioVenta = Number(row?.precioVenta ?? row?.price ?? 0);
      const precioCompra = Number(row?.precioCompra ?? row?.providerCost ?? row?.costoProveedor ?? 0);
      return {
        codigo: codigo || "-",
        nombre: nombre || "-",
        categoria: categoria || "-",
        stock: Number.isFinite(stock) ? stock : 0,
        precioVenta: Number.isFinite(precioVenta) ? precioVenta : 0,
        precioCompra: Number.isFinite(precioCompra) ? precioCompra : 0
      };
    })
    .sort((a, b) => {
      const byCategory = String(a.categoria || "").localeCompare(String(b.categoria || ""));
      if (byCategory !== 0) return byCategory;
      return String(a.nombre || "").localeCompare(String(b.nombre || ""));
    });
}

function renderProductsTable(rows) {
  if (!productsTableBody) return;
  if (!rows.length) {
    setProductsPlaceholder("No hay productos para este usuario.");
    return;
  }

  productsTableBody.innerHTML = rows
    .map((row) =>
      [
        "<tr>",
        `<td>${escapeHtml(row.codigo)}</td>`,
        `<td>${escapeHtml(row.nombre)}</td>`,
        `<td>${escapeHtml(row.categoria)}</td>`,
        `<td>${Number(row.stock || 0)}</td>`,
        `<td>${escapeHtml(formatMoney(row.precioVenta))}</td>`,
        `<td>${escapeHtml(formatMoney(row.precioCompra))}</td>`,
        "</tr>"
      ].join("")
    )
    .join("");
}

function handleSalesSearchInput() {
  if (salesSearchDebounce) {
    clearTimeout(salesSearchDebounce);
  }
  salesSearchDebounce = setTimeout(() => {
    void loadSalesForSelectedUser();
  }, 300);
}

async function loadSalesForSelectedUser(options = {}) {
  if (!auth.currentUser) return;
  if (!selectedSalesTenantId) {
    allSalesRows = [];
    setSalesPlaceholder("Selecciona un usuario en Administrador para ver ventas.");
    setSalesFeedback("");
    return;
  }

  const forceRemote = options?.forceRemote === true;
  const requestId = ++latestSalesRequestId;
  const query = String(salesSearchInput?.value || "").trim();
  setSalesFeedback(forceRemote ? "Actualizando ventas desde Firebase..." : "Buscando ventas...");
  if (salesTableBody) {
    salesTableBody.innerHTML = '<tr><td colspan="6">Cargando ventas...</td></tr>';
  }

  try {
    let sourceRows = [];
    let source = "cache";
    if (!forceRemote) {
      sourceRows = await getCachedSectionRows("sales", selectedSalesTenantId);
    }
    if (forceRemote || !sourceRows.length) {
      sourceRows = await fetchSalesRowsByTenant(selectedSalesTenantId);
      source = "remote";
      await saveCachedSectionRows("sales", selectedSalesTenantId, sourceRows);
    }
    if (requestId !== latestSalesRequestId) return;

    const normalizedRows = normalizeSalesRows(sourceRows);
    allSalesRows = applySalesQuery(normalizedRows, query);
    renderSalesTable(allSalesRows);
    if (!normalizedRows.length) {
      setSalesPlaceholder("No hay ventas para este usuario.");
      setSalesFeedback("No hay ventas para este usuario.");
      return;
    }
    setSalesFeedback(
      allSalesRows.length
        ? source === "cache"
          ? `${allSalesRows.length} venta(s) desde cache local.`
          : `${allSalesRows.length} venta(s) actualizada(s) desde Firebase.`
        : "Sin coincidencias para la busqueda."
    );
  } catch (error) {
    console.error(error);
    if (requestId !== latestSalesRequestId) return;
    allSalesRows = [];
    setSalesPlaceholder(error.message || "No se pudieron cargar las ventas.");
    setSalesFeedback(error.message || "No se pudieron cargar las ventas.");
  }
}

async function fetchSalesRowsByTenant(tenantId) {
  if (!auth.currentUser) return [];
  const token = await auth.currentUser.getIdToken(true);
  const params = new URLSearchParams({
    tenantId: String(tenantId || "").trim()
  });
  const response = await fetchWithLoading(`${getAdminSalesEndpoint()}?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result?.error || "No se pudieron cargar las ventas.");
  }
  return Array.isArray(result?.sales || result?.rows) ? result.sales || result.rows : [];
}

function applySalesQuery(rows, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return Array.isArray(rows) ? rows : [];
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    const blob = [row?.id, row?.cliente, row?.vendedor, row?.metodoPago]
      .map((entry) => normalizeText(entry))
      .join(" ");
    return blob.includes(normalizedQuery);
  });
}

function normalizeSalesRows(source) {
  if (!Array.isArray(source)) return [];
  return source
    .map((row) => {
      const id = String(row?.id || row?.saleId || row?.ventaId || "").trim();
      const fechaRaw = row?.fecha || row?.createdAt || row?.timestamp || "";
      const cliente = String(row?.cliente || row?.customerName || row?.customer || "").trim();
      const vendedor = String(row?.vendedor || row?.employeeName || row?.employee || "").trim();
      const metodoPago = String(row?.metodoPago || row?.paymentMethod || "").trim();
      const total = Number(row?.total ?? row?.importeTotal ?? row?.amount ?? 0);
      const fechaTs = getTimestampFromUnknownDate(fechaRaw);
      return {
        id: id || "-",
        fecha: formatDate(fechaRaw),
        fechaTs,
        cliente: cliente || "-",
        vendedor: vendedor || "-",
        metodoPago: metodoPago || "-",
        total: Number.isFinite(total) ? total : 0
      };
    })
    .sort((a, b) => Number(b.fechaTs || 0) - Number(a.fechaTs || 0));
}

function renderSalesTable(rows) {
  if (!salesTableBody) return;
  if (!rows.length) {
    setSalesPlaceholder("No hay ventas para este usuario.");
    return;
  }

  const orderedRows = [...rows].sort((a, b) => Number(b.fechaTs || 0) - Number(a.fechaTs || 0));
  salesTableBody.innerHTML = orderedRows
    .map((row) =>
      [
        "<tr>",
        `<td>${escapeHtml(row.id)}</td>`,
        `<td>${escapeHtml(row.fecha)}</td>`,
        `<td>${escapeHtml(row.cliente)}</td>`,
        `<td>${escapeHtml(row.vendedor)}</td>`,
        `<td>${escapeHtml(row.metodoPago)}</td>`,
        `<td>${escapeHtml(formatMoney(row.total))}</td>`,
        "</tr>"
      ].join("")
    )
    .join("");
}

async function handleProductsBackupClick() {
  await runSectionBackupDownload({
    tenantId: selectedProductsTenantId,
    endpoint: getAdminProductsEndpoint(),
    responseKey: "products",
    normalizeRows: normalizeProductRows,
    suffix: "productos",
    emptyMessage: "No hay productos para respaldar.",
    successLabel: "productos",
    setFeedback: setProductsFeedback
  });
}

async function handleSalesBackupClick() {
  await runSectionBackupDownload({
    tenantId: selectedSalesTenantId,
    endpoint: getAdminSalesEndpoint(),
    responseKey: "sales",
    normalizeRows: normalizeSalesRows,
    suffix: "Ventas",
    emptyMessage: "No hay ventas para respaldar.",
    successLabel: "ventas",
    setFeedback: setSalesFeedback
  });
}

async function handleCashboxesBackupClick() {
  await runSectionBackupDownload({
    tenantId: selectedCashboxesTenantId,
    endpoint: getAdminCashboxesEndpoint(),
    responseKey: "cashboxes",
    normalizeRows: normalizeCashboxesRows,
    suffix: "caja",
    emptyMessage: "No hay cajas para respaldar.",
    successLabel: "cajas",
    setFeedback: setCashboxesFeedback
  });
}

function handleCashboxesSearchInput() {
  if (cashboxesSearchDebounce) {
    clearTimeout(cashboxesSearchDebounce);
  }
  cashboxesSearchDebounce = setTimeout(() => {
    void loadCashboxesForSelectedUser();
  }, 300);
}

function handleBackupsSearchInput() {
  if (backupsSearchDebounce) {
    clearTimeout(backupsSearchDebounce);
  }
  backupsSearchDebounce = setTimeout(() => {
    void loadBackupsForSelectedUser();
  }, 300);
}

function handleImportTargetUserSelectChange() {
  const uid = String(importTargetUserSelect?.value || "").trim();
  const row = getActiveScopedUsers().find((entry) => String(entry?.uid || "").trim() === uid) || null;
  selectedImportTargetUserUid = uid;
  selectedImportTargetTenantId = String(row?.tenantId || "").trim();
  syncBackupButtonsState();
}

function handleImportBackupTypeSelectChange() {
  selectedImportBackupType = normalizeBackupType(importBackupTypeSelect?.value || "sales") || "sales";
  if (importPreviewRows.length) {
    renderImportPreviewTable(importPreviewRows);
  }
  syncBackupButtonsState();
}

function getSelectedImportBackupFile() {
  return importBackupFileInput?.files?.[0] || null;
}

async function handleImportBackupFileInputChange() {
  const file = getSelectedImportBackupFile();
  if (!file) {
    clearImportPreviewState({ keepFeedback: true, keepFileInput: true });
    setImportBackupFeedback("Selecciona un archivo backup .json para simular la carga.");
    syncBackupButtonsState();
    return;
  }

  setImportBackupFeedback("Leyendo archivo backup para simulacion...");
  try {
    const backupPayload = await readJsonFile(file);
    const rows = extractBackupRows(backupPayload);
    if (!rows.length) {
      throw new Error("El backup no contiene elementos para mostrar en la simulacion.");
    }
    importPreviewPayload = backupPayload;
    importPreviewRows = rows;
    renderImportPreviewTable(rows);
    const maxPreviewRows = Math.min(rows.length, 300);
    const truncationText =
      rows.length > maxPreviewRows ? ` Mostrando ${maxPreviewRows} de ${rows.length} elementos.` : "";
    setImportBackupFeedback(`Simulacion lista para ${rows.length} elemento(s).${truncationText}`);
  } catch (error) {
    console.error(error);
    clearImportPreviewState({ keepFeedback: true, keepFileInput: true });
    setImportBackupFeedback(error.message || "No se pudo generar la simulacion del backup.");
  }
  syncBackupButtonsState();
}

async function handleImportConfirmClick() {
  await handleImportBackupByType(selectedImportBackupType || "sales");
}

function handleImportCancelClick() {
  clearImportPreviewState();
  setImportBackupFeedback("Carga cancelada.");
  showGlobalToast("Carga cancelada.", "warning");
}

async function handleImportBackupByType(backupType) {
  if (!auth.currentUser) return;
  if (!selectedImportTargetTenantId) {
    setImportBackupFeedback("Selecciona un usuario destino para cargar el backup.");
    return;
  }
  const normalizedType = normalizeBackupType(backupType || importBackupTypeSelect?.value || "sales");
  if (!normalizedType) {
    setImportBackupFeedback("Selecciona el tipo de datos a cargar.");
    return;
  }
  if (!importPreviewPayload || !importPreviewRows.length) {
    setImportBackupFeedback("Primero simula el backup cargando un archivo .json.");
    return;
  }

  const file = getSelectedImportBackupFile();
  setImportBackupFeedback("Cargando datos en el usuario destino...");
  try {
    const token = await auth.currentUser.getIdToken(true);
    const response = await fetchWithLoading(getAdminImportBackupEndpoint(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        backupType: normalizedType,
        targetTenantId: selectedImportTargetTenantId,
        targetUserUid: selectedImportTargetUserUid,
        fileName: String(file?.name || ""),
        backupPayload: importPreviewPayload
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudo importar el backup.");
    }

    const imported = Number(result?.imported || 0);
    const resolvedType = String(result?.backupType || normalizedType || "").trim();
    const collectionName = String(result?.collection || "").trim();
    const message = [
      `Importacion completada.`,
      `${imported} registro(s) cargado(s).`,
      collectionName ? `Coleccion: ${collectionName}.` : "",
      resolvedType ? `Tipo: ${resolvedType}.` : ""
    ]
      .filter(Boolean)
      .join(" ");
    setImportBackupFeedback(message);
    showGlobalToast(`${imported} registro(s) importado(s).`);
    clearImportPreviewState({ keepFeedback: true, keepFileInput: false });
    await invalidateImportedTypeCache(resolvedType, selectedImportTargetTenantId);
    void refreshImportedSectionData(resolvedType, selectedImportTargetTenantId);
  } catch (error) {
    console.error(error);
    setImportBackupFeedback(error.message || "No se pudo importar el backup.");
    showGlobalToast(error.message || "No se pudo importar el backup.", "error");
  }
}

function clearImportPreviewState(options = {}) {
  importPreviewPayload = null;
  importPreviewRows = [];
  if (!options.keepFileInput && importBackupFileInput) {
    importBackupFileInput.value = "";
  }
  setImportPreviewPlaceholder("Selecciona un archivo para simular la carga.");
  if (!options.keepFeedback) {
    setImportBackupFeedback("");
  }
  syncBackupButtonsState();
}

function renderImportPreviewTable(rows) {
  if (!importPreviewTableBody) return;
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) {
    setImportPreviewPlaceholder("Sin elementos para mostrar.");
    return;
  }

  const maxRows = 300;
  const visibleRows = list.slice(0, maxRows);
  importPreviewTableBody.innerHTML = visibleRows
    .map((row, index) => {
      const source = resolveImportPreviewSourceRow(row);
      const id = resolveImportPreviewId(source);
      const tenant = resolveImportPreviewTenant(source);
      const summary = summarizeImportPreviewRow(source, selectedImportBackupType);
      return [
        "<tr>",
        `<td>${index + 1}</td>`,
        `<td>${escapeHtml(id)}</td>`,
        `<td>${escapeHtml(tenant)}</td>`,
        `<td>${escapeHtml(summary)}</td>`,
        "</tr>"
      ].join("");
    })
    .join("");
}

function resolveImportPreviewSourceRow(row) {
  if (isObjectRecord(row?.raw)) return row.raw;
  return row;
}

function resolveImportPreviewId(row) {
  if (!isObjectRecord(row)) return "-";
  const candidates = [
    row.id,
    row.ventaId,
    row.saleId,
    row.cajaId,
    row.cashboxId,
    row.codigo,
    row.barcode,
    row.docId,
    row.uid
  ];
  for (const candidate of candidates) {
    const text = String(candidate || "").trim();
    if (text && text !== "-") return text;
  }
  return "-";
}

function resolveImportPreviewTenant(row) {
  if (!isObjectRecord(row)) return "-";
  const candidates = [row.tenantId, row.tenant_id, row.idTenant, row.tenant];
  for (const candidate of candidates) {
    const text = String(candidate || "").trim();
    if (text && text !== "-") return text;
  }
  return "-";
}

function summarizeImportPreviewRow(row, backupType) {
  if (!isObjectRecord(row)) {
    return String(row ?? "-").slice(0, 180);
  }

  const type = normalizeBackupType(backupType);
  if (type === "products") {
    const name = String(row?.nombre || row?.name || "-").trim();
    const category = String(row?.categoria || row?.category || "-").trim();
    const stock = Number(row?.stock ?? 0);
    return `${name} | cat: ${category} | stock: ${Number.isFinite(stock) ? stock : 0}`.slice(0, 180);
  }
  if (type === "sales") {
    const date = formatDate(row?.fecha || row?.createdAt || row?.timestamp || "");
    const payment = String(row?.metodoPago || row?.paymentMethod || "-").trim();
    const total = Number(row?.total ?? row?.importeTotal ?? row?.amount ?? 0);
    return `${date} | pago: ${payment} | total: ${formatMoney(Number.isFinite(total) ? total : 0)}`.slice(
      0,
      180
    );
  }
  if (type === "cashboxes") {
    const status = String(row?.estado || row?.status || "-").trim();
    const owner = String(row?.responsable || row?.employeeName || row?.owner || "-").trim();
    const balance = Number(row?.saldoFinal ?? row?.balance ?? row?.finalBalance ?? 0);
    return `${status} | resp: ${owner} | saldo: ${formatMoney(Number.isFinite(balance) ? balance : 0)}`.slice(
      0,
      180
    );
  }

  const keys = Object.keys(row).slice(0, 3);
  const summary = keys
    .map((key) => {
      const value = row[key];
      if (value === null || value === undefined) return `${key}: -`;
      if (typeof value === "object") return `${key}: [obj]`;
      return `${key}: ${String(value)}`;
    })
    .join(" | ");
  return summary.slice(0, 180) || "-";
}

async function refreshImportedSectionData(backupType, tenantId) {
  const normalizedType = normalizeBackupType(backupType);
  if (!normalizedType || !tenantId) return;

  if (normalizedType === "products" && selectedProductsTenantId === tenantId) {
    await loadProductsForSelectedUser();
    return;
  }
  if (normalizedType === "sales" && selectedSalesTenantId === tenantId) {
    await loadSalesForSelectedUser();
    return;
  }
  if (normalizedType === "cashboxes" && selectedCashboxesTenantId === tenantId) {
    await loadCashboxesForSelectedUser({ forceRemote: true });
    return;
  }
}

async function invalidateImportedTypeCache(backupType, tenantId) {
  const normalizedType = normalizeBackupType(backupType);
  const safeTenantId = String(tenantId || "").trim();
  if (!normalizedType || !safeTenantId) return;

  if (normalizedType === "cashboxes") {
    await saveCachedCashboxesRows(safeTenantId, []);
    return;
  }

  if (normalizedType === "products" || normalizedType === "sales" || normalizedType === "backups") {
    await saveCachedSectionRows(normalizedType, safeTenantId, []);
  }
}

function normalizeBackupType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === "productos" || normalized === "producto" || normalized === "products") {
    return "products";
  }
  if (normalized === "ventas" || normalized === "venta" || normalized === "sales") {
    return "sales";
  }
  if (
    normalized === "cajas" ||
    normalized === "caja" ||
    normalized === "cashboxes" ||
    normalized === "cashbox"
  ) {
    return "cashboxes";
  }
  return normalized;
}

function extractBackupRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se encontro archivo de backup."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = String(reader.result || "").trim();
        if (!content) {
          reject(new Error("El archivo backup esta vacio."));
          return;
        }
        const parsed = JSON.parse(content);
        resolve(parsed);
      } catch (error) {
        reject(new Error("El archivo no tiene formato JSON valido."));
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo backup."));
    reader.readAsText(file, "utf-8");
  });
}

async function loadCashboxesForSelectedUser(options = {}) {
  if (!auth.currentUser) return;
  if (!selectedCashboxesTenantId) {
    allCashboxesRows = [];
    allCashboxesSourceRows = [];
    selectedCashboxRowKey = "";
    selectedCashboxRow = null;
    renderSelectedCashboxDetail();
    setCashboxesPlaceholder("Selecciona un usuario en Administrador para ver cajas.");
    setCashboxesFeedback("");
    return;
  }

  const forceRemote = options?.forceRemote === true;
  const requestId = ++latestCashboxesRequestId;
  const query = String(cashboxesSearchInput?.value || "").trim();
  setCashboxesFeedback(forceRemote ? "Actualizando cajas desde Firebase..." : "Buscando cajas...");
  if (cashboxesTableBody) {
    cashboxesTableBody.innerHTML = '<tr><td colspan="7">Cargando cajas...</td></tr>';
  }

  try {
    let sourceRows = [];
    let source = "remote";
    try {
      sourceRows = await fetchCashboxesRowsByTenant(selectedCashboxesTenantId);
      await saveCachedCashboxesRows(selectedCashboxesTenantId, sourceRows);
    } catch (remoteError) {
      if (forceRemote) {
        throw remoteError;
      }
      sourceRows = await getCachedCashboxesRows(selectedCashboxesTenantId);
      if (!sourceRows.length) {
        throw remoteError;
      }
      source = "cache";
    }
    if (requestId !== latestCashboxesRequestId) return;

    allCashboxesSourceRows = normalizeCashboxesRows(sourceRows);
    allCashboxesRows = applyCashboxesQuery(allCashboxesSourceRows, query);
    renderCashboxesTable(allCashboxesRows);

    if (!allCashboxesSourceRows.length) {
      setCashboxesPlaceholder("No hay cajas para este usuario.");
      setCashboxesFeedback("No hay cajas para este usuario.");
      selectedCashboxRowKey = "";
      selectedCashboxRow = null;
      renderSelectedCashboxDetail();
      return;
    }

    if (!allCashboxesRows.length) {
      setCashboxesFeedback("Sin coincidencias para la busqueda.");
      selectedCashboxRowKey = "";
      selectedCashboxRow = null;
      renderSelectedCashboxDetail();
      return;
    }

    if (selectedCashboxRowKey) {
      selectedCashboxRow =
        allCashboxesSourceRows.find((row) => row.rowKey === selectedCashboxRowKey) || null;
      if (!selectedCashboxRow) {
        selectedCashboxRowKey = "";
      }
    }
    renderSelectedCashboxDetail();
    setCashboxesFeedback(
      allCashboxesRows.length
        ? source === "cache"
          ? `${allCashboxesRows.length} caja(s) desde cache local.`
          : `${allCashboxesRows.length} caja(s) actualizada(s) desde Firebase.`
        : "Sin coincidencias para la busqueda."
    );
  } catch (error) {
    console.error(error);
    if (requestId !== latestCashboxesRequestId) return;
    allCashboxesRows = [];
    allCashboxesSourceRows = [];
    selectedCashboxRowKey = "";
    selectedCashboxRow = null;
    renderSelectedCashboxDetail();
    setCashboxesPlaceholder(error.message || "No se pudieron cargar las cajas.");
    setCashboxesFeedback(error.message || "No se pudieron cargar las cajas.");
  }
}

async function fetchCashboxesRowsByTenant(tenantId) {
  if (!auth.currentUser) return [];
  const token = await auth.currentUser.getIdToken(true);
  const params = new URLSearchParams({
    tenantId: String(tenantId || "").trim()
  });
  const response = await fetchWithLoading(`${getAdminCashboxesEndpoint()}?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result?.error || "No se pudieron cargar las cajas.");
  }
  return Array.isArray(result?.cashboxes || result?.rows) ? result.cashboxes || result.rows : [];
}

async function loadBackupsForSelectedUser(options = {}) {
  if (!auth.currentUser) return;
  if (!selectedBackupsTenantId) {
    allBackupsRows = [];
    selectedBackupRowPath = "";
    selectedBackupRow = null;
    setBackupsPlaceholder("Selecciona un usuario en Administrador para ver backups.");
    setBackupsFeedback("");
    renderBackupSalesTable([]);
    setBackupSalesFeedback("Selecciona un backup para ver sus ventas.");
    syncBackupButtonsState();
    return;
  }

  const forceRemote = options?.forceRemote === true;
  const requestId = ++latestBackupsRequestId;
  const query = String(backupsSearchInput?.value || "").trim();
  setBackupsFeedback(forceRemote ? "Actualizando backups desde Firebase..." : "Buscando backups...");
  if (backupsTableBody) {
    backupsTableBody.innerHTML = '<tr><td colspan="5">Cargando backups...</td></tr>';
  }

  try {
    let sourceRows = [];
    let source = "cache";
    if (!forceRemote) {
      sourceRows = await getCachedSectionRows("backups", selectedBackupsTenantId);
    }
    if (forceRemote || !sourceRows.length) {
      sourceRows = await fetchBackupsRowsByTenant(selectedBackupsTenantId);
      source = "remote";
      await saveCachedSectionRows("backups", selectedBackupsTenantId, sourceRows);
    }
    if (requestId !== latestBackupsRequestId) return;

    const normalizedRows = normalizeBackupRows(sourceRows);
    allBackupsRows = applyBackupsQuery(normalizedRows, query);
    renderBackupsTable(allBackupsRows);
    if (!normalizedRows.length) {
      setBackupsPlaceholder("No hay backups para este usuario.");
      setBackupsFeedback("No hay backups para este usuario.");
    } else {
      setBackupsFeedback(
        allBackupsRows.length
          ? source === "cache"
            ? `${allBackupsRows.length} backup(s) desde cache local.`
            : `${allBackupsRows.length} backup(s) actualizados desde Firebase.`
          : query
            ? "Sin coincidencias para la busqueda."
            : "Sin backups para este usuario."
      );
    }

    if (selectedBackupRowPath) {
      selectedBackupRow =
        allBackupsRows.find((row) => String(row?.path || "") === selectedBackupRowPath) || null;
      if (!selectedBackupRow) {
        selectedBackupRowPath = "";
        renderBackupSalesTable([]);
        setBackupSalesFeedback("Selecciona un backup para ver sus ventas.");
      }
    }
    syncBackupButtonsState();
  } catch (error) {
    console.error(error);
    if (requestId !== latestBackupsRequestId) return;
    allBackupsRows = [];
    selectedBackupRowPath = "";
    selectedBackupRow = null;
    setBackupsPlaceholder(error.message || "No se pudieron cargar los backups.");
    setBackupsFeedback(error.message || "No se pudieron cargar los backups.");
    renderBackupSalesTable([]);
    setBackupSalesFeedback("Selecciona un backup para ver sus ventas.");
    syncBackupButtonsState();
  }
}

async function fetchBackupsRowsByTenant(tenantId) {
  if (!auth.currentUser) return [];
  const token = await auth.currentUser.getIdToken(true);
  const params = new URLSearchParams({
    tenantId: String(tenantId || "").trim()
  });
  const response = await fetchWithLoading(`${getAdminBackupsEndpoint()}?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result?.error || "No se pudieron cargar los backups.");
  }
  return Array.isArray(result?.backups || result?.rows) ? result.backups || result.rows : [];
}

function normalizeBackupRows(source) {
  if (!Array.isArray(source)) return [];
  return source
    .map((row) => {
      const path = String(row?.path || row?.id || "").trim();
      const nombreArchivo = String(row?.nombreArchivo || row?.fileName || path.split("/").pop() || "")
        .trim();
      const usuario = String(row?.usuario || "-").trim();
      const createdAtRaw = row?.createdAt || row?.updatedAt || row?.timestamp || "";
      const createdAtTs = getTimestampFromUnknownDate(createdAtRaw);
      const sizeBytes = Number(row?.sizeBytes || row?.size || 0);
      return {
        path,
        nombreArchivo: nombreArchivo || "-",
        usuario: usuario || "-",
        createdAt: formatDate(createdAtRaw),
        createdAtTs,
        sizeBytes: Number.isFinite(sizeBytes) && sizeBytes > 0 ? sizeBytes : 0
      };
    })
    .filter((row) => Boolean(row.path))
    .sort((a, b) => Number(b.createdAtTs || 0) - Number(a.createdAtTs || 0));
}

function applyBackupsQuery(rows, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return Array.isArray(rows) ? rows : [];
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    const blob = [row?.nombreArchivo, row?.usuario, row?.path]
      .map((entry) => normalizeText(entry))
      .join(" ");
    return blob.includes(normalizedQuery);
  });
}

function renderBackupsTable(rows) {
  if (!backupsTableBody) return;
  if (!rows.length) {
    setBackupsPlaceholder("No hay backups para este usuario.");
    return;
  }

  backupsTableBody.innerHTML = rows
    .map((row) => {
      const isSelected = selectedBackupRowPath && selectedBackupRowPath === row.path;
      return [
        `<tr data-backup-path="${escapeHtml(row.path)}"${isSelected ? ' class="is-selected"' : ""}>`,
        `<td>${escapeHtml(row.nombreArchivo)}</td>`,
        `<td>${escapeHtml(row.usuario)}</td>`,
        `<td>${escapeHtml(row.createdAt)}</td>`,
        `<td>${escapeHtml(formatBytes(row.sizeBytes))}</td>`,
        `<td><button type="button" class="mode-btn-secondary" data-backup-download="${escapeHtml(row.path)}">Descargar</button></td>`,
        "</tr>"
      ].join("");
    })
    .join("");
}

async function handleBackupRowClick(event) {
  const downloadBtnNode = event.target.closest("button[data-backup-download]");
  if (downloadBtnNode) {
    event.preventDefault();
    const path = String(downloadBtnNode.getAttribute("data-backup-download") || "").trim();
    if (!path) return;
    const row = allBackupsRows.find((entry) => entry.path === path) || null;
    await downloadBackupByPath(path, row?.nombreArchivo || "");
    return;
  }

  const rowNode = event.target.closest("tr[data-backup-path]");
  if (!rowNode) return;
  const path = String(rowNode.getAttribute("data-backup-path") || "").trim();
  if (!path) return;
  const row = allBackupsRows.find((entry) => entry.path === path);
  if (!row) return;

  selectedBackupRowPath = row.path;
  selectedBackupRow = row;
  renderBackupsTable(allBackupsRows);
  syncBackupButtonsState();
  await loadBackupSalesForPath(path);
}

async function loadBackupSalesForPath(path) {
  if (!auth.currentUser) return;
  if (!selectedBackupsTenantId || !path) return;

  setBackupSalesFeedback("Cargando ventas del backup...");
  renderBackupSalesTable([], "Cargando ventas...");
  try {
    const token = await auth.currentUser.getIdToken(true);
    const params = new URLSearchParams({
      tenantId: selectedBackupsTenantId,
      path: path,
      maxSales: "5000"
    });
    const response = await fetchWithLoading(`${getAdminReadBackupEndpoint()}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudieron leer las ventas del backup.");
    }
    const sales = normalizeBackupSalesRows(result?.sales || []);
    renderBackupSalesTable(sales);
    setBackupSalesFeedback(
      `${sales.length} venta(s) del backup ${selectedBackupRow?.nombreArchivo || ""}`.trim()
    );
  } catch (error) {
    console.error(error);
    renderBackupSalesTable([], error.message || "No se pudieron cargar las ventas del backup.");
    setBackupSalesFeedback(error.message || "No se pudieron cargar las ventas del backup.");
  }
}

function normalizeBackupSalesRows(source) {
  if (!Array.isArray(source)) return [];
  return source
    .map((row) => {
      const id = String(row?.id || row?.idVenta || "").trim();
      const createdAtRaw = row?.createdAt || row?.fecha || "";
      const createdAtTs = getTimestampFromUnknownDate(createdAtRaw);
      const usuario = String(row?.usuario || row?.usuarioNombre || "-").trim();
      const itemsCount = Number(row?.itemsCount || 0);
      const tipoPago = String(row?.tipoPago || row?.metodoPago || "-").trim();
      const total = Number(row?.total || 0);
      return {
        id: id || "-",
        createdAt: formatDate(createdAtRaw),
        createdAtTs,
        usuario: usuario || "-",
        itemsCount: Number.isFinite(itemsCount) ? itemsCount : 0,
        tipoPago: tipoPago || "-",
        total: Number.isFinite(total) ? total : 0
      };
    })
    .sort((a, b) => Number(b.createdAtTs || 0) - Number(a.createdAtTs || 0));
}

function renderBackupSalesTable(rows, emptyMessage = "Sin datos.") {
  if (!backupSalesTableBody) return;
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) {
    backupSalesTableBody.innerHTML = `<tr><td colspan="6">${escapeHtml(String(emptyMessage || "Sin datos."))}</td></tr>`;
    return;
  }
  backupSalesTableBody.innerHTML = list
    .map((row) =>
      [
        "<tr>",
        `<td>${escapeHtml(row.id)}</td>`,
        `<td>${escapeHtml(row.createdAt)}</td>`,
        `<td>${escapeHtml(row.usuario)}</td>`,
        `<td>${row.itemsCount}</td>`,
        `<td>${escapeHtml(row.tipoPago)}</td>`,
        `<td>${escapeHtml(formatMoney(row.total))}</td>`,
        "</tr>"
      ].join("")
    )
    .join("");
}

async function handleBackupDownloadClick() {
  if (!selectedBackupRowPath) {
    setBackupsFeedback("Selecciona un backup para descargar.");
    return;
  }
  await downloadBackupByPath(selectedBackupRowPath, selectedBackupRow?.nombreArchivo || "");
}

async function downloadBackupByPath(path, fileNameHint = "") {
  if (!auth.currentUser) return;
  if (!selectedBackupsTenantId || !path) return;

  setBackupsFeedback("Generando enlace de descarga...");
  try {
    const token = await auth.currentUser.getIdToken(true);
    const params = new URLSearchParams({
      tenantId: selectedBackupsTenantId,
      path: path
    });
    const response = await fetchWithLoading(
      `${getAdminBackupDownloadUrlEndpoint()}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok || !result?.url) {
      throw new Error(result?.error || "No se pudo generar el enlace de descarga.");
    }

    const link = document.createElement("a");
    link.href = String(result.url || "");
    link.target = "_blank";
    link.rel = "noopener";
    link.download = String(fileNameHint || path.split("/").pop() || "backup_ventas.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setBackupsFeedback(`Descarga iniciada: ${link.download}`);
  } catch (error) {
    console.error(error);
    setBackupsFeedback(error.message || "No se pudo descargar el backup.");
  }
}

function applyCashboxesQuery(rows, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return Array.isArray(rows) ? rows : [];
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    const blob = [row?.id, row?.responsable, row?.estado]
      .map((entry) => normalizeText(entry))
      .join(" ");
    return blob.includes(normalizedQuery);
  });
}

function normalizeCashboxesRows(source) {
  if (!Array.isArray(source)) return [];
  return source
    .map((row) => {
      const id = String(row?.id || row?.cashboxId || row?.cajaId || "").trim();
      const aperturaRaw = row?.apertura || row?.openedAt || row?.fechaApertura || "";
      const cierreRaw = row?.cierre || row?.closedAt || row?.fechaCierre || "";
      const responsable = String(row?.responsable || row?.employeeName || row?.owner || "").trim();
      const estado = String(row?.estado || row?.status || (cierreRaw ? "cerrada" : "abierta")).trim();
      const saldoFinal = Number(row?.saldoFinal ?? row?.balance ?? row?.finalBalance ?? 0);
      const salesCount = resolveCashboxSalesCount(row);
      const aperturaTs = getTimestampFromUnknownDate(aperturaRaw);
      const rowKey = `${id || "sin-id"}::${String(aperturaRaw || "")}::${String(cierreRaw || "")}`;
      return {
        rowKey,
        id: id || "-",
        apertura: formatDate(aperturaRaw),
        cierre: cierreRaw ? formatDate(cierreRaw) : "-",
        responsable: responsable || "-",
        estado: estado || "-",
        salesCount,
        saldoFinal: Number.isFinite(saldoFinal) ? saldoFinal : 0,
        aperturaTs,
        raw: row
      };
    })
    .sort((a, b) => b.aperturaTs - a.aperturaTs);
}

function renderCashboxesTable(rows) {
  if (!cashboxesTableBody) return;
  if (!rows.length) {
    setCashboxesPlaceholder("No hay cajas para este usuario.");
    return;
  }

  cashboxesTableBody.innerHTML = rows
    .map((row) =>
      [
        `<tr data-cashbox-key="${escapeHtml(row.rowKey)}"${selectedCashboxRowKey === row.rowKey ? ' class="is-selected"' : ""}>`,
        `<td>${escapeHtml(row.id)}</td>`,
        `<td>${escapeHtml(row.apertura)}</td>`,
        `<td>${escapeHtml(row.cierre)}</td>`,
        `<td>${escapeHtml(row.responsable)}</td>`,
        `<td>${escapeHtml(row.estado)}</td>`,
        `<td>${row.salesCount}</td>`,
        `<td>${escapeHtml(formatMoney(row.saldoFinal))}</td>`,
        "</tr>"
      ].join("")
    )
    .join("");
}

function handleCashboxRowClick(event) {
  const rowNode = event.target.closest("tr[data-cashbox-key]");
  if (!rowNode) return;
  const rowKey = String(rowNode.getAttribute("data-cashbox-key") || "").trim();
  if (!rowKey) return;
  const row = allCashboxesRows.find((entry) => String(entry?.rowKey || "") === rowKey);
  if (!row) return;

  selectedCashboxRowKey = row.rowKey;
  selectedCashboxRow = row;
  renderCashboxesTable(allCashboxesRows);
  renderSelectedCashboxDetail();
}

function renderSelectedCashboxDetail() {
  if (!cashboxDetailFeedbackNode || !cashboxDetailContentNode) return;
  if (!selectedCashboxRow?.raw) {
    cashboxDetailFeedbackNode.textContent = "Haz click en una fila para ver el detalle completo.";
    cashboxDetailContentNode.textContent = "{}";
    if (cashboxProductsFeedbackNode) {
      cashboxProductsFeedbackNode.textContent = "Sin productos seleccionados.";
    }
    if (cashboxProductsContentNode) {
      cashboxProductsContentNode.textContent = "[]";
    }
    return;
  }
  const serializedDoc = serializeForDisplay(selectedCashboxRow.raw);
  const products = extractCashboxProducts(selectedCashboxRow.raw);
  cashboxDetailFeedbackNode.textContent = `Caja ${selectedCashboxRow.id} | ${selectedCashboxRow.estado}`;
  cashboxDetailContentNode.textContent = JSON.stringify(serializedDoc, null, 2);
  if (cashboxProductsFeedbackNode) {
    cashboxProductsFeedbackNode.textContent = `${products.length} producto(s) detectado(s).`;
  }
  if (cashboxProductsContentNode) {
    cashboxProductsContentNode.textContent = JSON.stringify(serializeForDisplay(products), null, 2);
  }
}

function resolveCashboxSalesCount(row) {
  const explicitSalesCandidates = [
    row?.salesCount,
    row?.cierre?.salesCount,
    row?.cierreCaja?.salesCount,
    row?.resumen?.salesCount,
    row?.close?.salesCount,
    row?.closing?.salesCount,
    row?.cierre?.totales?.salesCount,
    row?.resumen?.totales?.salesCount
  ];
  for (const candidate of explicitSalesCandidates) {
    const parsed = parsePositiveCount(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  const directCandidates = [
    row?.cantidadVentas,
    row?.totalSales,
    row?.ventasCount,
    row?.cantidad_ventas
  ];
  for (const candidate of directCandidates) {
    const parsed = parsePositiveCount(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  const arrayCandidates = [row?.ventas, row?.sales, row?.detalleVentas, row?.transacciones];
  for (const candidate of arrayCandidates) {
    if (Array.isArray(candidate)) {
      return candidate.length;
    }
  }

  const summary = row?.cierre && typeof row.cierre === "object" ? row.cierre : null;
  if (summary) {
    const nestedNumeric = parsePositiveCount(
      summary?.cantidadVentas ??
        summary?.salesCount ??
        summary?.totalSales ??
        summary?.ventasCount ??
        summary?.cantidad_ventas
    );
    if (nestedNumeric !== null) {
      return nestedNumeric;
    }
    if (Array.isArray(summary?.ventas)) {
      return summary.ventas.length;
    }
    if (Array.isArray(summary?.sales)) {
      return summary.sales.length;
    }
  }

  return 0;
}

function parsePositiveCount(value) {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) {
    return Math.trunc(numeric);
  }
  if (typeof value === "string") {
    const match = value.match(/\d+/);
    if (match) {
      return Number(match[0]);
    }
  }
  return null;
}

function extractCashboxProducts(raw) {
  if (!raw || typeof raw !== "object") return [];

  const directCandidates = [
    raw?.productosIncluidos,
    raw?.productos,
    raw?.products,
    raw?.detalleProductos,
    raw?.cierre?.productosIncluidos,
    raw?.cierre?.productos,
    raw?.cierreCaja?.productosIncluidos,
    raw?.cierreCaja?.productos,
    raw?.resumen?.productosIncluidos,
    raw?.resumen?.productos
  ];
  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const salesCandidates = [
    raw?.ventas,
    raw?.sales,
    raw?.detalleVentas,
    raw?.transacciones,
    raw?.cierre?.ventas,
    raw?.cierre?.sales,
    raw?.cierreCaja?.ventas,
    raw?.cierreCaja?.sales
  ];
  for (const sales of salesCandidates) {
    if (!Array.isArray(sales)) continue;
    const flattened = [];
    sales.forEach((sale, index) => {
      const items = sale?.productos || sale?.products || sale?.items || sale?.detalle || [];
      if (!Array.isArray(items)) return;
      items.forEach((item) => {
        flattened.push({
          saleIndex: index,
          saleId: sale?.id || sale?.saleId || sale?.ventaId || "",
          ...item
        });
      });
    });
    if (flattened.length) {
      return flattened;
    }
  }

  return [];
}

function serializeForDisplay(value, seen = new WeakSet()) {
  if (value === null || value === undefined) return value ?? null;
  if (typeof value === "bigint") return String(value);
  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value?.toDate === "function") {
    try {
      const date = value.toDate();
      if (date instanceof Date && !Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (error) {
      console.error(error);
    }
  }
  if (Array.isArray(value)) {
    return value.map((entry) => serializeForDisplay(entry, seen));
  }
  if (typeof value === "object") {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    const out = {};
    Object.keys(value).forEach((key) => {
      out[key] = serializeForDisplay(value[key], seen);
    });
    return out;
  }
  return String(value);
}

function getTimestampFromUnknownDate(value) {
  if (!value) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      const date = value.toDate();
      const time = date instanceof Date ? date.getTime() : NaN;
      return Number.isFinite(time) ? time : 0;
    }
    if (Number.isFinite(Number(value.seconds))) {
      return Number(value.seconds) * 1000;
    }
  }
  const date = new Date(value);
  const time = date.getTime();
  return Number.isFinite(time) ? time : 0;
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
    renderChangePlanPlanOptions();
    updateEstimatedRevenueMetric();
    setPlansFeedback("");
    if (!allPlans.length) {
      selectedPlanId = "";
      resetTrialControlForm();
      toggleTrialControlEditor(false);
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
          : 0,
        trialControl: id === TRIAL_PLAN_ID ? normalizeTrialControl(plan?.trialControl) : null
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

  const isTrialPlan = plan.id === TRIAL_PLAN_ID;
  if (isTrialPlan) {
    fillTrialControlForm(plan.trialControl);
  } else {
    resetTrialControlForm();
  }
  toggleTrialControlEditor(isTrialPlan);
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
    if (selectedPlanId === TRIAL_PLAN_ID) {
      payload.trialControl = readTrialControlForm();
    }

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
    renderChangePlanPlanOptions();
    setPlansFeedback("Cambios guardados correctamente.");
  } catch (error) {
    console.error(error);
    setPlansFeedback(error.message || "No se pudo guardar el plan.");
  } finally {
    if (planSaveBtn) planSaveBtn.disabled = false;
  }
}

async function handleSeedStarterPlanClick() {
  if (!auth.currentUser) return;
  if (!seedStarterPlanBtn) return;

  const confirmed = window.confirm(
    "Esto va a crear o actualizar el plan starter con la configuracion seed. Deseas continuar?"
  );
  if (!confirmed) return;

  seedStarterPlanBtn.disabled = true;
  setPlansFeedback("Publicando seed del plan starter...");

  try {
    const token = await auth.currentUser.getIdToken(true);
    const response = await fetchWithLoading(getAdminPlansEndpoint(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(STARTER_PLAN_SEED)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudo seedear el plan starter.");
    }

    selectedPlanId = STARTER_PLAN_ID;
    await loadPlans();
    setPlansFeedback("Plan starter creado/actualizado correctamente.");
  } catch (error) {
    console.error(error);
    setPlansFeedback(error.message || "No se pudo seedear el plan starter.");
  } finally {
    seedStarterPlanBtn.disabled = false;
  }
}

async function handleSeedBusinessCatalogClick() {
  if (!auth.currentUser) return;
  if (!seedBusinessCatalogBtn) return;

  const confirmed = window.confirm(
    "Esto va a sobreescribir configuraciones/catalogo_negocios. Deseas continuar?"
  );
  if (!confirmed) return;

  seedBusinessCatalogBtn.disabled = true;
  setPlansFeedback("Publicando seed de catalogo...");
  try {
    const token = await auth.currentUser.getIdToken(true);
    const response = await fetchWithLoading(getAdminSeedBusinessCatalogEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ catalog: BUSINESS_CATALOG_SEED })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudo publicar el catalogo.");
    }

    setPlansFeedback(
      `Catalogo actualizado. Version ${Number(result?.version || 0)}. Tipos: ${Number(
        result?.businessTypesCount || 0
      )}.`
    );
  } catch (error) {
    console.error(error);
    setPlansFeedback(error.message || "No se pudo publicar el catalogo.");
  } finally {
    seedBusinessCatalogBtn.disabled = false;
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
  activeSection = "users";
  activeManagerSubsection = "products";
  selectedManagerUserUid = "";
  selectedManagerTenantId = "";
  selectedUserUid = "";
  selectedUserRow = null;
  selectedEmployees = [];
  selectedEmployeesUserUid = "";
  selectedEmployeesTenantId = "";
  latestEmployeesRequestId = 0;
  latestUserDocRequestId = 0;
  selectedProductsUserUid = "";
  selectedProductsTenantId = "";
  allProductRows = [];
  latestProductsRequestId = 0;
  selectedSalesUserUid = "";
  selectedSalesTenantId = "";
  allSalesRows = [];
  latestSalesRequestId = 0;
  selectedCashboxesUserUid = "";
  selectedCashboxesTenantId = "";
  allCashboxesRows = [];
  allCashboxesSourceRows = [];
  latestCashboxesRequestId = 0;
  selectedCashboxRowKey = "";
  selectedCashboxRow = null;
  selectedBackupsUserUid = "";
  selectedBackupsTenantId = "";
  allBackupsRows = [];
  latestBackupsRequestId = 0;
  selectedBackupRowPath = "";
  selectedBackupRow = null;
  selectedImportTargetUserUid = "";
  selectedImportTargetTenantId = "";
  selectedImportBackupType = "sales";
  selectedChangePlanUserUid = "";
  selectedChangePlanTenantId = "";
  selectedChangePlanCurrentPlanId = "";
  selectedChangePlanTargetPlanId = "";
  importPreviewPayload = null;
  importPreviewRows = [];
  if (productsSearchDebounce) {
    clearTimeout(productsSearchDebounce);
    productsSearchDebounce = null;
  }
  if (salesSearchDebounce) {
    clearTimeout(salesSearchDebounce);
    salesSearchDebounce = null;
  }
  if (cashboxesSearchDebounce) {
    clearTimeout(cashboxesSearchDebounce);
    cashboxesSearchDebounce = null;
  }
  if (backupsSearchDebounce) {
    clearTimeout(backupsSearchDebounce);
    backupsSearchDebounce = null;
  }
  pendingGlobalLoads = 0;
  tableBody.innerHTML = '<tr><td colspan="11">Sin datos.</td></tr>';
  if (metricEstimatedRevenue) metricEstimatedRevenue.textContent = "$0,00 / mes";
  if (planCardsNode) planCardsNode.innerHTML = "";
  if (employeesUserSelect) {
    employeesUserSelect.innerHTML = '<option value="">Selecciona un usuario...</option>';
    employeesUserSelect.disabled = true;
  }
  if (managerUserSelect) {
    managerUserSelect.innerHTML = '<option value="">Selecciona un usuario...</option>';
    managerUserSelect.disabled = true;
  }
  if (changePlanUserSelect) {
    changePlanUserSelect.innerHTML = '<option value="">Selecciona un usuario...</option>';
    changePlanUserSelect.disabled = true;
  }
  if (changePlanPlanSelect) {
    changePlanPlanSelect.innerHTML = '<option value="">Selecciona un plan...</option>';
    changePlanPlanSelect.disabled = true;
  }
  if (importTargetUserSelect) {
    importTargetUserSelect.innerHTML = '<option value="">Selecciona un usuario...</option>';
    importTargetUserSelect.disabled = true;
  }
  if (importBackupTypeSelect) {
    importBackupTypeSelect.value = "sales";
    importBackupTypeSelect.disabled = true;
  }
  if (productsSearchInput) productsSearchInput.value = "";
  if (salesSearchInput) salesSearchInput.value = "";
  if (cashboxesSearchInput) cashboxesSearchInput.value = "";
  if (backupsSearchInput) backupsSearchInput.value = "";
  if (importBackupFileInput) {
    importBackupFileInput.value = "";
  }
  syncBackupButtonsState();
  setProductsPlaceholder("Selecciona un usuario en Administrador para ver productos.");
  setProductsFeedback("");
  setSalesPlaceholder("Selecciona un usuario en Administrador para ver ventas.");
  setSalesFeedback("");
  setCashboxesPlaceholder("Selecciona un usuario en Administrador para ver cajas.");
  setCashboxesFeedback("");
  renderSelectedCashboxDetail();
  setBackupsPlaceholder("Selecciona un usuario en Administrador para ver backups.");
  setBackupsFeedback("");
  setBackupSalesFeedback("Selecciona un backup para ver sus ventas.");
  setImportBackupFeedback("Selecciona usuario destino, tipo y archivo para simular.");
  setImportPreviewPlaceholder("Selecciona un archivo para simular la carga.");
  renderBackupSalesTable([]);
  setChangePlanFeedback("");
  if (changePlanCurrentMetaNode) {
    changePlanCurrentMetaNode.textContent = "Selecciona un usuario para ver su plan actual.";
  }
  if (changePlanPreviewNode) {
    changePlanPreviewNode.textContent =
      "Selecciona un plan diferente para ver los cambios que se aplicaran en Firebase.";
  }
  if (changePlanSaveBtn) changePlanSaveBtn.disabled = true;
  resetTrialControlForm();
  toggleTrialControlEditor(false);
  if (userTrialAccessAllowedInput) userTrialAccessAllowedInput.checked = true;
  if (userTrialWarningEnabledInput) userTrialWarningEnabledInput.checked = false;
  if (userTrialSaveBtn) userTrialSaveBtn.disabled = true;
  userTrialControlGroup?.classList.add("hidden");
  setUserTrialFeedback("");
  planForm?.classList.add("hidden");
  userActionsPanel?.classList.add("hidden");
  globalLoadingNode?.classList.add("hidden");
  closeUserDocOverlay();
  if (userDocOverlayMeta) {
    userDocOverlayMeta.textContent = "Haz click en un usuario para ver el documento de usuario y tenant.";
  }
  renderUserDocCardRows(
    userDocOverlayUserContent,
    { estado: "Sin datos de usuario." },
    "Sin datos de usuario."
  );
  renderUserDocCardRows(
    userDocOverlayTenantContent,
    { estado: "Sin datos de tenant." },
    "Sin datos de tenant."
  );
  setEmployeesPlaceholder("Selecciona un usuario activo para ver sus empleados.");
  setEmployeesFeedback("");
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
  activeSection = sectionId === "employees" ? "employees" : activeSection;
  activeSection = sectionId === "manager" ? "manager" : activeSection;
  activeSection = sectionId === "change-plan" ? "change-plan" : activeSection;

  usersSection?.classList.toggle("hidden", activeSection !== "users");
  employeesSection?.classList.toggle("hidden", activeSection !== "employees");
  plansSection?.classList.toggle("hidden", activeSection !== "plans");
  managerSection?.classList.toggle("hidden", activeSection !== "manager");
  changePlanSection?.classList.toggle("hidden", activeSection !== "change-plan");

  navUsersBtn?.classList.toggle("is-active", activeSection === "users");
  navEmployeesBtn?.classList.toggle("is-active", activeSection === "employees");
  navPlansBtn?.classList.toggle("is-active", activeSection === "plans");
  navManagerBtn?.classList.toggle("is-active", activeSection === "manager");
  navChangePlanBtn?.classList.toggle("is-active", activeSection === "change-plan");

  if (activeSection === "employees" && selectedEmployeesTenantId) {
    void loadEmployeesForSelectedUser();
  }
  if (activeSection === "manager") {
    setActiveManagerSubsection(activeManagerSubsection);
  }
  if (activeSection === "change-plan") {
    renderChangePlanUserOptions();
  }
  syncBackupButtonsState();
}

function setActiveManagerSubsection(subsectionId) {
  activeManagerSubsection = subsectionId === "sales" ? "sales" : "products";
  activeManagerSubsection = subsectionId === "cashboxes" ? "cashboxes" : activeManagerSubsection;
  activeManagerSubsection = subsectionId === "backups" ? "backups" : activeManagerSubsection;

  productsSection?.classList.toggle("hidden", activeManagerSubsection !== "products");
  salesSection?.classList.toggle("hidden", activeManagerSubsection !== "sales");
  cashboxesSection?.classList.toggle("hidden", activeManagerSubsection !== "cashboxes");
  backupsSection?.classList.toggle("hidden", activeManagerSubsection !== "backups");

  managerNavProductsBtn?.classList.toggle("is-active", activeManagerSubsection === "products");
  managerNavSalesBtn?.classList.toggle("is-active", activeManagerSubsection === "sales");
  managerNavCashboxesBtn?.classList.toggle("is-active", activeManagerSubsection === "cashboxes");
  managerNavBackupsBtn?.classList.toggle("is-active", activeManagerSubsection === "backups");

  if (activeSection === "manager") {
    void loadManagerActiveSubsection();
  }
  syncBackupButtonsState();
}

function openAdminCacheDb() {
  if (!("indexedDB" in window)) return Promise.resolve(null);
  if (adminCacheDbPromise) return adminCacheDbPromise;

  adminCacheDbPromise = new Promise((resolve) => {
    const request = window.indexedDB.open(ADMIN_CACHE_DB_NAME, ADMIN_CACHE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CASHBOXES_CACHE_STORE)) {
        db.createObjectStore(CASHBOXES_CACHE_STORE, { keyPath: "tenantId" });
      }
      if (!db.objectStoreNames.contains(SECTION_ROWS_CACHE_STORE)) {
        db.createObjectStore(SECTION_ROWS_CACHE_STORE, { keyPath: "cacheKey" });
      }
      if (!db.objectStoreNames.contains(USER_DOCS_CACHE_STORE)) {
        db.createObjectStore(USER_DOCS_CACHE_STORE, { keyPath: "uid" });
      } else {
        // Invalidamos cache antiguo de docs para forzar recalculo con la heuristica actual.
        request.transaction?.objectStore(USER_DOCS_CACHE_STORE)?.clear();
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error("No se pudo abrir IndexedDB para cache de cajas.");
      resolve(null);
    };
  });

  return adminCacheDbPromise;
}

async function getCachedCashboxesRows(tenantId) {
  try {
    const db = await openAdminCacheDb();
    if (!db || !tenantId) return [];
    return await new Promise((resolve) => {
      const tx = db.transaction(CASHBOXES_CACHE_STORE, "readonly");
      const store = tx.objectStore(CASHBOXES_CACHE_STORE);
      const request = store.get(String(tenantId || "").trim());
      request.onsuccess = () => {
        const rows = Array.isArray(request.result?.rows) ? request.result.rows : [];
        resolve(rows);
      };
      request.onerror = () => resolve([]);
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function saveCachedCashboxesRows(tenantId, rows) {
  try {
    const db = await openAdminCacheDb();
    if (!db || !tenantId) return;
    await new Promise((resolve) => {
      const tx = db.transaction(CASHBOXES_CACHE_STORE, "readwrite");
      const store = tx.objectStore(CASHBOXES_CACHE_STORE);
      store.put({
        tenantId: String(tenantId || "").trim(),
        rows: Array.isArray(rows) ? rows : [],
        updatedAt: Date.now()
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch (error) {
    console.error(error);
  }
}

function getSectionTenantCacheKey(sectionId, tenantId) {
  return `${String(sectionId || "").trim()}::${String(tenantId || "").trim()}`;
}

async function getCachedSectionRows(sectionId, tenantId) {
  try {
    const db = await openAdminCacheDb();
    const safeSectionId = String(sectionId || "").trim();
    const safeTenantId = String(tenantId || "").trim();
    if (!db || !safeSectionId || !safeTenantId) return [];
    return await new Promise((resolve) => {
      const tx = db.transaction(SECTION_ROWS_CACHE_STORE, "readonly");
      const store = tx.objectStore(SECTION_ROWS_CACHE_STORE);
      const request = store.get(getSectionTenantCacheKey(safeSectionId, safeTenantId));
      request.onsuccess = () => {
        const rows = Array.isArray(request.result?.rows) ? request.result.rows : [];
        resolve(rows);
      };
      request.onerror = () => resolve([]);
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function saveCachedSectionRows(sectionId, tenantId, rows) {
  try {
    const db = await openAdminCacheDb();
    const safeSectionId = String(sectionId || "").trim();
    const safeTenantId = String(tenantId || "").trim();
    if (!db || !safeSectionId || !safeTenantId) return;
    await new Promise((resolve) => {
      const tx = db.transaction(SECTION_ROWS_CACHE_STORE, "readwrite");
      const store = tx.objectStore(SECTION_ROWS_CACHE_STORE);
      store.put({
        cacheKey: getSectionTenantCacheKey(safeSectionId, safeTenantId),
        sectionId: safeSectionId,
        tenantId: safeTenantId,
        rows: Array.isArray(rows) ? rows : [],
        updatedAt: Date.now()
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch (error) {
    console.error(error);
  }
}

async function getCachedUserDocsEntry(uid, tenantId) {
  try {
    const db = await openAdminCacheDb();
    const safeUid = String(uid || "").trim();
    const safeTenantId = String(tenantId || "").trim();
    if (!db || !safeUid) return null;
    return await new Promise((resolve) => {
      const tx = db.transaction(USER_DOCS_CACHE_STORE, "readonly");
      const store = tx.objectStore(USER_DOCS_CACHE_STORE);
      const request = store.get(safeUid);
      request.onsuccess = () => {
        const record = request.result;
        if (!isObjectRecord(record)) {
          resolve(null);
          return;
        }
        if (safeTenantId && String(record?.tenantId || "").trim() !== safeTenantId) {
          resolve(null);
          return;
        }
        resolve(record);
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function saveCachedUserDocsEntry(uid, tenantId, entry) {
  try {
    const db = await openAdminCacheDb();
    const safeUid = String(uid || "").trim();
    if (!db || !safeUid || !isObjectRecord(entry)) return;
    await new Promise((resolve) => {
      const tx = db.transaction(USER_DOCS_CACHE_STORE, "readwrite");
      const store = tx.objectStore(USER_DOCS_CACHE_STORE);
      store.put({
        uid: safeUid,
        tenantId: String(tenantId || "").trim(),
        userDoc: isObjectRecord(entry?.userDoc) ? entry.userDoc : null,
        tenantDoc: isObjectRecord(entry?.tenantDoc) ? entry.tenantDoc : null,
        userCollection: String(entry?.userCollection || "").trim(),
        tenantCollection: String(entry?.tenantCollection || "").trim(),
        updatedAt: Date.now()
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch (error) {
    console.error(error);
  }
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

function setProductsFeedback(message) {
  if (!productsFeedbackNode) return;
  productsFeedbackNode.textContent = String(message || "");
}

function setProductsPlaceholder(message) {
  if (!productsTableBody) return;
  productsTableBody.innerHTML = `<tr><td colspan="6">${escapeHtml(String(message || "Sin datos."))}</td></tr>`;
}

function setSalesFeedback(message) {
  if (!salesFeedbackNode) return;
  salesFeedbackNode.textContent = String(message || "");
}

function setSalesPlaceholder(message) {
  if (!salesTableBody) return;
  salesTableBody.innerHTML = `<tr><td colspan="6">${escapeHtml(String(message || "Sin datos."))}</td></tr>`;
}

function setCashboxesFeedback(message) {
  if (!cashboxesFeedbackNode) return;
  cashboxesFeedbackNode.textContent = String(message || "");
}

function setCashboxesPlaceholder(message) {
  if (!cashboxesTableBody) return;
  cashboxesTableBody.innerHTML = `<tr><td colspan="7">${escapeHtml(String(message || "Sin datos."))}</td></tr>`;
}

function setBackupsFeedback(message) {
  if (!backupsFeedbackNode) return;
  backupsFeedbackNode.textContent = String(message || "");
}

function setBackupsPlaceholder(message) {
  if (!backupsTableBody) return;
  backupsTableBody.innerHTML = `<tr><td colspan="5">${escapeHtml(String(message || "Sin datos."))}</td></tr>`;
}

function setBackupSalesFeedback(message) {
  if (!backupSalesFeedbackNode) return;
  backupSalesFeedbackNode.textContent = String(message || "");
}

function setImportBackupFeedback(message) {
  if (!importBackupFeedbackNode) return;
  importBackupFeedbackNode.textContent = String(message || "");
}

function setImportPreviewPlaceholder(message) {
  if (!importPreviewTableBody) return;
  importPreviewTableBody.innerHTML = `<tr><td colspan="4">${escapeHtml(String(message || "Sin datos."))}</td></tr>`;
}

function syncBackupButtonsState() {
  if (productsBackupBtn) productsBackupBtn.disabled = !selectedProductsTenantId;
  if (salesBackupBtn) salesBackupBtn.disabled = !selectedSalesTenantId;
  if (cashboxesBackupBtn) cashboxesBackupBtn.disabled = !selectedCashboxesTenantId;
  if (backupDownloadBtn) {
    backupDownloadBtn.disabled = !selectedBackupsTenantId || !selectedBackupRowPath;
  }
  const canImportBackup =
    Boolean(selectedImportTargetTenantId) &&
    Boolean(selectedImportBackupType) &&
    Boolean(importPreviewPayload) &&
    importPreviewRows.length > 0;
  if (importConfirmBtn) importConfirmBtn.disabled = !canImportBackup;
  if (importCancelBtn) {
    importCancelBtn.disabled = !Boolean(getSelectedImportBackupFile()) && importPreviewRows.length === 0;
  }
  if (importFloatingActionsNode) {
    const showImportActions = activeSection === "manager" && activeManagerSubsection === "backups";
    importFloatingActionsNode.classList.toggle("hidden", !showImportActions);
  }
}

function createSectionBackup({
  rows,
  tenantId,
  suffix,
  emptyMessage,
  successLabel,
  setFeedback
}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    setFeedback(emptyMessage);
    return;
  }

  const timestamp = getBackupTimestamp();
  const tenantSegment = sanitizeFileSegment(tenantId);
  const fileName = tenantSegment
    ? `${timestamp}_${tenantSegment}_${suffix}.json`
    : `${timestamp}_${suffix}.json`;
  const payload = {
    generatedAt: new Date().toISOString(),
    tenantId: String(tenantId || ""),
    total: rows.length,
    data: rows
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  setFeedback(`Backup de ${successLabel} generado: ${fileName}`);
}

async function runSectionBackupDownload({
  tenantId,
  endpoint,
  responseKey,
  normalizeRows,
  suffix,
  emptyMessage,
  successLabel,
  setFeedback
}) {
  if (!auth.currentUser) return;
  if (!tenantId) {
    setFeedback("Selecciona un usuario activo antes de generar el backup.");
    return;
  }

  setFeedback("Generando backup...");
  try {
    const token = await auth.currentUser.getIdToken(true);
    const params = new URLSearchParams({
      tenantId: String(tenantId || "").trim()
    });
    const response = await fetchWithLoading(`${endpoint}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudo generar el backup.");
    }

    const sourceRows = result?.[responseKey] || result?.rows || [];
    const rows = normalizeRows(sourceRows);
    createSectionBackup({
      rows,
      tenantId,
      suffix,
      emptyMessage,
      successLabel,
      setFeedback
    });
  } catch (error) {
    console.error(error);
    setFeedback(error.message || "No se pudo generar el backup.");
  }
}

function getBackupTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function sanitizeFileSegment(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w-]/g, "")
    .slice(0, 40);
}

function toggleActionButtons(loading) {
  if (refreshBtn) refreshBtn.disabled = loading;
  if (logoutBtn) logoutBtn.disabled = loading;
  if (loginBtn) loginBtn.disabled = loading;
  if (planSaveBtn) planSaveBtn.disabled = loading;
}

function formatDate(value) {
  if (!value) return "-";
  const ts = getTimestampFromUnknownDate(value);
  if (!Number.isFinite(ts) || ts <= 0) return "-";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "-";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const time = date
    .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    .replace(" ", "");
  return `${dd}/${mm}/${yyyy} ${time}`;
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

function normalizeTrialControl(inputLike, fallbackLike = null) {
  const input = asObject(inputLike);
  const fallback = asObject(fallbackLike);
  return {
    trialAccessAllowed: toSafeBoolean(
      input.trialAccessAllowed,
      toSafeBoolean(fallback.trialAccessAllowed, DEFAULT_TRIAL_CONTROL.trialAccessAllowed)
    ),
    trialWarningEnabled: toSafeBoolean(
      input.trialWarningEnabled,
      toSafeBoolean(fallback.trialWarningEnabled, DEFAULT_TRIAL_CONTROL.trialWarningEnabled)
    ),
    trialWarningText: normalizeTextWithMax(
      input.trialWarningText,
      fallback.trialWarningText || DEFAULT_TRIAL_CONTROL.trialWarningText,
      220
    ),
    trialWarningCtaLabel: normalizeTextWithMax(
      input.trialWarningCtaLabel,
      fallback.trialWarningCtaLabel || DEFAULT_TRIAL_CONTROL.trialWarningCtaLabel,
      60
    ),
    trialWarningCtaUrl: normalizeUrl(
      input.trialWarningCtaUrl,
      fallback.trialWarningCtaUrl || DEFAULT_TRIAL_CONTROL.trialWarningCtaUrl
    ),
    trialBlockTitle: normalizeTextWithMax(
      input.trialBlockTitle,
      fallback.trialBlockTitle || DEFAULT_TRIAL_CONTROL.trialBlockTitle,
      90
    ),
    trialBlockMessage: normalizeTextWithMax(
      input.trialBlockMessage,
      fallback.trialBlockMessage || DEFAULT_TRIAL_CONTROL.trialBlockMessage,
      260
    ),
    trialBlockWhatsappNumber: normalizeWhatsappNumber(
      input.trialBlockWhatsappNumber,
      fallback.trialBlockWhatsappNumber || DEFAULT_TRIAL_CONTROL.trialBlockWhatsappNumber
    ),
    trialBlockWhatsappText: normalizeTextWithMax(
      input.trialBlockWhatsappText,
      fallback.trialBlockWhatsappText || DEFAULT_TRIAL_CONTROL.trialBlockWhatsappText,
      220
    )
  };
}

function readTrialControlForm() {
  return normalizeTrialControl({
    trialAccessAllowed: Boolean(planTrialAccessAllowedInput?.checked),
    trialWarningEnabled: Boolean(planTrialWarningEnabledInput?.checked),
    trialWarningText: planTrialWarningTextInput?.value,
    trialWarningCtaLabel: planTrialWarningCtaLabelInput?.value,
    trialWarningCtaUrl: planTrialWarningCtaUrlInput?.value,
    trialBlockTitle: planTrialBlockTitleInput?.value,
    trialBlockMessage: planTrialBlockMessageInput?.value,
    trialBlockWhatsappNumber: planTrialWhatsappNumberInput?.value,
    trialBlockWhatsappText: planTrialWhatsappTextInput?.value
  });
}

function fillTrialControlForm(controlLike) {
  const control = normalizeTrialControl(controlLike, DEFAULT_TRIAL_CONTROL);
  if (planTrialAccessAllowedInput) {
    planTrialAccessAllowedInput.checked = control.trialAccessAllowed === true;
  }
  if (planTrialWarningEnabledInput) {
    planTrialWarningEnabledInput.checked = control.trialWarningEnabled === true;
  }
  if (planTrialWarningTextInput) {
    planTrialWarningTextInput.value = control.trialWarningText;
  }
  if (planTrialWarningCtaLabelInput) {
    planTrialWarningCtaLabelInput.value = control.trialWarningCtaLabel;
  }
  if (planTrialWarningCtaUrlInput) {
    planTrialWarningCtaUrlInput.value = control.trialWarningCtaUrl;
  }
  if (planTrialBlockTitleInput) {
    planTrialBlockTitleInput.value = control.trialBlockTitle;
  }
  if (planTrialBlockMessageInput) {
    planTrialBlockMessageInput.value = control.trialBlockMessage;
  }
  if (planTrialWhatsappNumberInput) {
    planTrialWhatsappNumberInput.value = control.trialBlockWhatsappNumber;
  }
  if (planTrialWhatsappTextInput) {
    planTrialWhatsappTextInput.value = control.trialBlockWhatsappText;
  }
}

function resetTrialControlForm() {
  fillTrialControlForm(DEFAULT_TRIAL_CONTROL);
}

function toggleTrialControlEditor(visible) {
  const shouldShow = visible === true;
  trialControlGroup?.classList.toggle("hidden", !shouldShow);
  TRIAL_CONTROL_INPUTS.forEach((input) => {
    input.disabled = !shouldShow;
  });
}

function normalizeTextWithMax(valueLike, fallbackLike, maxLength) {
  const raw = String(valueLike || "").trim();
  if (!raw) {
    return String(fallbackLike || "").trim().slice(0, maxLength);
  }
  return raw.slice(0, maxLength);
}

function normalizeUrl(valueLike, fallbackLike) {
  const fallback = String(fallbackLike || "planes.html").trim() || "planes.html";
  const raw = String(valueLike || "").trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw)) return raw.slice(0, 300);

  const normalized = raw.replace(/^\/+/, "");
  if (!normalized) return fallback;
  if (/^javascript:/i.test(normalized)) return fallback;
  return normalized.slice(0, 300);
}

function normalizeWhatsappNumber(valueLike, fallbackLike = "") {
  const normalized = String(valueLike || "").trim().replace(/[^\d]/g, "");
  if (normalized) return normalized.slice(0, 20);
  return String(fallbackLike || "").trim().replace(/[^\d]/g, "").slice(0, 20);
}

function toSafeBoolean(valueLike, fallback) {
  if (typeof valueLike === "boolean") return valueLike;
  if (typeof valueLike === "string") {
    const normalized = valueLike.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return Boolean(fallback);
}

function asObject(valueLike) {
  return valueLike && typeof valueLike === "object" ? valueLike : {};
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

function showGlobalToast(message, type = "success") {
  if (!globalToastNode) return;
  const text = String(message || "").trim();
  if (!text) return;

  if (globalToastTimeout) {
    clearTimeout(globalToastTimeout);
    globalToastTimeout = null;
  }

  globalToastNode.textContent = text;
  globalToastNode.classList.remove("hidden", "is-warning", "is-error");
  if (type === "warning") {
    globalToastNode.classList.add("is-warning");
  } else if (type === "error") {
    globalToastNode.classList.add("is-error");
  }

  globalToastTimeout = setTimeout(() => {
    hideGlobalToast();
  }, 2200);
}

function hideGlobalToast() {
  if (!globalToastNode) return;
  globalToastNode.classList.add("hidden");
  globalToastNode.classList.remove("is-warning", "is-error");
  if (globalToastTimeout) {
    clearTimeout(globalToastTimeout);
    globalToastTimeout = null;
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

  const isTrialPlan = normalizePlanId(selectedUserRow?.planActual) === TRIAL_PLAN_ID;
  userTrialControlGroup?.classList.toggle("hidden", !isTrialPlan);
  if (userTrialSaveBtn) {
    userTrialSaveBtn.disabled = !isTrialPlan;
  }

  if (!isTrialPlan) {
    setUserTrialFeedback("");
    return;
  }

  if (userTrialAccessAllowedInput) {
    userTrialAccessAllowedInput.checked = toTrialBoolean(selectedUserRow?.trialAccessAllowed, true);
  }
  if (userTrialWarningEnabledInput) {
    userTrialWarningEnabledInput.checked = toTrialBoolean(selectedUserRow?.trialWarningEnabled, false);
  }

  const loaded = selectedUserRow?.trialControlLoaded === true;
  if (!loaded && !String(userTrialFeedbackNode?.textContent || "").trim()) {
    setUserTrialFeedback("Cargando control trial...", "warning");
  }
  if (loaded && String(userTrialFeedbackNode?.textContent || "").trim() === "Cargando control trial...") {
    setUserTrialFeedback("");
  }
}

function openUserDocOverlay() {
  userDocOverlay?.classList.remove("hidden");
  if (userDocOverlay) userDocOverlay.setAttribute("aria-hidden", "false");
}

function closeUserDocOverlay() {
  latestUserDocRequestId += 1;
  userDocOverlay?.classList.add("hidden");
  if (userDocOverlay) userDocOverlay.setAttribute("aria-hidden", "true");
}

function handleUserDocOverlayClick(event) {
  if (!userDocOverlay) return;
  if (event.target === userDocOverlay) {
    closeUserDocOverlay();
  }
}

async function handleUserDocOverlayRefreshClick() {
  if (!selectedUserRow) {
    showGlobalToast("Selecciona un usuario primero.", "warning");
    return;
  }

  const targetRow = selectedUserRow;
  if (userDocOverlayRefreshBtn) {
    userDocOverlayRefreshBtn.disabled = true;
    userDocOverlayRefreshBtn.textContent = "Actualizando...";
  }

  renderUserDocOverlayLoading(targetRow);
  try {
    await loadAndRenderSelectedUserDocs(
      targetRow,
      () => loadSelectedUserAccountDetails(),
      { forceRemote: true }
    );
    if (selectedUserUid === String(targetRow?.uid || "").trim()) {
      showGlobalToast("Datos actualizados en IndexedDB.");
    }
  } finally {
    if (userDocOverlayRefreshBtn) {
      userDocOverlayRefreshBtn.disabled = false;
      userDocOverlayRefreshBtn.textContent = "Refrescar docs";
    }
  }
}

function handleGlobalKeydown(event) {
  if (event.key !== "Escape") return;
  if (!userDocOverlay || userDocOverlay.classList.contains("hidden")) return;
  closeUserDocOverlay();
}

function renderUserDocOverlayLoading(row) {
  openUserDocOverlay();
  if (userDocOverlayMeta) {
    const uid = String(row?.uid || "").trim() || "-";
    const tenantId = String(row?.tenantId || "").trim() || "-";
    userDocOverlayMeta.textContent = `UID ${uid} | Tenant ${tenantId} | Buscando en cache local...`;
  }
  renderUserDocCardRows(
    userDocOverlayUserContent,
    { estado: "Cargando doc de usuario..." },
    "Cargando doc de usuario..."
  );
  renderUserDocCardRows(
    userDocOverlayTenantContent,
    { estado: "Cargando doc de tenant..." },
    "Cargando doc de tenant..."
  );
}

function renderUserDocOverlayError(message, row) {
  openUserDocOverlay();
  const errorMessage = String(message || "No se pudieron cargar los documentos.");
  if (userDocOverlayMeta) {
    const uid = String(row?.uid || "").trim() || "-";
    const tenantId = String(row?.tenantId || "").trim() || "-";
    userDocOverlayMeta.textContent = `UID ${uid} | Tenant ${tenantId} | ${errorMessage}`;
  }
  renderUserDocCardRows(
    userDocOverlayUserContent,
    { doc: "usuario", error: errorMessage },
    errorMessage
  );
  renderUserDocCardRows(
    userDocOverlayTenantContent,
    { doc: "tenant", error: errorMessage },
    errorMessage
  );
}

function renderUserDocOverlayPayload(payload, row) {
  openUserDocOverlay();
  const uid = String(payload?.uid || row?.uid || "").trim() || "-";
  const tenantId = String(payload?.tenantId || row?.tenantId || "").trim() || "-";
  const sourceLabel =
    payload?.source === "cache" ? "cache local (IndexedDB)" : "Firebase / Cloud Functions";
  const userSource = payload?.userCollection ? String(payload.userCollection) : "-";
  const tenantSource = payload?.tenantCollection ? String(payload.tenantCollection) : "-";

  if (userDocOverlayMeta) {
    userDocOverlayMeta.textContent = [
      `UID ${uid}`,
      `Tenant ${tenantId}`,
      `Fuente ${sourceLabel}`,
      `usuario:${userSource}`,
      `tenant:${tenantSource}`
    ].join(" | ");
  }

  const userDoc = isObjectRecord(payload?.userDoc)
    ? payload.userDoc
    : { message: "Documento de usuario no encontrado." };
  const tenantDoc = isObjectRecord(payload?.tenantDoc)
    ? payload.tenantDoc
    : { message: "Documento de tenant no encontrado." };

  renderUserDocCardRows(userDocOverlayUserContent, userDoc, "Documento de usuario no encontrado.");
  renderUserDocCardRows(userDocOverlayTenantContent, tenantDoc, "Documento de tenant no encontrado.");
}

function renderUserDocCardRows(container, value, fallbackMessage = "Sin datos.") {
  if (!container) return;
  container.innerHTML = "";

  const serialized = serializeForDisplay(value);
  if (!isObjectRecord(serialized)) {
    appendUserDocCardRow(container, "valor", formatUserDocCardValue(serialized, fallbackMessage));
    return;
  }

  const keys = Object.keys(serialized);
  const visibleKeys = keys.filter((key) => !shouldOmitUserDocKey(key));
  if (!visibleKeys.length) {
    appendUserDocCardRow(container, "estado", fallbackMessage);
    return;
  }

  visibleKeys.forEach((key) => {
    appendUserDocCardRow(container, key, formatUserDocCardValue(serialized[key], fallbackMessage));
  });
}

function shouldOmitUserDocKey(key) {
  return String(key || "").trim().toUpperCase() === "REF";
}

function appendUserDocCardRow(container, key, value) {
  if (!container) return;
  const row = document.createElement("p");
  row.className = "user-doc-card-row";

  const keyNode = document.createElement("span");
  keyNode.className = "user-doc-card-key";
  keyNode.textContent = String(key || "-");

  const valueNode = document.createElement("span");
  valueNode.className = "user-doc-card-value";
  valueNode.textContent = String(value ?? "-");

  row.appendChild(keyNode);
  row.appendChild(valueNode);
  container.appendChild(row);
}

function handleUserDocCardRowCopyClick(event) {
  const row = event.target?.closest?.(".user-doc-card-row");
  if (!row) return;
  const valueNode = row.querySelector(".user-doc-card-value");
  const valueText = String(valueNode?.textContent || "").trim();
  if (!valueText || valueText === "-") {
    showGlobalToast("No hay valor para copiar.", "warning");
    return;
  }

  void copyTextToClipboard(valueText)
    .then(() => {
      showGlobalToast("Copiado al portapapeles.");
    })
    .catch((error) => {
      console.error(error);
      showGlobalToast("No se pudo copiar el valor.", "error");
    });
}

async function copyTextToClipboard(value) {
  const text = String(value || "");
  if (!text.trim()) return;
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const success = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!success) {
    throw new Error("No se pudo copiar con fallback.");
  }
}

function formatUserDocCardValue(value, fallbackMessage = "Sin datos.") {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value.trim() || "-";
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return JSON.stringify(value);
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (!keys.length) return "{}";
    return JSON.stringify(value);
  }
  return String(value);
}

function isObjectRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasAnyUserTenantDocs(entry) {
  return isObjectRecord(entry?.userDoc) || isObjectRecord(entry?.tenantDoc);
}

function hasCompleteUserTenantDocs(entry) {
  return isObjectRecord(entry?.userDoc) && isObjectRecord(entry?.tenantDoc);
}

function isStaleUserDocRequest(requestId, uid) {
  return requestId !== latestUserDocRequestId || selectedUserUid !== uid;
}

async function loadAndRenderSelectedUserDocs(row, detailsLoader = null, options = {}) {
  const uid = String(row?.uid || "").trim();
  const tenantId = String(row?.tenantId || "").trim();
  const forceRemote = options?.forceRemote === true;
  if (!uid) {
    renderUserDocOverlayError("No se encontro el UID del usuario seleccionado.", row);
    return;
  }

  const requestId = ++latestUserDocRequestId;
  let cachedEntry = null;
  try {
    cachedEntry = await getCachedUserDocsEntry(uid, tenantId);
    if (isStaleUserDocRequest(requestId, uid)) return;

    if (!forceRemote && hasCompleteUserTenantDocs(cachedEntry)) {
      renderUserDocOverlayPayload({ ...cachedEntry, source: "cache" }, row);
      return;
    }

    if (userDocOverlayMeta) {
      const sourceText = forceRemote ? "Actualizando desde Firebase..." : "Consultando Firebase...";
      userDocOverlayMeta.textContent = `UID ${uid} | Tenant ${tenantId || "-"} | ${sourceText}`;
    }

    let detailsPayload = null;
    if (typeof detailsLoader === "function") {
      detailsPayload = await detailsLoader().catch(() => null);
    }
    if (isStaleUserDocRequest(requestId, uid)) return;

    const tenantPayload = await loadTenantDocFromBackend(tenantId);
    if (isStaleUserDocRequest(requestId, uid)) return;

    const userDoc = extractUserDocFromPayload(detailsPayload) || cachedEntry?.userDoc || null;
    const tenantDoc =
      extractTenantDocFromPayload(tenantPayload) ||
      extractTenantDocFromPayload(detailsPayload) ||
      cachedEntry?.tenantDoc ||
      null;

    const mergedEntry = {
      uid,
      tenantId,
      userDoc,
      tenantDoc,
      userCollection: userDoc ? "adminManageAccounts" : "",
      tenantCollection: tenantDoc
        ? tenantPayload
          ? "adminGetTenantById"
          : "adminManageAccounts"
        : "",
      updatedAt: Date.now(),
      source: "firebase"
    };

    if (!hasAnyUserTenantDocs(mergedEntry)) {
      renderUserDocOverlayError(
        "No se encontraron docs de usuario/tenant en la respuesta de adminManageAccounts.",
        row
      );
      return;
    }

    renderUserDocOverlayPayload(mergedEntry, row);
    await saveCachedUserDocsEntry(uid, tenantId, mergedEntry);
  } catch (error) {
    console.error(error);
    if (isStaleUserDocRequest(requestId, uid)) return;
    if (forceRemote && hasAnyUserTenantDocs(cachedEntry)) {
      renderUserDocOverlayPayload({ ...cachedEntry, source: "cache" }, row);
      showGlobalToast("No se pudo actualizar. Se muestran datos en cache.", "warning");
      return;
    }
    renderUserDocOverlayError(error.message || "No se pudo cargar el detalle del usuario.", row);
  }
}

function extractUserDocFromPayload(payload) {
  if (!isObjectRecord(payload)) {
    return null;
  }
  return getFirstObjectCandidate([
    payload.userDoc,
    payload.usuarioDoc,
    payload.user,
    payload.usuario,
    payload.employerDoc,
    payload.employer,
    payload.employerRaw,
    payload.employer?.raw,
    payload.docs?.user,
    payload.docs?.usuario
  ]);
}

function extractTenantDocFromPayload(payload) {
  if (!isObjectRecord(payload)) return null;
  return getFirstObjectCandidate([
    payload.tenantDoc,
    payload.tenant,
    payload.tenantData,
    payload.tenantInfo,
    payload.tenantRaw,
    payload.tenant?.raw,
    payload.employer?.tenant,
    payload.employer?.tenantDoc,
    payload.employer?.tenantData,
    payload.account?.tenant,
    payload.account?.tenantDoc,
    payload.businessDoc,
    payload.business,
    payload.negocioDoc,
    payload.negocio,
    payload.docs?.tenant,
    payload.docs?.negocio
  ]);
}

function getFirstObjectCandidate(candidates) {
  if (!Array.isArray(candidates)) return null;
  for (const candidate of candidates) {
    if (isObjectRecord(candidate)) return candidate;
  }
  return null;
}

async function loadTenantDocFromBackend(tenantId) {
  const safeTenantId = String(tenantId || "").trim();
  if (!safeTenantId || !auth.currentUser) return null;

  const token = await auth.currentUser.getIdToken(true);
  const params = new URLSearchParams({ tenantId: safeTenantId });
  const response = await fetchWithLoading(`${getAdminTenantEndpoint()}?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result?.error || "No se pudo cargar el tenant.");
  }
  return result;
}

async function loadSelectedUserAccountDetails() {
  if (!selectedUserRow || !auth.currentUser) return null;

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

    if (result?.employer || result?.tenant) {
      const tenantPlanId = normalizePlanId(
        result?.tenant?.planId || result?.tenant?.planActual || selectedUserRow?.planActual
      );
      const trialAccessAllowed = toTrialBoolean(
        result?.tenant?.trialControl?.trialAccessAllowed,
        selectedUserRow?.trialAccessAllowed
      );
      const trialWarningEnabled = toTrialBoolean(
        result?.tenant?.trialControl?.trialWarningEnabled,
        selectedUserRow?.trialWarningEnabled
      );
      selectedUserRow = {
        ...selectedUserRow,
        activo: result?.employer ? result.employer.activo !== false : selectedUserRow?.activo !== false,
        planActual: tenantPlanId || normalizePlanId(selectedUserRow?.planActual) || selectedUserRow?.planActual || "-",
        trialAccessAllowed,
        trialWarningEnabled,
        trialControlLoaded: Boolean(result?.tenant)
      };
      allUserRows = allUserRows.map((row) =>
        String(row?.uid || "").trim() === selectedUserUid
          ? {
              ...row,
              activo: selectedUserRow.activo,
              planActual: selectedUserRow.planActual,
              trialAccessAllowed: selectedUserRow.trialAccessAllowed,
              trialWarningEnabled: selectedUserRow.trialWarningEnabled,
              trialControlLoaded: selectedUserRow.trialControlLoaded
            }
          : row
      );
      applyUsersFilter();
      renderSelectedUserActions();
    }

    return result;
  } catch (error) {
    console.error(error);
    setFeedback(error.message || "No se pudieron cargar los detalles de la cuenta.");
    return null;
  }
}

async function loadEmployeesForSelectedUser() {
  if (!auth.currentUser) return;
  if (!selectedEmployeesUserUid || !selectedEmployeesTenantId) {
    selectedEmployees = [];
    setEmployeesPlaceholder("Selecciona un usuario activo para ver sus empleados.");
    setEmployeesFeedback("");
    return;
  }

  const requestId = ++latestEmployeesRequestId;
  setEmployeesFeedback("Buscando empleados...");
  setEmployeesLoading();

  try {
    const token = await auth.currentUser.getIdToken(true);
    const params = new URLSearchParams({
      uid: selectedEmployeesUserUid,
      tenantId: selectedEmployeesTenantId
    });
    const response = await fetchWithLoading(`${getAdminAccountsEndpoint()}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudieron cargar los empleados.");
    }
    if (requestId !== latestEmployeesRequestId) return;

    selectedEmployees = Array.isArray(result?.employees) ? result.employees : [];
    renderEmployeesTable();
    setEmployeesFeedback(
      selectedEmployees.length
        ? `${selectedEmployees.length} empleado(s) encontrado(s).`
        : "No hay empleados para este usuario."
    );
  } catch (error) {
    console.error(error);
    if (requestId !== latestEmployeesRequestId) return;
    selectedEmployees = [];
    const errorMessage = error?.message || "No se pudieron cargar los empleados.";
    setEmployeesPlaceholder(errorMessage);
    setEmployeesFeedback(errorMessage);
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

async function handleSaveSelectedUserTrialControl() {
  if (!selectedUserRow || !auth.currentUser) return;

  const tenantId = String(selectedUserRow?.tenantId || "").trim();
  if (!tenantId) {
    setUserTrialFeedback("No se pudo resolver el tenant del usuario seleccionado.", "error");
    return;
  }

  const isTrialPlan = normalizePlanId(selectedUserRow?.planActual) === TRIAL_PLAN_ID;
  if (!isTrialPlan) {
    setUserTrialFeedback("Solo se puede editar control trial en cuentas del plan prueba.", "warning");
    return;
  }

  const trialAccessAllowed = Boolean(userTrialAccessAllowedInput?.checked);
  const trialWarningEnabled = Boolean(userTrialWarningEnabledInput?.checked);
  if (userTrialSaveBtn) userTrialSaveBtn.disabled = true;
  setUserTrialFeedback("Guardando control trial...", "warning");

  try {
    const token = await auth.currentUser.getIdToken(true);
    const response = await fetchWithLoading(getAdminAccountsEndpoint(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        action: "update_trial_control",
        tenantId,
        trialControl: {
          trialAccessAllowed,
          trialWarningEnabled
        }
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result?.error || "No se pudo guardar el control trial.");
    }

    const resolvedPlan = normalizePlanId(
      result?.tenant?.planId || result?.tenant?.planActual || selectedUserRow?.planActual
    );
    const resolvedAccessAllowed = toTrialBoolean(
      result?.tenant?.trialControl?.trialAccessAllowed,
      trialAccessAllowed
    );
    const resolvedWarningEnabled = toTrialBoolean(
      result?.tenant?.trialControl?.trialWarningEnabled,
      trialWarningEnabled
    );

    selectedUserRow = {
      ...selectedUserRow,
      planActual: resolvedPlan || selectedUserRow?.planActual || "-",
      trialAccessAllowed: resolvedAccessAllowed,
      trialWarningEnabled: resolvedWarningEnabled,
      trialControlLoaded: true
    };
    allUserRows = allUserRows.map((row) =>
      String(row?.uid || "").trim() === selectedUserUid
        ? {
            ...row,
            planActual: selectedUserRow.planActual,
            trialAccessAllowed: selectedUserRow.trialAccessAllowed,
            trialWarningEnabled: selectedUserRow.trialWarningEnabled,
            trialControlLoaded: true
          }
        : row
    );
    applyUsersFilter();
    renderSelectedUserActions();
    setUserTrialFeedback("Control trial actualizado.", "success");
  } catch (error) {
    console.error(error);
    setUserTrialFeedback(error.message || "No se pudo guardar el control trial.", "error");
  } finally {
    if (userTrialSaveBtn) userTrialSaveBtn.disabled = false;
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

function setUserTrialFeedback(message, type = "") {
  if (!userTrialFeedbackNode) return;
  userTrialFeedbackNode.textContent = String(message || "");
  userTrialFeedbackNode.classList.remove("is-success", "is-warning", "is-error");
  if (type === "success") {
    userTrialFeedbackNode.classList.add("is-success");
    return;
  }
  if (type === "warning") {
    userTrialFeedbackNode.classList.add("is-warning");
    return;
  }
  if (type === "error") {
    userTrialFeedbackNode.classList.add("is-error");
  }
}

function normalizePlanId(valueLike) {
  const raw = String(valueLike || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "trial" || raw === "free" || raw === "gratis") return TRIAL_PLAN_ID;
  if (raw.includes("prueba")) return TRIAL_PLAN_ID;
  return raw;
}

function toTrialBoolean(valueLike, fallback) {
  if (typeof valueLike === "boolean") return valueLike;
  if (typeof valueLike === "string") {
    const normalized = valueLike.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return typeof fallback === "boolean" ? fallback : Boolean(fallback);
}

function setEmployeesFeedback(message) {
  if (!employeesFeedbackNode) return;
  employeesFeedbackNode.textContent = String(message || "");
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
  if (!target || !auth.currentUser) return;

  const employeeUid = String(target.getAttribute("data-employee-uid") || "").trim();
  const nextActive = String(target.getAttribute("data-next-active") || "").trim() === "true";
  const tenantId = String(selectedEmployeesTenantId || selectedUserRow?.tenantId || "").trim();
  if (!employeeUid) return;
  if (!tenantId) {
    setEmployeesFeedback("No se pudo resolver el tenant del usuario seleccionado.");
    return;
  }

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
        tenantId,
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

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
