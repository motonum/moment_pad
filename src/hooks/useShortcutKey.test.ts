import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useShortcutKey from "./useShortcutKey";

describe("useShortcutKey", () => {
  const callback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fireKeyDown = (
    key: string,
    options: Partial<KeyboardEventInit> = {},
  ) => {
    const event = new KeyboardEvent("keydown", { key, ...options });
    window.dispatchEvent(event);
  };

  it("キーが押されたときにコールバックが呼ばれること", () => {
    renderHook(() => useShortcutKey({ key: "k" }, callback));
    fireKeyDown("k");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("違うキーが押されたときにはコールバックが呼ばれないこと", () => {
    renderHook(() => useShortcutKey({ key: "k" }, callback));
    fireKeyDown("j");
    expect(callback).not.toHaveBeenCalled();
  });

  describe("macOSでの修飾子キー", () => {
    beforeEach(() => {
      vi.spyOn(navigator, "userAgent", "get").mockReturnValue("mac os x");
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("cmd + kでコールバックが呼ばれること", () => {
      renderHook(() => useShortcutKey({ key: "k", cmdKey: true }, callback));
      fireKeyDown("k", { metaKey: true });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("ctrl + kではコールバックが呼ばれないこと", () => {
      renderHook(() => useShortcutKey({ key: "k", cmdKey: true }, callback));
      fireKeyDown("k", { ctrlKey: true });
      expect(callback).not.toHaveBeenCalled();
    });

    it("alt + shift + kでコールバックが呼ばれること", () => {
      renderHook(() =>
        useShortcutKey({ key: "k", altKey: true, shiftKey: true }, callback),
      );
      fireKeyDown("k", { altKey: true, shiftKey: true });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("修飾子キーが足りない場合はコールバックが呼ばれないこと", () => {
      renderHook(() =>
        useShortcutKey({ key: "k", cmdKey: true, altKey: true }, callback),
      );
      fireKeyDown("k", { metaKey: true });
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("Windowsでの修飾子キー", () => {
    beforeEach(() => {
      vi.spyOn(navigator, "userAgent", "get").mockReturnValue("windows nt");
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("ctrl + k（cmdKeyからマッピング）でコールバックが呼ばれること", () => {
      renderHook(() => useShortcutKey({ key: "k", cmdKey: true }, callback));
      fireKeyDown("k", { ctrlKey: true });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("meta + kではコールバックが呼ばれないこと", () => {
      renderHook(() => useShortcutKey({ key: "k", cmdKey: true }, callback));
      fireKeyDown("k", { metaKey: true });
      expect(callback).not.toHaveBeenCalled();
    });
  });

  it("コールバックに引数が渡されること", () => {
    const arg1 = "hello";
    const arg2 = 123;
    renderHook(() => useShortcutKey({ key: "k" }, callback, arg1, arg2));
    fireKeyDown("k");
    expect(callback).toHaveBeenCalledWith(arg1, arg2);
  });

  it("アンマウント時にイベントリスナーがクリーンアップされること", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useShortcutKey({ key: "k" }, callback),
    );

    expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    // Check if the same handler was removed
    expect(removeSpy.mock.calls[0][1]).toBe(addSpy.mock.calls[0][1]);
  });
});
