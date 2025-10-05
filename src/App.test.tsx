import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import * as useCopy from "./hooks/useCopy";
import * as useShortcutKey from "./hooks/useShortcutKey";
import * as useTextWithStore from "./hooks/useTextWithStore";
import "@testing-library/jest-dom";

describe("Appコンポーネント", () => {
  beforeEach(() => {
    vi.spyOn(useTextWithStore, "default").mockReturnValue(["", vi.fn()]);
    vi.spyOn(useCopy, "default").mockReturnValue({
      isCopied: false,
      handleCopy: vi.fn(),
    });
    vi.spyOn(useShortcutKey, "default").mockReturnValue(undefined);

    Object.defineProperty(window, "getSelection", {
      value: () => ({
        toString: vi.fn(() => ""),
      }),
      writable: true,
    });
  });

  it("Appコンポーネントがレンダリングされること", () => {
    render(<App />);
    expect(screen.getByText("MomentPad")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("エディタの値が変更時に更新されること", async () => {
    const setTextWithStore = vi.fn();
    vi.spyOn(useTextWithStore, "default").mockReturnValue([
      "",
      setTextWithStore,
    ]);
    render(<App />);
    const editor = screen.getByRole("textbox");
    await userEvent.type(editor, "Hello");
    expect(setTextWithStore).toHaveBeenLastCalledWith("Hello");
  });

  it("テキストがない場合にコピーボタンが無効になること", () => {
    render(<App />);
    const copyButton = screen.getByRole("button", { name: "copy icon" });
    expect(copyButton).toBeDisabled();
  });

  it("テキストがある場合にコピーボタンが有効になること", () => {
    vi.spyOn(useTextWithStore, "default").mockReturnValue(["Hello", vi.fn()]);
    render(<App />);
    const copyButton = screen.getByRole("button", { name: "copy icon" });
    expect(copyButton).not.toBeDisabled();
  });

  it("コピーボタンをクリックするとhandleCopyが呼ばれること", async () => {
    const handleCopy = vi.fn();
    vi.spyOn(useTextWithStore, "default").mockReturnValue(["Hello", vi.fn()]);
    vi.spyOn(useCopy, "default").mockReturnValue({
      isCopied: false,
      handleCopy,
    });
    render(<App />);
    const copyButton = screen.getByRole("button", { name: "copy icon" });
    await userEvent.click(copyButton);
    expect(handleCopy).toHaveBeenCalledWith("Hello");
  });

  it("isCopiedがtrueの場合、テキストがあってもコピーボタンが無効になること", () => {
    const handleCopy = vi.fn();
    vi.spyOn(useTextWithStore, "default").mockReturnValue(["Hello", vi.fn()]);
    vi.spyOn(useCopy, "default").mockReturnValue({
      isCopied: true,
      handleCopy,
    });
    render(<App />);
    const copyButton = screen.getByRole("button", { name: "check icon" });
    expect(copyButton).toBeDisabled();
  });

  describe("handleShortcutKey", () => {
    it("選択範囲がない場合、handleCopyが呼ばれること", () => {
      const handleCopy = vi.fn();
      vi.spyOn(useTextWithStore, "default").mockReturnValue([
        "test text",
        vi.fn(),
      ]);
      vi.spyOn(useCopy, "default").mockReturnValue({
        isCopied: false,
        handleCopy,
      });
      vi.spyOn(useShortcutKey, "default").mockImplementation(
        (_key, callback, text) => {
          callback(text);
        },
      );
      render(<App />);
      expect(handleCopy).toHaveBeenCalledWith("test text");
    });

    it("選択範囲がテキストと同じ場合、handleCopyが呼ばれること", () => {
      const handleCopy = vi.fn();
      vi.spyOn(useTextWithStore, "default").mockReturnValue([
        "test text",
        vi.fn(),
      ]);
      vi.spyOn(useCopy, "default").mockReturnValue({
        isCopied: false,
        handleCopy,
      });
      vi.spyOn(useShortcutKey, "default").mockImplementation(
        (_key, callback, text) => {
          Object.defineProperty(window, "getSelection", {
            value: () => ({
              toString: vi.fn(() => text),
            }),
          });
          callback(text);
        },
      );
      render(<App />);
      expect(handleCopy).toHaveBeenCalledWith("test text");
    });

    it("選択範囲がテキストと異なる場合、handleCopyが呼ばれないこと", () => {
      const handleCopy = vi.fn();
      vi.spyOn(useTextWithStore, "default").mockReturnValue([
        "test text",
        vi.fn(),
      ]);
      vi.spyOn(useCopy, "default").mockReturnValue({
        isCopied: false,
        handleCopy,
      });
      vi.spyOn(useShortcutKey, "default").mockImplementation(
        (_key, callback, text) => {
          Object.defineProperty(window, "getSelection", {
            value: () => ({
              toString: vi.fn(() => "different text"),
            }),
          });
          callback(text);
        },
      );
      render(<App />);
      expect(handleCopy).not.toHaveBeenCalled();
    });
  });
});
