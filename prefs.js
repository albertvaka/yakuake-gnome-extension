import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const NUM_SHORTCUTS = 2;
const IDLE_SUBTITLE = 'Click to change';
const LISTENING_SUBTITLE = 'Press a key… (Esc to cancel, Backspace to clear)';

export default class YakuakeGnomeExtensionPreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        window._settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'Yakuake Gnome Extension',
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: 'Shortcut',
            description: 'Configure the shortcuts to open Yakuake',
        });
        page.add(group);

        // Slots are kept in memory so an empty first slot doesn't shift the second one while editing
        const shortcuts = window._settings.get_strv('my-shortcut');
        const slots = [];
        for (let i = 0; i < NUM_SHORTCUTS; i++)
            slots.push(shortcuts[i] ?? '');

        const save = () => {
            window._settings.set_value('my-shortcut',
                GLib.Variant.new('as', slots.filter(s => s !== '')));
        };

        let listeningIndex = -1;
        const rows = [];

        const updateRow = (i) => {
            rows[i].label.set_accelerator(slots[i]);
            rows[i].label.visible = listeningIndex !== i;
            rows[i].row.subtitle = listeningIndex === i ? LISTENING_SUBTITLE : IDLE_SUBTITLE;
            rows[i].clearButton.sensitive = slots[i] !== '';
        };

        const setListening = (i) => {
            const previous = listeningIndex;
            listeningIndex = i;
            if (previous >= 0)
                updateRow(previous);
            if (i >= 0)
                updateRow(i);
        };

        for (let i = 0; i < NUM_SHORTCUTS; i++) {
            const row = new Adw.ActionRow({
                title: i === 0 ? 'Primary shortcut' : 'Secondary shortcut',
                activatable: true,
            });

            const label = new Gtk.ShortcutLabel({
                disabled_text: 'Disabled',
                valign: Gtk.Align.CENTER,
            });
            row.add_suffix(label);

            const clearButton = new Gtk.Button({
                icon_name: 'edit-clear-symbolic',
                tooltip_text: 'Clear shortcut',
                valign: Gtk.Align.CENTER,
                css_classes: ['flat'],
            });
            clearButton.connect('clicked', () => {
                slots[i] = '';
                save();
                setListening(-1);
                updateRow(i);
            });
            row.add_suffix(clearButton);

            row.connect('activated', () => {
                setListening(listeningIndex === i ? -1 : i);
            });

            rows.push({ row, label, clearButton });
            group.add(row);
            updateRow(i);
        }

        // Capture key presses on the whole window while a row is waiting for a key
        const keyController = new Gtk.EventControllerKey({
            propagation_phase: Gtk.PropagationPhase.CAPTURE,
        });
        keyController.connect('key-pressed', (_controller, keyval, _keycode, state) => {
            if (listeningIndex < 0)
                return Gdk.EVENT_PROPAGATE;

            const mask = state & Gtk.accelerator_get_default_mod_mask() & ~Gdk.ModifierType.LOCK_MASK;
            keyval = Gdk.keyval_to_lower(keyval);

            if (mask === 0 && keyval === Gdk.KEY_Escape) {
                setListening(-1);
                return Gdk.EVENT_STOP;
            }

            if (mask === 0 && keyval === Gdk.KEY_BackSpace) {
                const i = listeningIndex;
                slots[i] = '';
                save();
                setListening(-1);
                return Gdk.EVENT_STOP;
            }

            // Ignore lone modifier presses and keep waiting for the actual key
            if (!Gtk.accelerator_valid(keyval, mask))
                return Gdk.EVENT_STOP;

            slots[listeningIndex] = Gtk.accelerator_name(keyval, mask);
            save();
            setListening(-1);
            return Gdk.EVENT_STOP;
        });
        window.add_controller(keyController);
    }
}
