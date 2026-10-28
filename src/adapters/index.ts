import { AdapterRegistry, defaultRegistry } from '../core/registry';
import { youtubeAdapter } from './youtube';
import { redditAdapter } from './reddit';

export const allAdapters = [
  youtubeAdapter,
  redditAdapter,
];

export function setupRegistry(registry: AdapterRegistry = defaultRegistry): AdapterRegistry {
  for (const adapter of allAdapters) {
    registry.register(adapter);
  }
  return registry;
}

// Auto-register in defaultRegistry
setupRegistry(defaultRegistry);

export { youtubeAdapter, redditAdapter };
