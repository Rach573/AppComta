import { registerComptaIpcHandlers } from './repository/ComptaIpc';

let repositoriesRegistered = false;

export function registerRepositories(): void {
  if (repositoriesRegistered) {
    return;
  }

  registerComptaIpcHandlers();

  repositoriesRegistered = true;
}
