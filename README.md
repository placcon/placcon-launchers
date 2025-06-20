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

### Automatikus Release (ajánlott)
A GitHub Actions automatikusan kezeli a teljes release folyamatot:

#### 1. Verzió frissítése
```bash
# Frissítsd a package.json verzióját
npm version 1.8.0 --no-git-tag-version
git add package.json
git commit -m "Update version to 1.8.0"
git push
```

#### 2. Automatikus release létrehozás
A `auto-release.yml` workflow automatikusan:
1. Kiolvassa a package.json verzióját
2. Ellenőrzi, hogy létezik-e már a release
3. Létrehozza és push-olja a tag-et
4. Build-eli az alkalmazást minden platformra
5. Átnevezi a fájlokat platform prefix-ekkel
6. Létrehozza a release-t

#### 3. Manuális trigger
Vagy használhatod a GitHub Actions manuális trigger-t:
1. Menj a GitHub Actions tab-ra
2. Válaszd ki az "Auto Release" workflow-t
3. Kattints a "Run workflow" gombra
4. Add meg a verziót (pl. 1.8.0)

### Verziókezelés
- A tag verziója automatikusan szinkronizálódik a `package.json` verziójával
- A workflow frissíti a package.json-t a tag verziójára
- Ez biztosítja, hogy a build-elt fájlok verziója egyezzen a release tag-gel
- Ha már létezik a release, a workflow hibát ad

### Tag alapú Release (régi módszer)
```bash
git tag v1.8.0
git push origin v1.8.0
```

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

## Licenc

MIT License 

### Version Management

The project uses automatic version incrementing:
- **Starting version**: v1.4.0 (current latest)
- **Auto-increment**: Minor version increases with each build (1.4.0 → 1.5.0 → 1.6.0...)
- **Manual tags**: Can still use manual tags for specific releases
- **Package.json**: Automatically updated with new version numbers 