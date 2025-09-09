import { useCallback } from "react";
import "./App.css";
import { useTextWithStore, useCopy, useShortcutKey } from "./hooks";

function App() {
  const [text, setTextWithStore] = useTextWithStore();
  const { isCopied, handleCopy } = useCopy({ windowLabel: "main" });

  const handleShortcutKey = useCallback(
    (text: string) => {
      const selection = getSelection();
      if (!selection || selection.toString() === "") {
        handleCopy(text);
      }
    },
    [handleCopy]
  );

  useShortcutKey({ key: "c", cmdKey: true }, handleShortcutKey, text);

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
        className="memo-pad"
        value={text}
        onChange={(e) => setTextWithStore(e.target.value)}
        placeholder="Write something..."
        autoFocus={true}
        autoCorrect="off"
      />
    </div>
  );
}

export default App;
