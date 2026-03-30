# Creates a Projector shortcut on the Desktop that can be pinned to the taskbar.
# Run this once after copying Projector to your computer.

$installDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$batFile = Join-Path $installDir "launch-windows.bat"
$iconFile = Join-Path (Split-Path -Parent (Split-Path -Parent $installDir)) "favicon.ico"
$shortcutPath = [System.IO.Path]::Combine([Environment]::GetFolderPath("Desktop"), "Projector.lnk")

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $batFile
$shortcut.WorkingDirectory = Split-Path -Parent (Split-Path -Parent $installDir)
$shortcut.WindowStyle = 7  # Minimized — keeps the cmd window out of the way
if (Test-Path $iconFile) {
    $shortcut.IconLocation = $iconFile
}
$shortcut.Description = "Launch Projector"
$shortcut.Save()

Write-Host "Shortcut created on your Desktop."
Write-Host "To pin to taskbar: right-click the Projector shortcut on your Desktop and choose 'Pin to taskbar'."
