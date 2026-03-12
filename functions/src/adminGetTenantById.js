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

function applyCors(req, res) {
  const origin = String(req.headers.origin || "").trim();
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.set("Access-Control-Max-Age", "3600");
}

exports.adminGetTenantById = onRequest(async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Metodo no permitido." });
    return;
  }

  const adminUser = await requireAdminEmail(req, res);
  if (!adminUser) return;

  const tenantId = String(req.query.tenantId || req.query.id || "").trim();
  if (!tenantId) {
    res.status(400).json({ ok: false, error: "Falta tenantId." });
    return;
  }

  try {
    const snap = await admin.firestore().collection("tenants").doc(tenantId).get();
    if (!snap.exists) {
      res.status(404).json({ ok: false, error: "Tenant no encontrado.", tenantId });
      return;
    }

    const tenantDoc = snap.data() || {};
    res.status(200).json({
      ok: true,
      tenantId: snap.id,
      tenantDoc,
      tenant: { id: snap.id, ...tenantDoc }
    });
  } catch (error) {
    console.error("adminGetTenantById error:", error);
    res.status(500).json({ ok: false, error: "No se pudo cargar el tenant." });
  }
});
