# Release Hibaelhárítás

Ez a dokumentum segít megoldani a release létrehozásával kapcsolatos problémákat.

## Gyakori problémák

### 1. 403-as hiba a release létrehozásakor

**Hiba:**
```
⚠️ GitHub release failed with status: 403
```

**Lehetséges okok:**
- Hiányzó jogosultságok a repository-ban
- Rossz GITHUB_TOKEN konfiguráció
- Repository beállítások problémái

**Megoldások:**

#### A. Jogosultságok ellenőrzése
1. Menj a repository Settings > Actions > General
2. Ellenőrizd, hogy a "Workflow permissions" beállítás "Read and write permissions" legyen
3. Kapcsold be a "Allow GitHub Actions to create and approve pull requests" opciót

#### B. Repository beállítások
1. Menj a repository Settings > Actions > General
2. Ellenőrizd a "Fork pull request workflows from outside collaborators" beállítást
3. Állítsd be "Require approval for all outside collaborators" opciót

#### C. Manuális release létrehozás
Ha az automatikus release nem működik:

```bash
# 1. Build-eld az alkalmazást
npm run build:all

# 2. Használd a release script-et
npm run release v1.5.0

# 3. Vagy manuálisan a GitHub webes felületén
```

### 2. Hiányzó fájlok a release-ben

**Hiba:**
```
Pattern 'artifacts/placcon-launcher-mac/dist/*.dmg' does not match any files.
```

**Lehetséges okok:**
- Build hiba
- Rossz fájl útvonalak
- Hiányzó icon fájlok

**Megoldások:**

#### A. Build ellenőrzése
```bash
# Teszteld a build-et lokálisan
npm run build:mac
npm run build:win
npm run build:linux
```

#### B. Fájl útvonalak javítása
A workflow fájlokban ellenőrizd a fájl útvonalakat:
- `artifacts/placcon-launcher-mac/**/osx-Placcon-Launcher-*-arm64.dmg` (csak ARM64)
- `artifacts/placcon-launcher-win/**/windows-Placcon-Launcher-Setup-*.exe` (csak Setup)
- `artifacts/placcon-launcher-linux/**/linux-placcon-launcher-*.deb` (csak fő csomagok)

#### C. Icon fájlok ellenőrzése
Ellenőrizd, hogy minden szükséges icon fájl létezik:
- `assets/icon.ico` (Windows)
- `assets/icon.icns` (macOS)
- `assets/icon.png` (Linux)

### 3. Build hibák

**Gyakori build hibák:**

#### macOS
```bash
# Xcode Command Line Tools telepítése
xcode-select --install
```

#### Windows
```bash
# Visual Studio Build Tools telepítése
# Töltsd le és telepítsd a Visual Studio Build Tools-t
```

#### Linux
```bash
# Szükséges csomagok telepítése
sudo apt-get update
sudo apt-get install rpm
```

## Workflow fájlok

### release.yml
Automatikus release létrehozás tag push esetén.

### prepare-release.yml
Release fájlok előkészítése manuális release-hez.

### build.yml
Automatikus build és release a `electron-v2` branch-en.

## Hasznos parancsok

```bash
# Build minden platformra
npm run build:all

# Release létrehozása
npm run release v1.5.0

# Build tesztelése
npm run build:mac --dry-run

# Fájlok keresése
find dist -name "*.dmg" -o -name "*.exe" -o -name "*.deb"
```

## Kapcsolódó dokumentumok

- [GitHub Actions dokumentáció](https://docs.github.com/en/actions)
- [Electron Builder dokumentáció](https://www.electron.build/)
- [GitHub CLI dokumentáció](https://cli.github.com/) 