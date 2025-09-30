import { useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import "./App.css";
import { useCopy, useShortcutKey, useTextWithStore } from "./hooks";

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
      <CodeMirror
        className="memo-pad"
        value={text}
        height="100%"
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
        ]}
        onChange={(value) => setTextWithStore(value)}
        theme={
          window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
            ? "dark"
            : "light"
        }
        autoFocus={true}
        placeholder="Write something..."
        basicSetup={{
          lineNumbers: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          foldGutter: false,
        }}
      />
    </div>
  );
}

export default App;
