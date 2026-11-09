import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'ClearFrame — Distraction-Free Browsing',
    description: 'Minimalist, privacy-first browser extension that removes distracting UI components from websites.',
    version: '0.1.0',
    permissions: ['storage'],
    host_permissions: [
      '*://*.youtube.com/*',
      '*://*.reddit.com/*',
      '*://*.instagram.com/*',
      '*://*.linkedin.com/*'
    ],
    action: {
      default_title: 'ClearFrame Settings',
    },
  },
});
