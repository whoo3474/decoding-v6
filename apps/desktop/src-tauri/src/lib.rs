use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};

fn show_main(window: Option<WebviewWindow>) {
    if let Some(window) = window {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn create_workbench(app: &tauri::AppHandle) {
    let label = format!("workbench-{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|value| value.as_millis()).unwrap_or_default());
    let _ = WebviewWindowBuilder::new(app, label, WebviewUrl::App("index.html".into()))
        .title("decod.ing workbench")
        .inner_size(1180.0, 820.0)
        .min_inner_size(720.0, 560.0)
        .center()
        .build();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main(app.get_webview_window("main"));
        }))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            show_main(app.get_webview_window("main"));
            let open = MenuItem::with_id(app, "open", "Open decod.ing", true, None::<&str>)?;
            let new_window = MenuItem::with_id(app, "new-window", "New workbench window", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open, &new_window, &quit])?;
            TrayIconBuilder::new()
                .icon(app.default_window_icon().expect("app icon").clone())
                .tooltip("decod.ing — local developer workbench")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "open" => show_main(app.get_webview_window("main")),
                    "new-window" => create_workbench(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running decod.ing desktop");
}
