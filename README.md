# Placcon Launcher

A Placcon éttermi rendszer asztali alkalmazása, amely lehetővé teszi a Placcon webes felület elérését egy dedikált alkalmazáson keresztül.

## Funkciók

- **Biztonságos webes felület**: A Placcon éttermi rendszer elérése
- **Platform független**: Windows, macOS és Linux támogatás
- **Automatikus frissítések**: GitHub Actions segítségével
- **Modern felhasználói felület**: Reszponzív és felhasználóbarát design

## Fejlesztés

### Előfeltételek

- Node.js 18+
- npm

### Telepítés

```bash
npm ci
```

### Fejlesztői mód

```bash
npm run dev
```

### Build

```bash
# Minden platform
npm run build:all

# Vagy platform specifikus
npm run build:mac
npm run build:win
npm run build:linux
```

## Release folyamat

### Automatikus Release

A projekt egy egyszerűsített automatizált release workflow-t használ:

#### 1. Verzió ellenőrzés
- A workflow kiolvassa a `package.json` verzióját
- Ellenőrzi, hogy létezik-e már release ezzel a verzióval

#### 2. Build és Release
Ha nincs még release a verzióval:
1. Build-eli az alkalmazást minden platformra
2. Létrehozza a release-t a package.json verzió alapján
3. Feltölti az artifact fájlokat

#### 3. Manuális trigger
Vagy használhatod a GitHub Actions manuális trigger-t:
1. Menj a GitHub Actions tab-ra
2. Válaszd ki az "Auto Release" workflow-t
3. Kattints a "Run workflow" gombra
4. Add meg a verziót (pl. 1.8.0)

### Verziókezelés
- **Manuális kontroll**: Te kezeled a verziót a `package.json`-ben
- **Nincs auto-increment**: A workflow nem módosítja a verziót
- **Konzisztens elnevezés**: A release tag-ek `v{verzió}` formátumot használnak (pl. `v1.8.0`)

### Release fájlok

A workflow platform-specifikus fájlokat hoz létre:
- `osx-Placcon-Launcher-{verzió}-arm64.dmg` - macOS ARM64
- `windows-Placcon-Launcher-Setup-{verzió}.exe` - Windows Setup
- `linux-placcon-launcher-{verzió}-amd64.deb` - Linux AMD64
- `linux-placcon-launcher-{verzió}-arm64.deb` - Linux ARM64

## Build konfiguráció

Az alkalmazás Electron Builder segítségével van konfigurálva:

- **Windows**: NSIS installer (.exe)
- **macOS**: DMG installer (.dmg)  
- **Linux**: DEB package (.deb)

## Biztonság

- Context isolation engedélyezve
- Node integration letiltva
- Web security engedélyezve
- Külső linkek automatikusan megnyílnak a böngészőben

## Projekt struktúra

```
placcon-launchers/
├── assets/           # Alkalmazás ikonok
├── .github/workflows/
│   └── auto-release.yml  # Automatizált release workflow
├── main.js          # Fő Electron process
├── preload.js       # Preload script
├── renderer.js      # Renderer process
├── index.html       # Fő ablak HTML
└── package.json     # Projekt konfiguráció
```

## Hibaelhárítás

### Release problémák

- **Verzió már létezik**: Frissítsd a package.json-t új verzióra
- **Build hibák**: Ellenőrizd a platform-specifikus build követelményeket
- **Hiányzó artifact-ok**: Ellenőrizd a build kimeneteket a dist/ mappában

### Gyakori parancsok

```bash
# Aktuális verzió ellenőrzése
node -p "require('./package.json').version"

# Build kimenetek listázása
find ./dist -type f

# Létező release-ek ellenőrzése
gh release list
```

## Licenc

MIT License 