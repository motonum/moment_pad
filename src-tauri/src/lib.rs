use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    Manager,
    WebviewWindowBuilder,
    image::Image,
    path::BaseDirectory
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts(["ctrl+shift+m"])
                .expect("failed to add shortcuts")
                .with_handler(move |app, _shortcut, _event| {
                    if let Some(webview_window) = app.get_webview_window("main") {
                        let _ = webview_window.show();
                        let _ = webview_window.set_focus();
                    } else {
                        let _ = WebviewWindowBuilder::new(app, "main", Default::default())
                            .title("MomentPad")
                            .inner_size(500.0, 250.0)
                            .always_on_top(true)
                            .accept_first_mouse(true)
                            .decorations(false)
                            .transparent(true)
                            .shadow(true)
                            .build();
                    }
                })
                .build(),
        )
        .setup(|app| {
            // メニューの追加
            let separator = PredefinedMenuItem::separator(app)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let settings_i = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&settings_i, &separator, &hide_i, &quit_i])?;
            let path = app.path().resolve("systray-icon.png", BaseDirectory::Resource)?;
            let image = Image::from_path(&path).unwrap();
            let _tray = TrayIconBuilder::new()
                .icon(image)
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "hide" => {
                        if let Some(webview_window) = app.get_webview_window("main") {
                            webview_window.hide().unwrap();
                        }
                    }
                    _ => {
                    }
                })
                .build(app)?;
            
            // OS起動時に起動
            #[cfg(desktop)]
            {
                use tauri_plugin_autostart::ManagerExt;

                // Get the autostart manager
                let autostart_manager = app.autolaunch();
                // Enable autostart
                let _ = autostart_manager.enable();
            }

            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }


            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app, event| match event {
            tauri::RunEvent::ExitRequested { api, code, .. } => {
                if code.is_none() {
                    api.prevent_exit();
                    if let Some(webview_window) = app.get_webview_window("main") {
                        let _ = webview_window.hide();
                    }
                }
            }
            _ => {}
        })
}