import { useCallback } from "react";
import "./App.css";
import { useCopy, useShortcutKey, useTextWithStore } from "./hooks";
import MarkdownEditor from "./components/MarkdownEditor";

function App() {
  const [text, setTextWithStore] = useTextWithStore();
  const { isCopied, handleCopy } = useCopy({ windowLabel: "main" });

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

  return (
    <div className="container">
      <header data-tauri-drag-region className="header">
        MomentPad
      </header>
      <button
        type="button"
        className="copy-button"
        onClick={() => handleCopy(text)}
        disabled={isCopied || !text}
      >
        {isCopied ? "Copied!" : "Copy"}
      </button>
      <MarkdownEditor value={text} onChange={setTextWithStore} />
    </div>
  );
}

export default App;
