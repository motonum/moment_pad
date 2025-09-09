import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useCallback } from "react";

const hideWindow = (windowLabel: string) => {
  WebviewWindow.getByLabel(windowLabel).then((val) => {
    val && val.hide();
  });
};

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
            hideWindow(windowLabel);
          }, duration);
        });
      } else {
        hideWindow(windowLabel);
      }
    },
    [isCopied, setIsCopied]
  );

  return { isCopied, handleCopy };
};

export default useCopy;
