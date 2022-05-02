### Yakuake Gnome Shell Extension

A simple extension that lets you:
- Configure a keyboard shortcut to open/close Yakuake in Gnome.
- Make sure the Yakuake window appears focussed and on top, bypassing the focus steal prevention on Wayland (happens ony when using XWalyand).

#### Installation

Install it from https://extensions.gnome.org/extension/4757/yakuake/

Or clone this repo in `~/.local/share/gnome-shell/extensions/yakuake-extension@kde.org` and restart your shell.

#### Unfixed issues

If used with QT_QPA_PLATFORM=wayland set in ~/.pam_environment (which makes Qt apps use the wayland backend), the window appears centered instead of from the top.

