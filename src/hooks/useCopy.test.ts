import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import useCopy from "./useCopy";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

describe("useCopy", () => {
  const windowLabel = "main";
  const duration = 500;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("テキストをコピーし、状態を更新すること", async () => {
    const { result } = renderHook(() => useCopy({ windowLabel, duration }));
    const textToCopy = "Hello, World!";

    expect(result.current.isCopied).toBe(false);

    await act(async () => {
      await result.current.handleCopy(textToCopy);
    });

    expect(result.current.isCopied).toBe(true);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(textToCopy);

    await act(async () => {
      vi.advanceTimersByTime(duration);
    });

    expect(result.current.isCopied).toBe(false);

    const mockWebview = await WebviewWindow.getByLabel(windowLabel);
    expect(mockWebview?.hide).toHaveBeenCalled();
  });

  it("テキストが空の場合はコピーしないこと", async () => {
    const { result } = renderHook(() => useCopy({ windowLabel, duration }));

    await act(async () => {
      await result.current.handleCopy("");
    });

    expect(result.current.isCopied).toBe(false);
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    const mockWebview = await WebviewWindow.getByLabel(windowLabel);
    expect(mockWebview?.hide).toHaveBeenCalled();
  });

  it("すでにコピー済みの状態の場合はコピーしないこと", async () => {
    const { result } = renderHook(() => useCopy({ windowLabel, duration }));
    const textToCopy = "Hello, World!";

    await act(async () => {
      await result.current.handleCopy(textToCopy);
    });

    expect(result.current.isCopied).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.handleCopy("another text");
    });

    expect(result.current.isCopied).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

    const mockWebview = await WebviewWindow.getByLabel(windowLabel);
    expect(mockWebview?.hide).toHaveBeenCalled();
  });
});
