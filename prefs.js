import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class YakuakeGnomeExtensionPreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        this.settings = window._settings = this.getSettings("org.gnome.shell.extensions.yakuake-extension");

        const page = new Adw.PreferencesPage({
            title: 'Yakuake Gnome Extension',
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: 'Shortcut',
            description: 'Configure the shortcut to open Yakuake',
        });
        page.add(group);

        let entry = new Gtk.Entry({
            halign: Gtk.Align.END,
            visible: true
        });

        let shortcut = this.settings.get_value('my-shortcut').deep_unpack()
        entry.set_text(shortcut[0]);

        entry.connect('changed', () => {
            this.settings.set_value('my-shortcut', GLib.Variant.new('as', [entry.get_text()]));
        });

        group.add(entry);
    }
}
