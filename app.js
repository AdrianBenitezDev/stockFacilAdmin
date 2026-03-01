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
const navSalesBtn = document.getElementById("admin-nav-sales-btn");
const navCashboxesBtn = document.getElementById("admin-nav-cashboxes-btn");
const usersSection = document.getElementById("admin-users-section");
const plansSection = document.getElementById("admin-plans-section");
const productsSection = document.getElementById("admin-products-section");
const salesSection = document.getElementById("admin-sales-section");
const cashboxesSection = document.getElementById("admin-cashboxes-section");
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
const productsFeedbackNode = document.getElementById("admin-products-feedback");
const productsUserSelect = document.getElementById("admin-products-user-select");
const productsSearchInput = document.getElementById("admin-products-search");
const productsTableBody = document.getElementById("admin-products-table-body");
const productsBackupBtn = document.getElementById("admin-products-backup-btn");
const salesFeedbackNode = document.getElementById("admin-sales-feedback");
const salesUserSelect = document.getElementById("admin-sales-user-select");
const salesSearchInput = document.getElementById("admin-sales-search");
const salesTableBody = document.getElementById("admin-sales-table-body");
const salesBackupBtn = document.getElementById("admin-sales-backup-btn");
const cashboxesFeedbackNode = document.getElementById("admin-cashboxes-feedback");
const cashboxesUserSelect = document.getElementById("admin-cashboxes-user-select");
const cashboxesSearchInput = document.getElementById("admin-cashboxes-search");
const cashboxesTableBody = document.getElementById("admin-cashboxes-table-body");
const cashboxesBackupBtn = document.getElementById("admin-cashboxes-backup-btn");
const cashboxDetailFeedbackNode = document.getElementById("admin-cashbox-detail-feedback");
const cashboxDetailContentNode = document.getElementById("admin-cashbox-detail-content");
const cashboxProductsFeedbackNode = document.getElementById("admin-cashbox-products-feedback");
const cashboxProductsContentNode = document.getElementById("admin-cashbox-products-content");

let allUserRows = [];
let allPlans = [];
let selectedPlanId = "";
let activeSection = "users";
let selectedUserUid = "";
let selectedUserRow = null;
let selectedEmployees = [];
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
let pendingGlobalLoads = 0;

const ADMIN_CACHE_DB_NAME = "stockfacil-admin-cache";
const ADMIN_CACHE_DB_VERSION = 1;
const CASHBOXES_CACHE_STORE = "cashboxes_by_tenant";
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
  navPlansBtn?.addEventListener("click", () => setActiveSection("plans"));
  navProductsBtn?.addEventListener("click", () => setActiveSection("products"));
  navSalesBtn?.addEventListener("click", () => setActiveSection("sales"));
  navCashboxesBtn?.addEventListener("click", () => setActiveSection("cashboxes"));
  usersSearchInput?.addEventListener("input", applyUsersFilter);
  productsUserSelect?.addEventListener("change", handleProductsUserSelectChange);
  productsSearchInput?.addEventListener("input", handleProductsSearchInput);
  productsBackupBtn?.addEventListener("click", handleProductsBackupClick);
  salesUserSelect?.addEventListener("change", handleSalesUserSelectChange);
  salesSearchInput?.addEventListener("input", handleSalesSearchInput);
  salesBackupBtn?.addEventListener("click", handleSalesBackupClick);
  cashboxesUserSelect?.addEventListener("change", handleCashboxesUserSelectChange);
  cashboxesSearchInput?.addEventListener("input", handleCashboxesSearchInput);
  cashboxesBackupBtn?.addEventListener("click", handleCashboxesBackupClick);
  cashboxesTableBody?.addEventListener("click", handleCashboxRowClick);
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
  if (activeSection === "products") {
    await loadProductsForSelectedUser();
    return;
  }
  if (activeSection === "sales") {
    await loadSalesForSelectedUser();
    return;
  }
  if (activeSection === "cashboxes") {
    await loadCashboxesForSelectedUser({ forceRemote: true });
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
  renderProductsUserOptions();
  renderSalesUserOptions();
  renderCashboxesUserOptions();
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

function getActiveScopedUsers() {
  return allUserRows
    .filter((row) => row?.activo !== false && String(row?.tenantId || "").trim())
    .map((row) => ({
      uid: String(row?.uid || "").trim(),
      tenantId: String(row?.tenantId || "").trim(),
      label: `${String(row?.nombre || "-").trim()} | ${String(row?.nombreNegocio || "-").trim()}`
    }));
}

function renderProductsUserOptions() {
  if (!productsUserSelect) return;

  const activeUsers = getActiveScopedUsers();

  const previousUserUid = selectedProductsUserUid;
  const nextUserUid =
    previousUserUid && activeUsers.some((item) => item.uid === previousUserUid)
      ? previousUserUid
      : activeUsers[0]?.uid || "";
  const selectedUser = activeUsers.find((item) => item.uid === nextUserUid) || null;

  selectedProductsUserUid = nextUserUid;
  selectedProductsTenantId = selectedUser?.tenantId || "";
  productsUserSelect.innerHTML =
    `<option value="">Selecciona un usuario...</option>` +
    activeUsers
      .map(
        (item) =>
          `<option value="${escapeHtml(item.uid)}"${item.uid === selectedProductsUserUid ? " selected" : ""}>${escapeHtml(item.label)}</option>`
      )
      .join("");
  productsUserSelect.disabled = activeUsers.length === 0;

  if (!activeUsers.length) {
    allProductRows = [];
    setProductsPlaceholder("No hay usuarios activos para consultar productos.");
    setProductsFeedback("");
    syncBackupButtonsState();
    return;
  }

  syncBackupButtonsState();
  if (activeSection === "products") {
    void loadProductsForSelectedUser();
  }
}

function renderSalesUserOptions() {
  if (!salesUserSelect) return;

  const activeUsers = getActiveScopedUsers();
  const previousUserUid = selectedSalesUserUid;
  const nextUserUid =
    previousUserUid && activeUsers.some((item) => item.uid === previousUserUid)
      ? previousUserUid
      : activeUsers[0]?.uid || "";
  const selectedUser = activeUsers.find((item) => item.uid === nextUserUid) || null;

  selectedSalesUserUid = nextUserUid;
  selectedSalesTenantId = selectedUser?.tenantId || "";
  salesUserSelect.innerHTML =
    `<option value="">Selecciona un usuario...</option>` +
    activeUsers
      .map(
        (item) =>
          `<option value="${escapeHtml(item.uid)}"${item.uid === selectedSalesUserUid ? " selected" : ""}>${escapeHtml(item.label)}</option>`
      )
      .join("");
  salesUserSelect.disabled = activeUsers.length === 0;

  if (!activeUsers.length) {
    allSalesRows = [];
    setSalesPlaceholder("No hay usuarios activos para consultar ventas.");
    setSalesFeedback("");
    syncBackupButtonsState();
    return;
  }

  syncBackupButtonsState();
  if (activeSection === "sales") {
    void loadSalesForSelectedUser();
  }
}

function renderCashboxesUserOptions() {
  if (!cashboxesUserSelect) return;

  const activeUsers = getActiveScopedUsers();
  const previousUserUid = selectedCashboxesUserUid;
  const nextUserUid =
    previousUserUid && activeUsers.some((item) => item.uid === previousUserUid)
      ? previousUserUid
      : activeUsers[0]?.uid || "";
  const selectedUser = activeUsers.find((item) => item.uid === nextUserUid) || null;

  selectedCashboxesUserUid = nextUserUid;
  selectedCashboxesTenantId = selectedUser?.tenantId || "";
  cashboxesUserSelect.innerHTML =
    `<option value="">Selecciona un usuario...</option>` +
    activeUsers
      .map(
        (item) =>
          `<option value="${escapeHtml(item.uid)}"${item.uid === selectedCashboxesUserUid ? " selected" : ""}>${escapeHtml(item.label)}</option>`
      )
      .join("");
  cashboxesUserSelect.disabled = activeUsers.length === 0;

  if (!activeUsers.length) {
    allCashboxesRows = [];
    allCashboxesSourceRows = [];
    selectedCashboxRowKey = "";
    selectedCashboxRow = null;
    renderSelectedCashboxDetail();
    setCashboxesPlaceholder("No hay usuarios activos para consultar cajas.");
    setCashboxesFeedback("");
    syncBackupButtonsState();
    return;
  }

  syncBackupButtonsState();
  if (activeSection === "cashboxes") {
    void loadCashboxesForSelectedUser();
  }
}

function handleProductsUserSelectChange() {
  const uid = String(productsUserSelect?.value || "").trim();
  const row = allUserRows.find((entry) => String(entry?.uid || "").trim() === uid);
  selectedProductsUserUid = uid;
  selectedProductsTenantId = String(row?.tenantId || "").trim();
  allProductRows = [];
  syncBackupButtonsState();
  void loadProductsForSelectedUser();
}

function handleProductsSearchInput() {
  if (productsSearchDebounce) {
    clearTimeout(productsSearchDebounce);
  }
  productsSearchDebounce = setTimeout(() => {
    void loadProductsForSelectedUser();
  }, 300);
}

async function loadProductsForSelectedUser() {
  if (!auth.currentUser) return;
  if (!selectedProductsTenantId) {
    allProductRows = [];
    setProductsPlaceholder("Selecciona un usuario activo para ver productos.");
    setProductsFeedback("");
    return;
  }

  const requestId = ++latestProductsRequestId;
  const query = String(productsSearchInput?.value || "").trim();
  setProductsFeedback("Buscando productos...");
  if (productsTableBody) {
    productsTableBody.innerHTML = '<tr><td colspan="6">Cargando productos...</td></tr>';
  }

  try {
    const token = await auth.currentUser.getIdToken(true);
    const params = new URLSearchParams({
      tenantId: selectedProductsTenantId
    });
    if (query) {
      params.set("q", query);
    }

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
    if (requestId !== latestProductsRequestId) return;

    allProductRows = normalizeProductRows(result?.products || result?.rows || []);
    renderProductsTable(allProductRows);
    setProductsFeedback(
      allProductRows.length
        ? `${allProductRows.length} producto(s) encontrado(s).`
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

function handleSalesUserSelectChange() {
  const uid = String(salesUserSelect?.value || "").trim();
  const row = allUserRows.find((entry) => String(entry?.uid || "").trim() === uid);
  selectedSalesUserUid = uid;
  selectedSalesTenantId = String(row?.tenantId || "").trim();
  allSalesRows = [];
  syncBackupButtonsState();
  void loadSalesForSelectedUser();
}

function handleSalesSearchInput() {
  if (salesSearchDebounce) {
    clearTimeout(salesSearchDebounce);
  }
  salesSearchDebounce = setTimeout(() => {
    void loadSalesForSelectedUser();
  }, 300);
}

async function loadSalesForSelectedUser() {
  if (!auth.currentUser) return;
  if (!selectedSalesTenantId) {
    allSalesRows = [];
    setSalesPlaceholder("Selecciona un usuario activo para ver ventas.");
    setSalesFeedback("");
    return;
  }

  const requestId = ++latestSalesRequestId;
  const query = String(salesSearchInput?.value || "").trim();
  setSalesFeedback("Buscando ventas...");
  if (salesTableBody) {
    salesTableBody.innerHTML = '<tr><td colspan="6">Cargando ventas...</td></tr>';
  }

  try {
    const token = await auth.currentUser.getIdToken(true);
    const params = new URLSearchParams({
      tenantId: selectedSalesTenantId
    });
    if (query) {
      params.set("q", query);
    }

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
    if (requestId !== latestSalesRequestId) return;

    allSalesRows = normalizeSalesRows(result?.sales || result?.rows || []);
    renderSalesTable(allSalesRows);
    setSalesFeedback(
      allSalesRows.length ? `${allSalesRows.length} venta(s) encontrada(s).` : "Sin coincidencias para la busqueda."
    );
  } catch (error) {
    console.error(error);
    if (requestId !== latestSalesRequestId) return;
    allSalesRows = [];
    setSalesPlaceholder(error.message || "No se pudieron cargar las ventas.");
    setSalesFeedback(error.message || "No se pudieron cargar las ventas.");
  }
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

function handleCashboxesUserSelectChange() {
  const uid = String(cashboxesUserSelect?.value || "").trim();
  const row = allUserRows.find((entry) => String(entry?.uid || "").trim() === uid);
  selectedCashboxesUserUid = uid;
  selectedCashboxesTenantId = String(row?.tenantId || "").trim();
  allCashboxesRows = [];
  allCashboxesSourceRows = [];
  selectedCashboxRowKey = "";
  selectedCashboxRow = null;
  renderSelectedCashboxDetail();
  syncBackupButtonsState();
  void loadCashboxesForSelectedUser();
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

async function loadCashboxesForSelectedUser(options = {}) {
  if (!auth.currentUser) return;
  if (!selectedCashboxesTenantId) {
    allCashboxesRows = [];
    allCashboxesSourceRows = [];
    selectedCashboxRowKey = "";
    selectedCashboxRow = null;
    renderSelectedCashboxDetail();
    setCashboxesPlaceholder("Selecciona un usuario activo para ver cajas.");
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
    if (forceRemote) {
      const token = await auth.currentUser.getIdToken(true);
      const params = new URLSearchParams({
        tenantId: selectedCashboxesTenantId
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
      sourceRows = Array.isArray(result?.cashboxes || result?.rows)
        ? result.cashboxes || result.rows
        : [];
      await saveCachedCashboxesRows(selectedCashboxesTenantId, sourceRows);
    } else {
      sourceRows = await getCachedCashboxesRows(selectedCashboxesTenantId);
    }
    if (requestId !== latestCashboxesRequestId) return;

    allCashboxesSourceRows = normalizeCashboxesRows(sourceRows);
    allCashboxesRows = applyCashboxesQuery(allCashboxesSourceRows, query);
    renderCashboxesTable(allCashboxesRows);

    if (!allCashboxesSourceRows.length) {
      setCashboxesPlaceholder(
        forceRemote
          ? "No hay cajas para este usuario."
          : "No hay cajas en cache local. Presiona Actualizar para consultar Firebase."
      );
      setCashboxesFeedback(forceRemote ? "No hay cajas para este usuario." : "Cache vacia para este usuario.");
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
      forceRemote
        ? `${allCashboxesRows.length} caja(s) actualizada(s) desde Firebase.`
        : `${allCashboxesRows.length} caja(s) desde cache local.`
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
  pendingGlobalLoads = 0;
  tableBody.innerHTML = '<tr><td colspan="11">Sin datos.</td></tr>';
  if (metricEstimatedRevenue) metricEstimatedRevenue.textContent = "$0,00 / mes";
  if (planCardsNode) planCardsNode.innerHTML = "";
  if (productsUserSelect) {
    productsUserSelect.innerHTML = '<option value="">Selecciona un usuario...</option>';
    productsUserSelect.disabled = true;
  }
  if (salesUserSelect) {
    salesUserSelect.innerHTML = '<option value="">Selecciona un usuario...</option>';
    salesUserSelect.disabled = true;
  }
  if (cashboxesUserSelect) {
    cashboxesUserSelect.innerHTML = '<option value="">Selecciona un usuario...</option>';
    cashboxesUserSelect.disabled = true;
  }
  if (productsSearchInput) productsSearchInput.value = "";
  if (salesSearchInput) salesSearchInput.value = "";
  if (cashboxesSearchInput) cashboxesSearchInput.value = "";
  syncBackupButtonsState();
  setProductsPlaceholder("Selecciona un usuario activo para ver productos.");
  setProductsFeedback("");
  setSalesPlaceholder("Selecciona un usuario activo para ver ventas.");
  setSalesFeedback("");
  setCashboxesPlaceholder("Selecciona un usuario activo para ver cajas.");
  setCashboxesFeedback("");
  renderSelectedCashboxDetail();
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
  activeSection = sectionId === "sales" ? "sales" : activeSection;
  activeSection = sectionId === "cashboxes" ? "cashboxes" : activeSection;

  usersSection?.classList.toggle("hidden", activeSection !== "users");
  plansSection?.classList.toggle("hidden", activeSection !== "plans");
  productsSection?.classList.toggle("hidden", activeSection !== "products");
  salesSection?.classList.toggle("hidden", activeSection !== "sales");
  cashboxesSection?.classList.toggle("hidden", activeSection !== "cashboxes");


  navUsersBtn?.classList.toggle("is-active", activeSection === "users");
  navPlansBtn?.classList.toggle("is-active", activeSection === "plans");
  navProductsBtn?.classList.toggle("is-active", activeSection === "products");
  navSalesBtn?.classList.toggle("is-active", activeSection === "sales");
  navCashboxesBtn?.classList.toggle("is-active", activeSection === "cashboxes");

  if (activeSection === "products" && selectedProductsTenantId) {
    void loadProductsForSelectedUser();
  }
  if (activeSection === "sales" && selectedSalesTenantId) {
    void loadSalesForSelectedUser();
  }
  if (activeSection === "cashboxes" && selectedCashboxesTenantId) {
    void loadCashboxesForSelectedUser();
  }
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

function syncBackupButtonsState() {
  if (productsBackupBtn) productsBackupBtn.disabled = !selectedProductsTenantId;
  if (salesBackupBtn) salesBackupBtn.disabled = !selectedSalesTenantId;
  if (cashboxesBackupBtn) cashboxesBackupBtn.disabled = !selectedCashboxesTenantId;
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
