import { useCallback, useState } from "react";
import "./App.css";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

function App() {
  const [text, setText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (text && !isCopied) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(async () => {
          setIsCopied(false);
          const window = await WebviewWindow.getByLabel("main");
          if (window) {
            await window.hide();
          }
        }, 500);
      });
    }
  }, [text, isCopied, setIsCopied]);

  const handleShortcutKey = useCallback(
    (e: React.KeyboardEvent) => {
      const selection = getSelection();
      if (selection && selection.toString() !== "") {
        return;
      }

      const ua = navigator.userAgent.toLowerCase();
      const isWin = ua.indexOf("windows nt") !== -1;
      const isMac = ua.indexOf("mac os x") !== -1;

      const modKeys = ["metaKey", "ctrlKey", "altKey", "shiftKey"] as const;
      const keyBinding: { key: string } & {
        [k in (typeof modKeys)[number]]: boolean;
      } = {
        key: "c",
        metaKey: isMac,
        ctrlKey: isWin,
        altKey: false,
        shiftKey: false,
      };

      if ((["key", ...modKeys] as const).every((k) => e[k] === keyBinding[k])) {
        handleCopy();
      }
    },
    [handleCopy]
  );

  return (
    <div className="container">
      <header data-tauri-drag-region className="header">
        Moment Pad
      </header>
      <button
        className="copy-button"
        onClick={handleCopy}
        disabled={isCopied || !text}
      >
        {isCopied ? "Copied!" : "Copy"}
      </button>
      <textarea
        className="memo-pad"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleShortcutKey}
        placeholder="Write something..."
        autoFocus={true}
      />
    </div>
  );
}

export default App;
