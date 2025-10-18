import { comptaRepository } from './repositoryInvok';
import type IElectronServices from '@shared/types/interfaces/IElectronServices';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  ajouterEcriture: (description: string, montant: number) =>
    ipcRenderer.invoke('ajouter-ecriture', description, montant)
});

const electronService: IElectronServices = {
  compta: comptaRepository,
};

contextBridge.exposeInMainWorld('electronService', electronService);
