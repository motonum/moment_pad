import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, MockedObject } from "vitest";
import useTextWithStore from "./useTextWithStore";
import { Store } from "@tauri-apps/plugin-store";

const mockStoreInstance = (await Store.load(
  "store.json"
)) as MockedObject<Store>;
describe("useTextWithStore", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await mockStoreInstance.clear();
  });

  it("初期化時にストアからテキストを読み込むこと", async () => {
    const { result } = renderHook(() => useTextWithStore("initial text"));

    expect(result.current[0]).toBe("initial text");

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current[0]).toBe("initial text");
      });
    });

    expect(mockStoreInstance.get).toHaveBeenCalledWith("text");
  });

  it("setTextWithStoreでテキストを更新し、ストアに保存すること", async () => {
    const { result } = renderHook(() => useTextWithStore("initial text"));

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current[0]).toBe("initial text");
      });
    });

    const newText = "updated text";
    await act(async () => {
      result.current[1](newText);
    });

    expect(result.current[0]).toBe(newText);

    expect(mockStoreInstance.set).toHaveBeenCalledWith("text", {
      value: newText,
    });
    expect(mockStoreInstance.save).toHaveBeenCalled();
  });

  it("ストアに値がない場合、初期テキストを維持すること", async () => {
    const { result } = renderHook(() => useTextWithStore("initial text"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current[0]).toBe("initial text");
    expect(mockStoreInstance.get).toHaveBeenCalledWith("text");
  });
});
