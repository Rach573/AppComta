import { registerComptaIpcHandlers } from './repository/registerComptaRepo';

let repositoriesRegistered = false;

export function registerRepositories(): void {
  if (repositoriesRegistered) {
    return;
  }

  registerComptaIpcHandlers();

  repositoriesRegistered = true;
}
