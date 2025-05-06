import os
import subprocess
import ctypes # Windows API hívásokhoz (pl. üzenetablak)
import sys

def find_chrome_path():
    """Megkeresi a Chrome telepítési útvonalát."""
    # Elődlegesen a Program Files (általában 64-bit)
    path_primary = os.path.join(os.environ.get("ProgramFiles", "C:\\Program Files"), "Google", "Chrome", "Application", "chrome.exe")
    # Másodlagosan a Program Files (x86) (általában 32-bit)
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
            "A Google Chrome nem található az alapértelmezett helyeken.\nKérjük, telepítse a Google Chrome-ot.",
            "Hiba",
            0x10 | 0x0  # MB_ICONERROR | MB_OK
        )
        return

    # Parancssori argumentum kezelése a site_url-hez
    if len(sys.argv) > 1:
        site_url = sys.argv[1]
    else:
        site_url = "test.core.placcon.com"
    profile_dir_name = "placcon1"
    # Biztonságosabb hely a profilnak az AppData alatt, de a kérés C:\ChromeProfiles\placcon1 volt
    # Ha a C: gyökérbe írás jogosultsági problémát okoz, érdemesebb pl. os.path.expanduser("~") alá tenni
    profile_dir_base = "C:\\ChromeProfiles" # A VBS alapján
    profile_dir = os.path.join(profile_dir_base, profile_dir_name)


    # Profil könyvtár létrehozása, ha nem létezik
    if not os.path.exists(profile_dir):
        try:
            os.makedirs(profile_dir)
            # print(f"Profil könyvtár létrehozva: {profile_dir}") # Csak konzolos módban látszik
        except OSError as e:
            error_message = f"Nem sikerült létrehozni a profil könyvtárat: {profile_dir}\nHiba: {e}"
            ctypes.windll.user32.MessageBoxW(0, error_message, "Hiba", 0x10 | 0x0)
            return

    # Chrome indítási parancs összeállítása (a korábbi .bat szkript alapján)
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
        # Chrome indítása új folyamatként (nem várja meg a bezárását)
        subprocess.Popen(chrome_args)
    except Exception as e:
        error_message = f"Hiba történt a Chrome indításakor:\n{e}"
        ctypes.windll.user32.MessageBoxW(0, error_message, "Hiba", 0x10 | 0x0)

if __name__ == "__main__":
    main()
