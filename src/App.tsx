import "./App.css";
import useTextWithStore from "./hooks/useTextWithStore";
import useCopy from "./hooks/useCopy";
import useShortcutKey from "./hooks/useShortcutKey";

function App() {
  const [text, setTextWithStore] = useTextWithStore();
  const { isCopied, handleCopy } = useCopy({ windowLabel: "main" });

  useShortcutKey({ key: "c", cmdKey: true }, handleCopy, text);

  return (
    <div className="container">
      <header data-tauri-drag-region className="header">
        Moment Pad
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
      />
    </div>
  );
}

export default App;
