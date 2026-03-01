"use strict";

const admin = require("firebase-admin");

const ALLOWED_ADMIN_EMAILS = new Set([
  "artbenitezdev@gmail.com",
  "admin@stockfacil.com.ar"
]);

function getBearerToken(req) {
  const header = String(req.headers.authorization || "");
  if (!header.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length).trim();
}

async function requireAdminEmail(req, res) {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ ok: false, error: "Falta token de autorizacion." });
    return null;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const email = String(decoded.email || "").trim().toLowerCase();
    if (!ALLOWED_ADMIN_EMAILS.has(email)) {
      res.status(403).json({ ok: false, error: "Cuenta sin permisos de administrador." });
      return null;
    }
    return decoded;
  } catch (error) {
    console.error("Error validando token admin:", error);
    res.status(401).json({ ok: false, error: "Token invalido o expirado." });
    return null;
  }
}

module.exports = {
  ALLOWED_ADMIN_EMAILS,
  requireAdminEmail
};

