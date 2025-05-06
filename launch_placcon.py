import os
import subprocess
import ctypes
import sys

def find_chrome_path():
    """Finds the installation path of Google Chrome."""
    # Primarily in Program Files (usually 64-bit)
    path_primary = os.path.join(os.environ.get("ProgramFiles", "C:\\Program Files"), "Google", "Chrome", "Application", "chrome.exe")
    # Secondarily in Program Files (x86) (usually 32-bit)
    path_secondary = os.path.join(os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)"), "Google", "Chrome", "Application", "chrome.exe")

    if os.path.exists(path_primary):
        return path_primary
    elif os.path.exists(path_secondary):
        return path_secondary
    return None

def main():
    chrome_exe_path = find_chrome_path()

    if not chrome_exe_path:
        ctypes.windll.user32.MessageBoxW(
            0,
            "Google Chrome was not found in the default locations.\nPlease install Google Chrome.",
            "Error",
            0x10 | 0x0  # MB_ICONERROR | MB_OK
        )
        return

    # Handle command line argument for site_url
    if len(sys.argv) > 1:
        site_url = sys.argv[1]
    else:
        site_url = "test.core.placcon.com"
    profile_dir_name = "placcon1"
    # Safer location for the profile would be under AppData, but as requested, C:\ChromeProfiles\placcon1 is used
    # If writing to the C: root causes permission issues, consider using os.path.expanduser("~")
    profile_dir_base = "C:\\ChromeProfiles"  # Based on the VBS
    profile_dir = os.path.join(profile_dir_base, profile_dir_name)

    # Create profile directory if it does not exist
    if not os.path.exists(profile_dir):
        try:
            os.makedirs(profile_dir)
            # print(f"Profile directory created: {profile_dir}") # Only visible in console mode
        except OSError as e:
            error_message = f"Failed to create profile directory: {profile_dir}\nError: {e}"
            ctypes.windll.user32.MessageBoxW(0, error_message, "Error", 0x10 | 0x0)
            return

    # Assemble Chrome launch command (based on previous .bat script)
    chrome_args = [
        chrome_exe_path,
        "--new-window",
        "--start-fullscreen",
        "--disable-features=Translate",
        "--kiosk",
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

    try:
        # Start Chrome as a new process (does not wait for it to close)
        subprocess.Popen(chrome_args)
    except Exception as e:
        error_message = f"An error occurred while launching Chrome:\n{e}"
        ctypes.windll.user32.MessageBoxW(0, error_message, "Error", 0x10 | 0x0)

if __name__ == "__main__":
    main()
