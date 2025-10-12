"use strict";
const electron = require("electron");
const comptaRepository = {
  list: async () => electron.ipcRenderer.invoke("compta:list"),
  register: async (payload) => electron.ipcRenderer.invoke("compta:register", payload),
  remove: async (id) => electron.ipcRenderer.invoke("compta:delete", id),
  balance: async () => electron.ipcRenderer.invoke("compta:balance")
};
const electronService = {
  compta: comptaRepository
};
electron.contextBridge.exposeInMainWorld("electronService", electronService);
//# sourceMappingURL=preload.cjs.map
