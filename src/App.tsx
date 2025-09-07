import { useCallback, useState, useEffect } from "react";
import "./App.css";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Store } from "@tauri-apps/plugin-store";

const useTextWithStore = (initialText: string = "") => {
  const [text, setText] = useState<string>(initialText);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const init = async () => {
      const loaded = await Store.load("store.json");
      setStore(loaded);
    };
    init();
  }, []);

  useEffect(() => {
    if (!store) return;
    const load = async () => {
      const savedText = await store.get<{ value: string }>("text");
      if (savedText) {
        setText(savedText.value);
      }
    };
    load();
  }, [store]);

  const setTextWithStore = useCallback(
    (text: string) => {
      setText(text);
      if (!store) return;
      const save = async () => {
        await store.set("text", { value: text });
        await store.save();
      };
      save();
    },
    [store]
  );

  return [text, setTextWithStore] as const;
};

function App() {
  const [text, setTextWithStore] = useTextWithStore();
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
        onChange={(e) => setTextWithStore(e.target.value)}
        onKeyDown={handleShortcutKey}
        placeholder="Write something..."
        autoFocus={true}
      />
    </div>
  );
}

export default App;
