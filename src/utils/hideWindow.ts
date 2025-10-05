import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

const hideWindow = (windowLabel: string) => {
  WebviewWindow.getByLabel(windowLabel).then((val) => {
    val?.hide();
  });
};

export default hideWindow;
