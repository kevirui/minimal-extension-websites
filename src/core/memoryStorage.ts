import { StorageBackend } from './storage';

export class MemoryStorageBackend implements StorageBackend {
  private data: Record<string, unknown> = {};
  private listeners: Array<(newValue: unknown) => void> = [];
  public shouldFailGet = false;
  public shouldFailSet = false;

  constructor(initialData: Record<string, unknown> = {}) {
    this.data = { ...initialData };
  }

  async get(key: string): Promise<unknown> {
    if (this.shouldFailGet) {
      throw new Error('Simulated storage read failure');
    }
    return this.data[key];
  }

  async set(key: string, value: unknown): Promise<void> {
    if (this.shouldFailSet) {
      throw new Error('Simulated storage write failure');
    }
    this.data[key] = value;
    for (const listener of this.listeners) {
      listener(value);
    }
  }

  onChange(callback: (newValue: unknown) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  clear(): void {
    this.data = {};
  }
}
