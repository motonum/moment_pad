import { render, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";
import * as useTextWithStore from "./hooks/useTextWithStore";
import * as useCopy from "./hooks/useCopy";
import * as useShortcutKey from "./hooks/useShortcutKey";
import "@testing-library/jest-dom";

describe("Appコンポーネント", () => {
  beforeEach(() => {
    vi.spyOn(useTextWithStore, "default").mockReturnValue(["", vi.fn()]);
    vi.spyOn(useCopy, "default").mockReturnValue({
      isCopied: false,
      handleCopy: vi.fn(),
    });
    vi.spyOn(useShortcutKey, "default").mockReturnValue(undefined);

    // Mock window.getSelection
    Object.defineProperty(window, 'getSelection', {
      value: () => ({
        toString: vi.fn(() => ''),
      }),
      writable: true,
    });
  });

  it("Appコンポーネントがレンダリングされること", () => {
    render(<App />);
    expect(screen.getByText("MomentPad")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write something...")
    ).toBeInTheDocument();
  });

  it("テキストエリアの値が変更時に更新されること", () => {
    const setTextWithStore = vi.fn();
    vi.spyOn(useTextWithStore, "default").mockReturnValue([
      "",
      setTextWithStore,
    ]);
    render(<App />);
    const textarea = screen.getByPlaceholderText("Write something...");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    expect(setTextWithStore).toHaveBeenCalledWith("Hello");
  });

  it("テキストがない場合にコピーボタンが無効になること", () => {
    render(<App />);
    const copyButton = screen.getByText("Copy");
    expect(copyButton).toBeDisabled();
  });

  it("テキストがある場合にコピーボタンが有効になること", () => {
    vi.spyOn(useTextWithStore, "default").mockReturnValue(["Hello", vi.fn()]);
    render(<App />);
    const copyButton = screen.getByText("Copy");
    expect(copyButton).not.toBeDisabled();
  });

  it("コピーボタンをクリックするとhandleCopyが呼ばれること", () => {
    const handleCopy = vi.fn();
    vi.spyOn(useTextWithStore, "default").mockReturnValue(["Hello", vi.fn()]);
    vi.spyOn(useCopy, "default").mockReturnValue({
      isCopied: false,
      handleCopy,
    });
    render(<App />);
    const copyButton = screen.getByText("Copy");
    fireEvent.click(copyButton);
    expect(handleCopy).toHaveBeenCalledWith("Hello");
  });

  describe("handleShortcutKey", () => {
    it("選択範囲がない場合、handleCopyが呼ばれること", () => {
      const handleCopy = vi.fn();
      vi.spyOn(useTextWithStore, "default").mockReturnValue(["test text", vi.fn()]);
      vi.spyOn(useCopy, "default").mockReturnValue({
        isCopied: false,
        handleCopy,
      });
      vi.spyOn(useShortcutKey, "default").mockImplementation((_key, callback, text) => {
        callback(text);
      });
      render(<App />);
      expect(handleCopy).toHaveBeenCalledWith("test text");
    });

    it("選択範囲がテキストと同じ場合、handleCopyが呼ばれること", () => {
      const handleCopy = vi.fn();
      vi.spyOn(useTextWithStore, "default").mockReturnValue(["test text", vi.fn()]);
      vi.spyOn(useCopy, "default").mockReturnValue({
        isCopied: false,
        handleCopy,
      });
      vi.spyOn(useShortcutKey, "default").mockImplementation((_key, callback, text) => {
        Object.defineProperty(window, 'getSelection', {
          value: () => ({
            toString: vi.fn(() => text),
          }),
        });
        callback(text);
      });
      render(<App />);
      expect(handleCopy).toHaveBeenCalledWith("test text");
    });

    it("選択範囲がテキストと異なる場合、handleCopyが呼ばれないこと", () => {
      const handleCopy = vi.fn();
      vi.spyOn(useTextWithStore, "default").mockReturnValue(["test text", vi.fn()]);
      vi.spyOn(useCopy, "default").mockReturnValue({
        isCopied: false,
        handleCopy,
      });
      vi.spyOn(useShortcutKey, "default").mockImplementation((_key, callback, text) => {
        Object.defineProperty(window, 'getSelection', {
          value: () => ({
            toString: vi.fn(() => "different text"),
          }),
        });
        callback(text);
      });
      render(<App />);
      expect(handleCopy).not.toHaveBeenCalled();
    });
  });

  describe("handleKeyDown", () => {
    it("Tabキーで2スペースが挿入されること", () => {
      const setTextWithStore = vi.fn();
      vi.spyOn(useTextWithStore, "default").mockReturnValue([
        "initial text",
        setTextWithStore,
      ]);
      render(<App />);
      const textarea = screen.getByPlaceholderText("Write something...");

      // Mock textareaRef.current
      Object.defineProperty(textarea, 'selectionStart', {
        value: 8,
        writable: true,
      });
      Object.defineProperty(textarea, 'selectionEnd', {
        value: 8,
        writable: true,
      });

      fireEvent.keyDown(textarea, { key: "Tab", preventDefault: () => {} });

      expect(setTextWithStore).toHaveBeenCalledWith("initial   text");
    });

    it("Tabキーで選択範囲が2スペースに置換されること", () => {
      const setTextWithStore = vi.fn();
      vi.spyOn(useTextWithStore, "default").mockReturnValue([
        "initial text",
        setTextWithStore,
      ]);
      render(<App />);
      const textarea = screen.getByPlaceholderText("Write something...");

      // Mock textareaRef.current
      Object.defineProperty(textarea, 'selectionStart', {
        value: 8,
        writable: true,
      });
      Object.defineProperty(textarea, 'selectionEnd', {
        value: 12,
        writable: true,
      });

      fireEvent.keyDown(textarea, { key: "Tab", preventDefault: () => {} });

      expect(setTextWithStore).toHaveBeenCalledWith("initial   ");
    });
  });
});
