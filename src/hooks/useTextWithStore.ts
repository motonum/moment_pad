import { Store } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

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
    [store],
  );

  return [text, setTextWithStore] as const;
};

export default useTextWithStore;
