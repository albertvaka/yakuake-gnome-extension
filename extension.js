
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class YakuakeGnomeExtension extends Extension {

  enable() {
    this._pendingPositionWindows = new Set();
    this._pendingSourceId = null;

    // This signal fires when a window requests attention (eg. on XWayland)
    global.display.connectObject('window-demands-attention', (display, window) => {
      if (this._isYakuakeWindow(window)) {
        this._moveToTop(window);
        Main.activateWindow(window);
      }
    }, this);

    // Catch first launch where the window doesn't exist yet
    global.display.connectObject('window-created', (display, window) => {
      if (this._isYakuakeWindow(window)) {
        this._positionWhenReady(window);
      }
    }, this);

    let settings = this.getSettings();
    Main.wm.addKeybinding("my-shortcut", settings,
      Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
      Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
      () => {

        // Check if Yakuake is running by looking for its D-Bus name
        let result = Gio.DBus.session.call_sync(
          "org.freedesktop.DBus",
          "/org/freedesktop/DBus",
          "org.freedesktop.DBus",
          "NameHasOwner",
          new GLib.Variant('(s)', ['org.kde.yakuake']),
          null, 0, -1, null
        );
        let isRunning = result.get_child_value(0).get_boolean();

        if (!isRunning) {
          // Yakuake isn't running, launch it
          GLib.spawn_command_line_async('yakuake');
          return;
        }

        this._toggleAndPosition();
      });
  }

  disable() {
    this._clearPendingTimeout();

    for (const w of this._pendingPositionWindows)
      w.disconnectObject(this);
    this._pendingPositionWindows.clear();

    global.display.disconnectObject(this);
    Main.wm.removeKeybinding("my-shortcut");
  }

  _isYakuakeWindow(window) {
    if (!window) return false;
    const wmClass = window.get_wm_class();
    if (wmClass && wmClass.toLowerCase() === 'yakuake') return true;
    const title = window.get_title();
    if (title && title.includes('Yakuake')) return true;
    return false;
  }

  _moveToTop(window) {
    const monitorIndex = window.get_monitor();
    const monitorGeom = global.display.get_monitor_geometry(monitorIndex);
    const frameRect = window.get_frame_rect();
    const x = monitorGeom.x + Math.round((monitorGeom.width - frameRect.width) / 2);
    window.move_frame(false, x, monitorGeom.y);
  }

  _findAndPositionYakuake() {
    const windows = global.display.list_all_windows();
    for (const w of windows) {
      if (this._isYakuakeWindow(w)) {
        this._moveToTop(w);
        Main.activateWindow(w);
        return true;
      }
    }
    return false;
  }

  // For newly created windows, wait until the compositor has placed them before repositioning
  _positionWhenReady(window) {
    this._pendingPositionWindows.add(window);
    window.connectObject('position-changed', () => {
      window.disconnectObject(this);
      this._pendingPositionWindows.delete(window);
      this._moveToTop(window);
      Main.activateWindow(window);
    }, this);
  }

  _toggleAndPosition() {
    Gio.DBus.session.call_sync(
      "org.kde.yakuake",
      "/yakuake/window",
      "org.kde.yakuake",
      "toggleWindowState",
      null, null, 0, -1, null
    );

    if (this._findAndPositionYakuake())
      return;

    this._clearPendingTimeout();
    let attempts = 0;
    this._pendingSourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
      attempts++;
      if (this._findAndPositionYakuake() || attempts >= 10) {
        this._pendingSourceId = null;
        return GLib.SOURCE_REMOVE;
      }
      return GLib.SOURCE_CONTINUE;
    });
  }

  _clearPendingTimeout() {
    if (this._pendingSourceId) {
      GLib.Source.remove(this._pendingSourceId);
      this._pendingSourceId = null;
    }
  }

}
