const { MakerSquirrel } = require('@electron-forge/maker-squirrel');
const { default: MakerZip } = require('@electron-forge/maker-zip');
const { default: MakerDeb } = require('@electron-forge/maker-deb');
const { default: MakerRpm } = require('@electron-forge/maker-rpm');
const { VitePlugin } = require('@electron-forge/plugin-vite');

/** @type {import('@electron-forge/shared-types').ForgeConfig} */
module.exports = {
  // Dossier de sortie des artefacts (par défaut 'out')
  outDir: 'dist',
  packagerConfig: {
    asar: true,
    // Options passées à electron-packager
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
};
