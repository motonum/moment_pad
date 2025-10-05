import { useCallback, useState } from "react";
import hideWindow from "../utils/hideWindow";

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
    [isCopied, duration, windowLabel],
  );

  return { isCopied, handleCopy };
};

export default useCopy;
