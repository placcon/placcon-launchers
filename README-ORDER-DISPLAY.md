# Placcon Order Display

A Placcon Order Display egy Electron-alapú kiosk alkalmazás, amely a test.core.placcon.com oldalt jeleníti meg teljes képernyőben.

## Funkciók

- **Kiosk mód**: Teljes képernyőben fut, ideális megjelenítő eszközökhöz
- **Webes tartalom**: A test.core.placcon.com oldal betöltése
- **Kijelző kezelés**: Automatikus másodlagos kijelző használat és kijelző választás
- **Biztonságos navigáció**: Külső linkek blokkolása, csak a Placcon domain engedélyezett
- **Beállítások mentése**: A kiválasztott kijelző beállítás elmentése

## Kijelző kezelés

### Automatikus másodlagos kijelző
Alapértelmezetten az alkalmazás a másodlagos kijelzőn nyílik meg (index 1), ami ideális a pénztárgépekhez.

### Kijelző választás
Az alkalmazásban lehetőség van a kijelző megváltoztatására:

1. **Billentyűkombináció**: `Ctrl+Shift+D` - Megnyitja a kijelző választó ablakot
2. **Gomb**: A jobb felső sarokban megjelenik egy "⚙️ Display" gomb

### Kijelző beállítások mentése
A kiválasztott kijelző beállítás automatikusan elmentődik és az alkalmazás újraindítása után is megmarad.

## Telepítés

### Fejlesztői környezet

```bash
# Függőségek telepítése
npm install

# Order display verzió futtatása
cp package-order-display.json package.json
cp main-order-display.js main.js
npm start
```

### Build

```bash
# Order display verzió buildelése
cp package-order-display.json package.json
cp main-order-display.js main.js
npm run build:all
```

Vagy használja a build scriptet:

```bash
./scripts/build-order-display.sh
```

## Verziózás

Az order display verziók a következő formátumban vannak verziózva:
- `v1.10.0-order`
- `v1.11.0-order`
- stb.

## CI/CD Konfiguráció

### GitHub Actions

A GitHub Actions automatikusan felismeri az order display verziókat és külön buildeli őket:

- **Regular build**: `auto-release.yml` workflow (electron-v2 branch)
- **Order display build**: `order-display-release.yml` workflow (electron-v2-order-display branch)

#### Branch szabályok:
- `electron-v2` → Placcon Launcher build
- `electron-v2-order-display` → placcon order display build

### GitLab CI/CD

A GitLab CI/CD is támogatja az order display buildelést:

- **Regular build**: `build-electron-v2` job
- **Order display build**: `build-electron-v2-order-display` job

Az order display build automatikusan aktiválódik, ha:
- A tag `-order` végződéssel rendelkezik (pl. `v1.10.0-order`)
- A branch neve `order-display-` előtaggal kezdődik

## Különbségek a sima electron-v2 verziótól

1. **Kiosk mód**: Teljes képernyőben fut
2. **Alkalmazás név**: "placcon order display"
3. **Verziózás**: `-order` végződés
4. **Külön build folyamat**: GitHub Actions és GitLab CI/CD-ben külön job
5. **Külön fájlok**: `main-order-display.js` és `package-order-display.json`
6. **Kijelző kezelés**: Automatikus másodlagos kijelző és kijelző választás
7. **Nincs serial port**: Az order display verzió nem tartalmaz serial port kezelést

## Használat

Az alkalmazás indítása után automatikusan betölti a test.core.placcon.com oldalt teljes képernyőben a kiválasztott kijelzőn. A felhasználó nem tud kilépni a kiosk módból, ideális megjelenítő eszközökhöz.

### Kijelző megváltoztatása

1. Nyomja meg a `Ctrl+Shift+D` billentyűkombinációt
2. Válassza ki a kívánt kijelzőt a listából
3. Kattintson az "Apply & Restart" gombra
4. Az alkalmazás újraindul a kiválasztott kijelzőn

## Fejlesztés

A fejlesztéshez használja a `main-order-display.js` és `package-order-display.json` fájlokat, hogy ne befolyásolja a sima electron-v2 buildelést.

## Release folyamat

### GitHub Actions
1. Push a `electron-v2-order-display` branchre
2. A GitHub Actions automatikusan buildeli és releaseeli
3. A release tag: `v1.10.0-order` formátumban

### GitLab CI/CD
1. Push egy `-order` végződésű tagot
2. A GitLab automatikusan buildeli és releaseeli
3. A release tag: `v1.10.0-order` formátumban

### Manuális release
```bash
# Order display verzió releaseelése
./scripts/build-order-display.sh
git tag v1.10.0-order
git push origin v1.10.0-order
```

## Beállítások fájl

A kijelző beállítások a következő helyen tárolódnak:
- **Windows**: `%APPDATA%/placcon-order-display/display-settings.json`
- **macOS**: `~/Library/Application Support/placcon-order-display/display-settings.json`
- **Linux**: `~/.config/placcon-order-display/display-settings.json`

A beállítások fájl tartalma:
```json
{
  "displayIndex": 1
}
``` 