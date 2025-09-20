import { useCallback, useEffect } from "react";

const nativeModKeys = ["metaKey", "ctrlKey", "altKey", "shiftKey"] as const;
type KeyBinding = { key: string } & {
  [k in (typeof nativeModKeys)[number]]: boolean;
};

const shortcutModKeys = ["cmdKey", "altKey", "shiftKey"] as const;
type HotKey = { key: string } & {
  [k in (typeof shortcutModKeys)[number]]?: boolean;
};

const useShortcutKey = <T>(
  hotKey: HotKey,
  callback: (...args: T[]) => void,
  ...args: T[]
) => {
  const eventHandler = useCallback(
    (e: KeyboardEvent) => {
      const ua = navigator.userAgent.toLowerCase();
      const isWin = ua.indexOf("windows nt") !== -1;
      const isMac = ua.indexOf("mac os x") !== -1;

      const keyBinding: KeyBinding = {
        key: hotKey.key,
        metaKey: isMac && !!hotKey.cmdKey,
        ctrlKey: isWin && !!hotKey.cmdKey,
        altKey: !!hotKey.altKey,
        shiftKey: !!hotKey.shiftKey,
      };

      if (
        (["key", ...nativeModKeys] as const).every(
          (k) => e[k] === keyBinding[k],
        )
      ) {
        callback(...args);
      }
    },
    [hotKey, callback, args],
  );

  useEffect(() => {
    window.addEventListener("keydown", eventHandler);
    return () => {
      window.removeEventListener("keydown", eventHandler);
    };
  }, [eventHandler]);
};

export default useShortcutKey;
