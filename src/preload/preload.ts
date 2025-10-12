import { contextBridge } from 'electron';
import { comptaRepository } from './repositoryInvok';
import type IElectronServices from '@shared/types/interfaces/IElectronServices';

const electronService: IElectronServices = {
  compta: comptaRepository,
};

contextBridge.exposeInMainWorld('electronService', electronService);
