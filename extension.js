const {Gio, Shell, Meta} = imports.gi;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const ExtensionUtils = imports.misc.extensionUtils;
const Lang = imports.lang

function init () {
  this._proxy = new Gio.DBusProxy({
    g_connection: Gio.DBus.session,
    g_name: "org.kde.yakuake",
    g_object_path: "/yakuake/window",
    g_interface_name: "org.kde.yakuake"
  });
  this._proxy.init(null);
}

function enable () {
  this._wincreated = global.display.connect('window-created', (display, window) => { 
    // Try to detect the Yakuake window somehow
    if (window.title.includes("Yakuake") && window.is_above() && window.is_on_all_workspaces()) {
      Main.activateWindow(window);
    }
  });

  let settings = ExtensionUtils.getSettings("org.gnome.shell.extensions.yakuake-extension");
  Main.wm.addKeybinding("my-shortcut", settings,
    Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
    Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
    () => {
      this._proxy.call_sync(
        "org.kde.yakuake.toggleWindowState",
        null, // method args
        0,    // call flags
        -1,   // timeout
        null  // cancellable
      );
      //too early to do this here
      //let windows = global.display.get_workspace_manager().get_active_workspace().list_windows();
      //windows.filter(w => w.title.includes("Yakuake") && w.is_above() && w.is_on_all_workspaces()).forEach(w => Main.activateWindow(w));
    });
}

function disable () {
  global.display.disconnect(this._wincreated);
  Main.wm.removeKeybinding("my-shortcut");
}

