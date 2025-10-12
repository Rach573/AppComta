"use strict";
const electron = require("electron");
const path = require("node:path");
const node_crypto = require("node:crypto");
const COMPTA_CATEGORY_LABELS = {
  frais_etablissement: "Frais d'etablissement",
  actif_immobilise_brevet: "Actifs immobilises - Brevet",
  actif_immobilise_equipement: "Actifs immobilises - Equipement",
  actifs_circulants_creances: "Actifs circulants - Creances",
  actifs_circulants_stock: "Actifs circulants - Stock",
  actifs_circulants_cash: "Actifs circulants - Cash",
  capitaux_propres_capital_initial: "Fonds propres - Capital initial",
  capitaux_propres_benefices_reportes: "Fonds propres - Benefices reportes",
  dette_long_terme_financiere: "Dettes > 1 an - Dettes financieres",
  dette_court_terme_financiere: "Dettes < 1 an - Dettes financieres",
  dette_court_terme_commerciale: "Dettes < 1 an - Dettes commerciales"
};
const COMPTA_CATEGORY_GROUP = {
  frais_etablissement: { group: "actif", section: "Actif" },
  actif_immobilise_brevet: { group: "actif", section: "Actifs immobilises" },
  actif_immobilise_equipement: { group: "actif", section: "Actifs immobilises" },
  actifs_circulants_creances: { group: "actif", section: "Actifs circulants" },
  actifs_circulants_stock: { group: "actif", section: "Actifs circulants" },
  actifs_circulants_cash: { group: "actif", section: "Actifs circulants" },
  capitaux_propres_capital_initial: { group: "passif", section: "Fonds propres" },
  capitaux_propres_benefices_reportes: { group: "passif", section: "Fonds propres" },
  dette_long_terme_financiere: { group: "passif", section: "Dettes > 1 an" },
  dette_court_terme_financiere: { group: "passif", section: "Dettes < 1 an" },
  dette_court_terme_commerciale: { group: "passif", section: "Dettes < 1 an" }
};
const comptaStore = [
  {
    id: node_crypto.randomUUID(),
    label: "Achat materiel",
    amount: 5e3,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    category: "frais_etablissement"
  },
  {
    id: node_crypto.randomUUID(),
    label: "Facture client",
    amount: 7e4,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    category: "actif_immobilise_equipement"
  },
  {
    id: node_crypto.randomUUID(),
    label: "Capital initial",
    amount: 6e4,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    category: "capitaux_propres_capital_initial"
  },
  {
    id: node_crypto.randomUUID(),
    label: "Benefice reporte",
    amount: -2700,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    category: "capitaux_propres_benefices_reportes"
  },
  {
    id: node_crypto.randomUUID(),
    label: "Stock marchandises",
    amount: 15e3,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    category: "actifs_circulants_stock"
  },
  {
    id: node_crypto.randomUUID(),
    label: "Tresorerie",
    amount: 7300,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    category: "actifs_circulants_cash"
  },
  {
    id: node_crypto.randomUUID(),
    label: "Creances clients",
    amount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    category: "actifs_circulants_creances"
  },
  {
    id: node_crypto.randomUUID(),
    label: "Dettes financieres long terme",
    amount: 5e4,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    category: "dette_long_terme_financiere"
  }
];
async function listComptaEntries() {
  return [...comptaStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
async function insertComptaEntry(payload) {
  const entry = {
    id: node_crypto.randomUUID(),
    label: payload.label,
    amount: payload.amount,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    category: payload.category
  };
  comptaStore.push(entry);
  return entry;
}
async function removeComptaEntry(id) {
  const index = comptaStore.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  comptaStore.splice(index, 1);
  return true;
}
async function computeBalanceSheet() {
  const sectionsMap = {
    actif: /* @__PURE__ */ new Map(),
    passif: /* @__PURE__ */ new Map()
  };
  const getSection = (group, label) => {
    let section = sectionsMap[group].get(label);
    if (!section) {
      section = { label, items: /* @__PURE__ */ new Map(), total: 0 };
      sectionsMap[group].set(label, section);
    }
    return section;
  };
  comptaStore.forEach((entry) => {
    const meta = COMPTA_CATEGORY_GROUP[entry.category];
    const section = getSection(meta.group, meta.section);
    const key = entry.category;
    const item = section.items.get(key);
    if (item) {
      item.amount += entry.amount;
    } else {
      section.items.set(key, { category: entry.category, amount: entry.amount });
    }
    section.total += entry.amount;
  });
  const buildSections = (group) => Array.from(sectionsMap[group].values()).map((section) => ({
    group,
    label: section.label,
    total: section.total,
    items: Array.from(section.items.values()).map((item) => ({
      category: item.category,
      label: COMPTA_CATEGORY_LABELS[item.category],
      amount: item.amount
    }))
  }));
  const assets = buildSections("actif");
  const liabilities = buildSections("passif");
  const totalAssets = assets.reduce((sum, section) => sum + section.total, 0);
  const totalLiabilities = liabilities.reduce(
    (sum, section) => sum + section.total,
    0
  );
  return {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities
  };
}
async function getComptaEntries() {
  return listComptaEntries();
}
async function registerComptaEntry(payload) {
  return insertComptaEntry(payload);
}
async function deleteComptaEntry(id) {
  return removeComptaEntry(id);
}
async function generateBalanceSheet() {
  return computeBalanceSheet();
}
let ipcRegistered = false;
function registerComptaIpcHandlers() {
  if (ipcRegistered) {
    return;
  }
  electron.ipcMain.handle("compta:list", async () => getComptaEntries());
  electron.ipcMain.handle(
    "compta:register",
    async (_event, payload) => registerComptaEntry(payload)
  );
  electron.ipcMain.handle("compta:delete", async (_event, id) => deleteComptaEntry(id));
  electron.ipcMain.handle("compta:balance", async () => generateBalanceSheet());
  ipcRegistered = true;
}
let repositoriesRegistered = false;
function registerRepositories() {
  if (repositoriesRegistered) {
    return;
  }
  registerComptaIpcHandlers();
  repositoriesRegistered = true;
}
const createWindow = async () => {
  const browserWindow = new electron.BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.cjs"),
      sandbox: false,
      contextIsolation: true
    }
  });
  {
    await browserWindow.loadURL("http://localhost:3000");
  }
};
electron.app.whenReady().then(() => {
  registerRepositories();
  return createWindow();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", async () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
//# sourceMappingURL=main.cjs.map
