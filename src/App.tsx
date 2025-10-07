import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback } from "react";
import "./App.css";
import { useCopy, useShortcutKey, useTextWithStore } from "./hooks";
import CheckIcon from "./icons/CheckIcon";
import CopyIcon from "./icons/CopyIcon";
import hideWindow from "./utils/hideWindow";
import isDarkMode from "./utils/isDarkMode";

function App() {
  const [text, setTextWithStore] = useTextWithStore();
  const { isCopied, handleCopy } = useCopy({ windowLabel: "main" });

  const handleCopyShortcutKey = useCallback(
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

  useShortcutKey({ key: "c", cmdKey: true }, handleCopyShortcutKey, text);
  useShortcutKey({ key: "w", cmdKey: true }, hideWindow, "main");

  return (
    <div className="container">
      <header data-tauri-drag-region className="header">
        MomentPad
      </header>
      <button
        type="button"
        className="close-button"
        onClick={() => hideWindow("main")}
      >
        x
      </button>
      <button
        type="button"
        className="copy-button"
        onClick={() => handleCopy(text)}
        disabled={isCopied || !text}
      >
        {isCopied ? (
          <CheckIcon color={isDarkMode() ? "#e5e5e5" : "#333"} />
        ) : (
          <CopyIcon color={isDarkMode() ? "#e5e5e5" : "#333"} size={24} />
        )}
      </button>
      <CodeMirror
        className="memo-pad"
        value={text}
        height="100%"
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          EditorView.lineWrapping,
          EditorView.domEventHandlers({
            copy(event, view) {
              const hasSelection = !view.state.selection.ranges.every(
                (r) => r.empty,
              );
              if (!hasSelection) {
                event.preventDefault();
                return true;
              }
              return false;
            },
          }),
        ]}
        onChange={(value) => setTextWithStore(value)}
        theme={isDarkMode() ? "dark" : "light"}
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
