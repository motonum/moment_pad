import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback } from "react";
import { useCopy, useShortcutKey, useTextWithStore } from "./hooks";
import CheckIcon from "./icons/CheckIcon";
import CopyIcon from "./icons/CopyIcon";
import hideWindow from "./utils/hideWindow";
import isDarkMode from "./utils/isDarkMode";

// CodeMirror theme using EditorView.theme()
const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "16px",
    fontFamily: "sans-serif",
  },
  ".cm-content": {
    caretColor: "#333",
    backgroundColor: "transparent",
  },
  ".cm-scroller": {
    padding: "16px 48px",
  },
  ".cm-editor": {
    outline: "none",
  },
  ".cm-gutter": {
    backgroundColor: "transparent",
  },
}, { dark: false });

const editorThemeDark = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "16px",
    fontFamily: "sans-serif",
  },
  ".cm-content": {
    caretColor: "#e5e5e5",
    backgroundColor: "transparent",
  },
  ".cm-scroller": {
    padding: "16px 48px",
  },
  ".cm-editor": {
    outline: "none",
  },
  ".cm-gutter": {
    backgroundColor: "transparent",
  },
}, { dark: true });

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

  const darkMode = isDarkMode();

  return (
    <div className="relative w-screen h-screen overflow-hidden rounded-[10px] border-[0.5px] border-[#aaa] bg-white/90 dark:bg-[rgba(30,30,30,0.95)] dark:border-black">
      <header 
        data-tauri-drag-region 
        className="absolute top-0 h-7 w-screen px-5 py-2 border-b border-[#aaa] text-xs select-none cursor-default text-[#333] dark:text-[#e5e5e5]"
      >
        MomentPad
      </header>
      <button
        type="button"
        className="absolute top-[5px] right-[10px] border-none cursor-pointer text-sm z-10 select-none text-[#333] dark:text-[#e5e5e5]"
        onClick={() => hideWindow("main")}
      >
        x
      </button>
      <button
        type="button"
        className={`
          absolute top-10 right-[10px] px-[5px] pt-[5px] pb-[3px]
          border rounded-[5px] cursor-pointer text-sm z-10
          transition-all duration-200 ease-in-out
          select-none opacity-80
          ${darkMode 
            ? 'bg-[#2c2c2c] border-[#444] hover:bg-[#3a3a3a]' 
            : 'bg-[#333] border-[#333] hover:bg-[#555]'
          }
          disabled:cursor-not-allowed disabled:opacity-70
          ${darkMode
            ? 'disabled:bg-[#444] disabled:border-[#555] disabled:hover:bg-[#444]'
            : 'disabled:bg-[#ccc] disabled:hover:bg-[#ccc]'
          }
        `}
        onClick={() => handleCopy(text)}
        disabled={isCopied || !text}
      >
        {isCopied ? (
          <CheckIcon color={darkMode ? "#e5e5e5" : "#333"} />
        ) : (
          <CopyIcon color={darkMode ? "#e5e5e5" : "#333"} size={24} />
        )}
      </button>
      <CodeMirror
        className="absolute top-7 bottom-0 w-screen border-none outline-none resize-none overflow-hidden"
        value={text}
        height="100%"
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          EditorView.lineWrapping,
          darkMode ? editorThemeDark : editorTheme,
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
        theme={darkMode ? "dark" : "light"}
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
