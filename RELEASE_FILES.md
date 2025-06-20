# Release Fájlok

Ez a dokumentum leírja, hogy mely fájlok kerülnek feltöltésre a release-ekbe.

## Feltöltött fájlok

### macOS
- **Fájl:** `Placcon Launcher-{version}-arm64.dmg`
- **Példa:** `Placcon Launcher-1.5.0-arm64.dmg`
- **Megjegyzés:** Csak az ARM64 (Apple Silicon) verzió kerül feltöltésre

### Windows
- **Fájl:** `Placcon Launcher Setup {version}.exe`
- **Példa:** `Placcon Launcher Setup 1.5.0.exe`
- **Megjegyzés:** Csak a Setup installer kerül feltöltésre, nem a standalone .exe

### Linux
- **Fájl:** `placcon-launcher_{version}_{arch}.deb`
- **Példa:** `placcon-launcher_1.5.0_amd64.deb`, `placcon-launcher_1.5.0_arm64.deb`
- **Megjegyzés:** Mindkét architektúra (AMD64 és ARM64) kerül feltöltésre

## Kizárt fájlok

### macOS
- `Placcon Launcher-{version}.dmg` (x64 verzió)
- `Placcon Launcher.app` (unpacked app)

### Windows
- `Placcon Launcher.exe` (standalone executable)
- `elevate.exe` (helper utility)
- `*.msi` (MSI installer)

### Linux
- `*.AppImage` (AppImage package)
- `*.rpm` (RPM package)
- `*.snap` (Snap package)

## Fájl szűrés logika

A release workflow-ok a következő szabályokat követik:

```bash
# macOS - csak ARM64 DMG (egy fájl)
find artifacts -name "*.dmg" | grep -E "Placcon Launcher-[0-9]+\.[0-9]+\.[0-9]+-arm64" | head -1

# Windows - csak Setup EXE (egy fájl)
find artifacts -name "*.exe" | grep -E "Placcon Launcher Setup [0-9]+\.[0-9]+\.[0-9]+\.exe$" | head -1

# Linux - csak DEB csomagok (mindkét architektúra)
find artifacts -name "*.deb" | grep -E "placcon-launcher_[0-9]+\.[0-9]+\.[0-9]+"
```

## Duplikált fájlok kezelése

- **Egy fájl per platform:** Minden platformról csak egy fő installer kerül feltöltésre
- **head -1:** Biztosítja, hogy csak az első talált fájl kerüljön felhasználásra
- **sort -u:** Eltávolítja a duplikált fájlokat a listából
- **GitHub CLI:** Automatikusan kezeli a duplikált asset-eket

## Hibaelhárítás

Ha nem találod a várt fájlokat:

1. **Ellenőrizd a build logokat** - nézd meg, hogy sikeres volt-e a build
2. **Teszteld lokálisan** - futtasd `npm run build:all` parancsot
3. **Ellenőrizd a fájl neveket** - a fájlok neveinek pontosan meg kell egyezniük a mintákkal
4. **Nézd meg az artifact-okat** - a GitHub Actions artifact-okban ellenőrizd, hogy mely fájlok jöttek létre 