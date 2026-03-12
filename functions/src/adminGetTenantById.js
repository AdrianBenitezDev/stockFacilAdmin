"use strict";

const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { requireAdminEmail } = require("./adminAuthGuard");

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.adminGetTenantById = onRequest(async (req, res) => {
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

