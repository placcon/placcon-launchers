# Release Fájlok

Ez a dokumentum leírja, hogy mely fájlok kerülnek feltöltésre a release-ekbe.

## Feltöltött fájlok

### macOS
- **Fájl:** `osx-Placcon-Launcher-{version}-arm64.dmg`
- **Példa:** `osx-Placcon-Launcher-1.5.0-arm64.dmg`
- **Megjegyzés:** Csak az ARM64 (Apple Silicon) verzió kerül feltöltésre

### Windows
- **Fájl:** `windows-Placcon-Launcher-Setup-{version}.exe`
- **Példa:** `windows-Placcon-Launcher-Setup-1.5.0.exe`
- **Megjegyzés:** Csak a Setup installer kerül feltöltésre, nem a standalone .exe

### Linux
- **Fájl:** `linux-placcon-launcher-{version}_{arch}.deb`
- **Példa:** `linux-placcon-launcher-1.5.0-amd64.deb`, `linux-placcon-launcher-1.5.0-arm64.deb`
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
# Átnevezés: osx-Placcon-Launcher-{version}-arm64.dmg

# Windows - csak Setup EXE (egy fájl)
find artifacts -name "*.exe" | grep -E "Placcon Launcher Setup [0-9]+\.[0-9]+\.[0-9]+\.exe$" | head -1
# Átnevezés: windows-Placcon-Launcher-Setup-{version}.exe

# Linux - csak DEB csomagok (mindkét architektúra)
find artifacts -name "*.deb" | grep -E "placcon-launcher_[0-9]+\.[0-9]+\.[0-9]+"
# Átnevezés: linux-placcon-launcher-{version}-{arch}.deb
```

## Duplikált fájlok kezelése

- **Egy fájl per platform:** Minden platformról csak egy fő installer kerül feltöltésre
- **head -1:** Biztosítja, hogy csak az első talált fájl kerüljön felhasználásra
- **sort -u:** Eltávolítja a duplikált fájlokat a listából
- **GitHub CLI:** Automatikusan kezeli a duplikált asset-eket
- **Platform prefix:** Minden fájl platform prefix-et kap (osx-, windows-, linux-)

## Hibaelhárítás

Ha nem találod a várt fájlokat:

1. **Ellenőrizd a build logokat** - nézd meg, hogy sikeres volt-e a build
2. **Teszteld lokálisan** - futtasd `npm run build:all` parancsot
3. **Ellenőrizd a fájl neveket** - a fájlok neveinek pontosan meg kell egyezniük a mintákkal
4. **Nézd meg az artifact-okat** - a GitHub Actions artifact-okban ellenőrizd, hogy mely fájlok jöttek létre 