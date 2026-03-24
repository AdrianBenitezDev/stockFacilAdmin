"use strict";

const { adminGetTenantById } = require("./adminGetTenantById");
const { adminImportBackup } = require("./adminImportBackup");

exports.adminGetTenantById = adminGetTenantById;
exports.adminImportBackup = adminImportBackup;
