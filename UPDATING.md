# Updating Projector

## The short version

Copy the new Projector folder over your existing installation, skipping `.chrome-profile/`. Your Dock/taskbar icon and auto-startup will continue to work — nothing needs to be reconfigured.

---

## Step by step

### Mac

1. Quit Projector if it's running (close the Chrome window, then stop the server: open Activity Monitor, find `python3`, quit it)
2. Copy the new `Projector` folder to `/Applications/`, replacing the existing one
3. When macOS asks, choose **Replace** — but make sure you are **not** deleting `.chrome-profile/` (it won't be in the new folder, so Replace won't touch it)
4. Launch Projector from your Dock as normal

### Windows

1. Close the Projector Chrome window
2. End the `python.exe` process in Task Manager if it's still running
3. Copy the contents of the new Projector folder into your existing installation folder, replacing files when prompted
4. `.chrome-profile\` is not in the new folder, so it will not be touched
5. Launch Projector from your taskbar as normal

### Linux

1. Close the Projector Chrome window and stop the server (`pkill -f "http.server 7337"`)
2. Copy the new Projector folder over your existing installation, replacing files
3. `.chrome-profile/` will not be touched
4. Launch Projector as normal

---

## Your data is safe as long as you don't delete `.chrome-profile/`

All your projects, tasks, people, notes, and settings are stored in `.chrome-profile/` inside your Projector installation folder. This folder is not included in any release, so a normal copy/replace will never affect it.

If you want extra peace of mind before updating, copy `.chrome-profile/` somewhere else first, then restore it afterwards — or use Projector's **Export** feature (sidebar → Export) to save a backup JSON file before updating.
