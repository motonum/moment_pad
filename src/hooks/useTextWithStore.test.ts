import { Store } from "@tauri-apps/plugin-store";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedObject,
  vi,
} from "vitest";
import useTextWithStore from "./useTextWithStore";

const mockStoreInstance = (await Store.load(
  "store.json",
)) as MockedObject<Store>;

describe("useTextWithStore", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await mockStoreInstance.clear();
  });

  it("初期化時にストアからテキストを読み込むこと", async () => {
    const { result } = renderHook(() => useTextWithStore("initial text"));

    expect(result.current[0]).toBe("initial text");

    await waitFor(() => {
      expect(mockStoreInstance.get).toHaveBeenCalledWith("text");
    });
  });

  it("setTextWithStoreでテキストを更新し、ストアに保存すること", async () => {
    const { result } = renderHook(() => useTextWithStore("initial text"));

    await waitFor(() => {
      expect(mockStoreInstance.get).toHaveBeenCalledWith("text");
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

  it("ストアに値がある場合、その値を読み込むこと", async () => {
    const storedText = "text from store";

    await mockStoreInstance.set("text", { value: storedText });

    const { result } = renderHook(() => useTextWithStore("initial text"));

    await waitFor(() => {
      expect(result.current[0]).toBe(storedText);
    });
    expect(mockStoreInstance.get).toHaveBeenCalledWith("text");
  });
});
