"use strict";

const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { requireAdminEmail } = require("./adminAuthGuard");

if (!admin.apps.length) {
  admin.initializeApp();
}

const ALLOWED_ORIGINS = new Set([
  "https://admin.stockfacil.com.ar",
  "https://kiosco-stock-493c6.web.app",
  "https://kiosco-stock-493c6.firebaseapp.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

const TENANT_KEYS = new Set([
  "tenantid",
  "tenant_id",
  "idtenant",
  "id_tenant",
  "tenant"
]);

const BACKUP_COLLECTION_BY_TYPE = new Map([
  ["products", "productos"],
  ["producto", "productos"],
  ["productos", "productos"],
  ["sales", "ventas"],
  ["sale", "ventas"],
  ["venta", "ventas"],
  ["ventas", "ventas"],
  ["cashboxes", "cajas"],
  ["cashbox", "cajas"],
  ["caja", "cajas"],
  ["cajas", "cajas"]
]);

const MAX_IMPORT_ROWS = 12000;
const BATCH_SIZE = 400;

function applyCors(req, res) {
  const origin = String(req.headers.origin || "").trim();
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.set("Access-Control-Max-Age", "3600");
}

function isObjectRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeBackupType(value) {
  return String(value || "").trim().toLowerCase();
}

function resolveCollectionName(backupTypeRaw) {
  const key = normalizeBackupType(backupTypeRaw);
  return BACKUP_COLLECTION_BY_TYPE.get(key) || "";
}

function parseBackupPayload(raw) {
  if (Array.isArray(raw)) {
    return { data: raw };
  }
  if (isObjectRecord(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return {};
    return JSON.parse(text);
  }
  return {};
}

function extractBackupRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!isObjectRecord(payload)) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function normalizeKey(key) {
  return String(key || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w]/g, "");
}

function replaceTenantReferences(value, targetTenantId, sourceTenantId, seen = new WeakSet()) {
  if (Array.isArray(value)) {
    return value.map((entry) => replaceTenantReferences(entry, targetTenantId, sourceTenantId, seen));
  }

  if (isObjectRecord(value)) {
    if (seen.has(value)) return null;
    seen.add(value);
    const out = {};
    Object.entries(value).forEach(([key, entry]) => {
      const normalized = normalizeKey(key);
      if (TENANT_KEYS.has(normalized)) {
        out[key] = targetTenantId;
        return;
      }
      out[key] = replaceTenantReferences(entry, targetTenantId, sourceTenantId, seen);
    });
    return out;
  }

  if (
    typeof value === "string" &&
    sourceTenantId &&
    value.trim() &&
    value.trim() === sourceTenantId
  ) {
    return targetTenantId;
  }

  return value;
}

function sanitizeDocId(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 120);
}

function isMeaningfulId(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === "-" || normalized === "sin-id" || normalized === "na" || normalized === "null") {
    return false;
  }
  return true;
}

function resolveDocId(sourceRow, transformedRow, backupType) {
  const type = normalizeBackupType(backupType);
  const source = isObjectRecord(sourceRow) ? sourceRow : {};
  const transformed = isObjectRecord(transformedRow) ? transformedRow : {};

  const candidates = [
    source.id,
    transformed.id,
    source.docId,
    transformed.docId,
    source.uid,
    transformed.uid
  ];

  if (type === "products" || type === "producto" || type === "productos") {
    candidates.push(source.codigo, transformed.codigo, source.barcode, transformed.barcode);
  }
  if (type === "sales" || type === "venta" || type === "ventas") {
    candidates.push(source.ventaId, transformed.ventaId, source.saleId, transformed.saleId);
  }
  if (type === "cashboxes" || type === "cashbox" || type === "caja" || type === "cajas") {
    candidates.push(source.cajaId, transformed.cajaId, source.cashboxId, transformed.cashboxId);
  }

  for (const candidate of candidates) {
    if (isMeaningfulId(candidate)) {
      const docId = sanitizeDocId(candidate);
      if (docId) return docId;
    }
  }
  return "";
}

function normalizeImportRow(rawRow, backupType, targetTenantId, sourceTenantId) {
  const baseRow = isObjectRecord(rawRow?.raw) ? rawRow.raw : rawRow;
  if (!isObjectRecord(baseRow)) return null;
  const transformed = replaceTenantReferences(baseRow, targetTenantId, sourceTenantId);
  if (!isObjectRecord(transformed)) return null;

  transformed.tenantId = targetTenantId;

  if (
    (backupType === "sales" || backupType === "venta" || backupType === "ventas") &&
    !String(transformed.createdAt || "").trim() &&
    String(transformed.fecha || "").trim()
  ) {
    transformed.createdAt = transformed.fecha;
  }

  delete transformed.rowKey;
  delete transformed.aperturaTs;
  delete transformed.fechaTs;
  delete transformed.createdAtTs;

  return transformed;
}

exports.adminImportBackup = onRequest(async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Metodo no permitido." });
    return;
  }

  const adminUser = await requireAdminEmail(req, res);
  if (!adminUser) return;

  try {
    const body = isObjectRecord(req.body) ? req.body : {};
    const targetTenantId = String(body.targetTenantId || body.tenantId || "").trim();
    const backupType = normalizeBackupType(body.backupType || body.type);
    const collectionName = resolveCollectionName(backupType);
    if (!targetTenantId) {
      res.status(400).json({ ok: false, error: "Falta targetTenantId." });
      return;
    }
    if (!collectionName) {
      res.status(400).json({ ok: false, error: "Tipo de backup no soportado." });
      return;
    }

    const parsedPayload = parseBackupPayload(
      body.backupPayload ?? body.payload ?? body.backup ?? body.data ?? []
    );
    const rows = extractBackupRows(parsedPayload);
    if (!rows.length) {
      res.status(400).json({ ok: false, error: "El backup no contiene datos para importar." });
      return;
    }
    if (rows.length > MAX_IMPORT_ROWS) {
      res.status(400).json({
        ok: false,
        error: `El backup supera el limite permitido (${MAX_IMPORT_ROWS} registros).`
      });
      return;
    }

    const db = admin.firestore();
    const tenantRef = db.collection("tenants").doc(targetTenantId);
    const tenantSnap = await tenantRef.get();
    if (!tenantSnap.exists) {
      res.status(404).json({ ok: false, error: "Tenant destino no encontrado." });
      return;
    }

    const sourceTenantId = String(parsedPayload?.tenantId || body.sourceTenantId || "").trim();
    // Ajusta esta ruta si tu modelo real no usa subcolecciones dentro de `tenants/{tenantId}`.
    const collectionRef = tenantRef.collection(collectionName);
    const fileName = String(body.fileName || "").trim();
    const importTag = {
      importedAt: admin.firestore.FieldValue.serverTimestamp(),
      importedByEmail: String(adminUser?.email || "").trim(),
      sourceTenantId: sourceTenantId || null,
      sourceFileName: fileName || null,
      backupType
    };

    let imported = 0;
    let skipped = 0;
    const pendingWrites = [];
    for (const row of rows) {
      const normalized = normalizeImportRow(row, backupType, targetTenantId, sourceTenantId);
      if (!isObjectRecord(normalized)) {
        skipped += 1;
        continue;
      }
      const preferredId = resolveDocId(row, normalized, backupType);
      pendingWrites.push({ preferredId, payload: normalized });
    }

    if (!pendingWrites.length) {
      res.status(400).json({ ok: false, error: "No se encontraron registros validos para importar." });
      return;
    }

    for (let index = 0; index < pendingWrites.length; index += BATCH_SIZE) {
      const chunk = pendingWrites.slice(index, index + BATCH_SIZE);
      const batch = db.batch();

      chunk.forEach((entry) => {
        const docRef = entry.preferredId ? collectionRef.doc(entry.preferredId) : collectionRef.doc();
        const payload = {
          ...entry.payload,
          tenantId: targetTenantId,
          __backupImport: importTag
        };
        if (!isMeaningfulId(payload.id)) {
          payload.id = docRef.id;
        }
        batch.set(docRef, payload, { merge: true });
        imported += 1;
      });

      await batch.commit();
    }

    res.status(200).json({
      ok: true,
      imported,
      skipped,
      backupType,
      collection: collectionName,
      targetTenantId
    });
  } catch (error) {
    console.error("adminImportBackup error:", error);
    const message =
      error && typeof error.message === "string" && error.message.trim()
        ? error.message
        : "No se pudo importar el backup.";
    res.status(500).json({ ok: false, error: message });
  }
});
