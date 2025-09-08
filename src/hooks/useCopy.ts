import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useCallback } from "react";

type UseCopyProps = { windowLabel: string; duration?: number };

const useCopy = ({ windowLabel, duration = 500 }: UseCopyProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = useCallback(
    (text: string) => {
      if (text && !isCopied) {
        navigator.clipboard.writeText(text).then(() => {
          setIsCopied(true);
          setTimeout(async () => {
            setIsCopied(false);
            const window = await WebviewWindow.getByLabel(windowLabel);
            if (window) {
              await window.hide();
            }
          }, duration);
        });
      }
    },
    [isCopied, setIsCopied]
  );

  return { isCopied, handleCopy };
};

export default useCopy;
