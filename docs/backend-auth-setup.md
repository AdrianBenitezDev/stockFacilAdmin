# Restriccion admin en backend (Cloud Functions)

Este proyecto frontend ya usa whitelist de emails. Para aplicar lo mismo en backend, usa:

- `functions/src/adminAuthGuard.js`

## Uso en cada endpoint admin

En tus funciones `adminManage*` agrega este patron al inicio del handler:

```js
const { requireAdminEmail } = require("./adminAuthGuard");

exports.adminManageProducts = onRequest(async (req, res) => {
  const adminUser = await requireAdminEmail(req, res);
  if (!adminUser) return;

  // ... logica protegida
});
```

## Emails autorizados

- `artbenitezdev@gmail.com`
- `admin@stockfacil.com.ar`

## Nota

Si el backend vive en otro repositorio (por ejemplo `functions/` separado), copia `adminAuthGuard.js` ahi y aplicalo en todos los endpoints administrativos:

- `adminGetUsersOverview`
- `adminManagePlans`
- `adminManageAccounts`
- `adminManageProducts`
- `adminManageSales`
- `adminManageCashboxes`
- `adminManageBackups`
- `adminReadBackup`
- `adminGetBackupDownloadUrl`
- `adminGetTenantById`
