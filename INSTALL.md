# Installing Projector

## Step 1 — Copy the app to your computer

Copy the entire `projector` folder from the shared drive to your computer. Keep it somewhere permanent — your Documents folder works well.

> Do not run it directly from OneDrive/SharePoint. It needs to live on your local machine.

## Step 2 — First launch

Projector opens in its own Chrome window (no tabs or address bar) and won't interfere with your regular Chrome session.

### Mac
1. Open the `projector` folder
2. Double-click **launch-mac.command**
3. If you see a security warning: right-click the file → Open → Open (you only need to do this once)
4. Projector opens in its own Chrome window

### Windows
1. Open the `projector` folder
2. Double-click **launch-windows.bat**
3. If Windows Defender asks, click "More info" → "Run anyway" (you only need to do this once)
4. Projector opens in its own Chrome window

### Linux
1. Open a terminal in the `projector` folder
2. Run: `chmod +x launch-linux.sh && ./launch-linux.sh`
3. Projector opens in its own Chrome window

> **Requirements:** Google Chrome and Python 3 must be installed. Most Macs and Linux machines already have Python 3.
> Windows users: if you see an error about Python, download it from [python.org](https://python.org) and install it (check "Add to PATH" during setup), then try again.

## Step 3 — Pin to Dock / Taskbar

Once Projector is open:

### Mac
- Right-click the Chrome icon in the Dock → **Options** → **Keep in Dock**

### Windows
- Right-click the Chrome icon in the taskbar → **Pin to taskbar**

### Linux
- Right-click the Chrome icon in your taskbar → **Pin** (wording varies by desktop)

## Step 4 — Start automatically on login (optional but recommended)

This keeps the server running in the background so Projector is always ready when you click the pinned icon.

### Mac
1. System Settings → General → Login Items
2. Click **+** and add **launch-mac.command**

### Windows
1. Press **Win + R**, type `shell:startup`, press Enter
2. Create a shortcut to **launch-windows.bat** in that folder

### Linux
Add to your desktop environment's autostart, or create `~/.config/autostart/projector.desktop`:
```
[Desktop Entry]
Type=Application
Name=Projector
Exec=/path/to/projector/launch-linux.sh
Hidden=false
X-GNOME-Autostart-enabled=true
```

## Your data

All data is stored locally on your computer inside the `projector` folder. It is never sent anywhere. Do not delete the `.chrome-profile` folder inside `projector` — that is where your data lives.
