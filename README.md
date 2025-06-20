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

A release automatikusan létrejön, amikor egy új tag-et push-olunk a repository-ba:

```bash
git tag v1.5.0
git push origin v1.5.0
```

A GitHub Actions automatikusan:
1. Build-eli az alkalmazást minden platformra
2. Létrehozza a release-t a megfelelő fájlokkal
3. Generálja a release notes-t

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