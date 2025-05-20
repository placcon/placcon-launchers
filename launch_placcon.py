import os
import subprocess
import ctypes
import sys
import argparse

IS_WINDOWS = sys.platform.startswith('win')

def find_chrome_path():
    """Finds the installation path of Google Chrome."""
    # Primarily in Program Files (usually 64-bit)
    path_primary = os.path.join(os.environ.get("ProgramFiles", "C:\\Program Files"), "Google", "Chrome", "Application", "chrome.exe")
    # Secondarily in Program Files (x86) (usually 32-bit)
    path_secondary = os.path.join(os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)"), "Google", "Chrome", "Application", "chrome.exe")
    # User install (AppData)
    path_user = os.path.join(os.environ.get("LOCALAPPDATA", r"C:\\Users\\%USERNAME%\\AppData\\Local"), "Google", "Chrome", "Application", "chrome.exe")

    print(f"[DEBUG] path_primary: {path_primary} - exists: {os.path.exists(path_primary)}")
    print(f"[DEBUG] path_secondary: {path_secondary} - exists: {os.path.exists(path_secondary)}")
    print(f"[DEBUG] path_user: {path_user} - exists: {os.path.exists(path_user)}")

    if os.path.exists(path_primary):
        return path_primary
    elif os.path.exists(path_secondary):
        return path_secondary
    elif os.path.exists(path_user):
        return path_user
    return None

def main():
    parser = argparse.ArgumentParser(description="Placcon Chrome launcher")
    parser.add_argument("site_url", nargs="?", default="test.core.placcon.com", help="Site URL to open")
    parser.add_argument("--profile", "-p", default="placcon1", help="Profile directory name")
    parser.add_argument("--kiosk", "-k", action="store_true", help="Enable kiosk mode (default: fullscreen app mode)")
    args = parser.parse_args()

    chrome_exe_path = find_chrome_path()
    if not chrome_exe_path:
        debug_msg = (
            f"[DEBUG] path_primary: {path_primary} - exists: {os.path.exists(path_primary)}\n"
            f"[DEBUG] path_secondary: {path_secondary} - exists: {os.path.exists(path_secondary)}\n"
            f"[DEBUG] path_user: {path_user} - exists: {os.path.exists(path_user)}\n"
        )
        if IS_WINDOWS:
            ctypes.windll.user32.MessageBoxW(
                0,
                "Google Chrome was not found in the default locations.\nPlease install Google Chrome.\n\n" + debug_msg,
                "Error",
                0x10 | 0x0  # MB_ICONERROR | MB_OK
            )
        else:
            print("Google Chrome was not found in the default locations. Please install Google Chrome.\n" + debug_msg)
        return

    site_url = args.site_url
    profile_dir_name = args.profile
    profile_dir_base = "C:\\ChromeProfiles"
    profile_dir = os.path.join(profile_dir_base, profile_dir_name)

    if not os.path.exists(profile_dir):
        try:
            os.makedirs(profile_dir)
        except OSError as e:
            error_message = f"Failed to create profile directory: {profile_dir}\nError: {e}"
            if IS_WINDOWS:
                ctypes.windll.user32.MessageBoxW(0, error_message, "Error", 0x10 | 0x0)
            else:
                print(error_message)
            return

    chrome_args = [
        chrome_exe_path,
        "--new-window",
        "--start-fullscreen",
        "--disable-features=Translate",
        "--disable-translate",
        "--disable-extensions",
        "--disable-zoom",
        "--no-first-run",
        "--disable-infobars",
        "--disable-plugins",
        "--no-sandbox",
        "-url", site_url,
        f"--app={site_url}",
        f"--user-data-dir={profile_dir}"
    ]
    if args.kiosk:
        chrome_args.append("--kiosk")

    try:
        subprocess.Popen(chrome_args)
    except Exception as e:
        error_message = f"An error occurred while launching Chrome:\n{e}"
        if IS_WINDOWS:
            ctypes.windll.user32.MessageBoxW(0, error_message, "Error", 0x10 | 0x0)
        else:
            print(error_message)

if __name__ == "__main__":
    main()
