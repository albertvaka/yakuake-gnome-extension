const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() {
}

function buildPrefsWidget() {

    this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.yakuake-extension');

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Grid({
        column_spacing: 2,
        row_spacing: 1,
        visible: true
    });

    let label = new Gtk.Label({
        label: 'Shortcut:',
        halign: Gtk.Align.START,
        visible: true
    });
    prefsWidget.attach(label, 0, 1, 1, 1);

    let entry = new Gtk.Entry({
        halign: Gtk.Align.END,
        visible: true
    });
    
    let shortcut = this.settings.get_value('my-shortcut').deep_unpack()
    entry.set_text(shortcut[0]);

    prefsWidget.attach(entry, 1, 1, 1, 1);

    entry.connect('changed', () => {
        this.settings.set_value('my-shortcut', GLib.Variant.new('as', [entry.get_text()]));
    });

    // Return our widget which will be added to the window
    return prefsWidget;
}