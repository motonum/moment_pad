use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem}, tray::TrayIconBuilder, Manager, WebviewWindowBuilder, WindowEvent
};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
                            .title("Moment Pad")
                            .inner_size(500.0, 250.0)
                            .always_on_top(true)
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
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        println!("quit menu item was clicked");
                        app.exit(0);
                    }
                    "hide" => {
                        println!("hide menu item was clicked");
                        app.hide().unwrap();
                    }
                    _ => {
                        println!("menu item {:?} not handled", event.id);
                    }
                })
                .icon(app.default_window_icon().unwrap().clone())
                .build(app)?;
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
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
            tauri::RunEvent::WindowEvent {  event, .. } => {
                // if matches!(event, WindowEvent::Focused(false)) {
                //     if let Some(webview_window) = app.get_webview_window("main") {
                //         let _ = webview_window.hide();
                //     }
                // }
            }
            _ => {}
        })
}