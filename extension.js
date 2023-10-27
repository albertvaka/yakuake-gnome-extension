
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class YakuakeGnomeExtension extends Extension {

  constructor(metadata) {
    super(metadata);
    this._proxy = null;
  }

  enable() {

    // This is needed in XWayland (ie: if QT_QPA_PLATFORM=wayland is not set) so the window gets focus
    this._wincreated = global.display.connect('window-demands-attention', (display, window) => {
      // Try to detect the Yakuake window somehow
      if (window.title.includes("Yakuake") && window.is_above()) {
        Main.activateWindow(window);
      }
    });

    let settings = this.getSettings("org.gnome.shell.extensions.yakuake-extension");
    Main.wm.addKeybinding("my-shortcut", settings,
      Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
      Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
      () => {

        if (this._proxy == null) {
          this._proxy = new Gio.DBusProxy({
            g_connection: Gio.DBus.session,
            g_name: "org.kde.yakuake",
            g_object_path: "/yakuake/window",
            g_interface_name: "org.kde.yakuake"
          });
        }

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

  disable() {
    global.display.disconnect(this._wincreated);
    Main.wm.removeKeybinding("my-shortcut");
  }

}
