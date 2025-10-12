/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

import type IElectronServices from '@shared/types/interfaces/IElectronServices';

declare global {
  interface Window {
    electronService: IElectronServices;
  }
}
