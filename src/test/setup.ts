import { vi } from "vitest";

// Mock clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

// Mock Tauri APIs
vi.mock("@tauri-apps/api/webviewWindow", () => ({
  WebviewWindow: {
    getByLabel: vi.fn().mockResolvedValue({
      hide: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock("@tauri-apps/plugin-store", () => {
  const fakeStore: Record<string, string> = {};

  const mockStoreInstance = {
    get: vi.fn().mockImplementation(async (key) => fakeStore[key] ?? null),
    set: vi.fn().mockImplementation(async (key, value) => {
      fakeStore[key] = value;
    }),
    save: vi.fn().mockResolvedValue(undefined),

    // For testing
    clear: vi.fn().mockImplementation(async () => {
      Object.keys(fakeStore).forEach((key) => {
        delete fakeStore[key];
      });
    }),
  };

  return {
    Store: {
      load: vi.fn().mockResolvedValue(mockStoreInstance),
    },
  };
});
