import { useCallback, useRef } from "react";
import "./App.css";
import { useCopy, useShortcutKey, useTextWithStore } from "./hooks";

function App() {
  const [text, setTextWithStore] = useTextWithStore();
  const { isCopied, handleCopy } = useCopy({ windowLabel: "main" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleShortcutKey = useCallback(
    (text: string) => {
      const selection = getSelection();
      if (
        !selection ||
        selection.toString() === "" ||
        selection.toString() === text
      ) {
        handleCopy(text);
      }
    },
    [handleCopy],
  );

  useShortcutKey({ key: "c", cmdKey: true }, handleShortcutKey, text);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== "Tab") return;
      e.preventDefault();

      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const numSpace = 2;
      const spaceStr = Array(numSpace).fill(" ").join("");
      console.log(spaceStr);

      const newText = `${text.substring(0, start)}${spaceStr}${text.substring(
        end,
      )}`;
      setTextWithStore(newText);

      setTimeout(() => {
        textarea.selectionStart = start + numSpace;
        textarea.selectionEnd = start + numSpace;
      }, 0);
    },
    [text, setTextWithStore],
  );

  return (
    <div className="container">
      <header data-tauri-drag-region className="header">
        MomentPad
      </header>
      <button
        className="copy-button"
        onClick={() => handleCopy(text)}
        disabled={isCopied || !text}
      >
        {isCopied ? "Copied!" : "Copy"}
      </button>
      <textarea
        ref={textareaRef}
        className="memo-pad"
        value={text}
        onChange={(e) => setTextWithStore(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write something..."
        autoFocus={true}
        autoCorrect="off"
      />
    </div>
  );
}

export default App;
