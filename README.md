### Yakuake Gnome Shell Extension

A simple extension that lets you configure a keyboard shortcut to open/close Yakuake in Gnome.

#### Installation

Install it from https://extensions.gnome.org/extension/4757/yakuake/

Or clone this repo in `~/.local/share/gnome-shell/extensions/yakuake-extension@kde.org` and restart your shell.

I only tested this with QT_QPA_PLATFORM=wayland set in ~/.pam_environment (which makes Qt apps use the wayland backend, which for some reason isn't the default on Gnome).

#### Unfixed issues

The window appears centered instead of from the top.

