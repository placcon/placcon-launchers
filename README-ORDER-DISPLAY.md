# Placcon Order Display

A Placcon Order Display egy Electron-alapú kiosk alkalmazás, amely a test.core.placcon.com oldalt jeleníti meg teljes képernyőben.

## Funkciók

- **Kiosk mód**: Teljes képernyőben fut, ideális megjelenítő eszközökhöz
- **Webes tartalom**: A test.core.placcon.com oldal betöltése
- **Serial port támogatás**: Soros port kommunikáció a hardverrel
- **Biztonságos navigáció**: Külső linkek blokkolása, csak a Placcon domain engedélyezett

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

## Verziózás

Az order display verziók a következő formátumban vannak verziózva:
- `v1.10.0-order`
- `v1.11.0-order`
- stb.

## GitLab CI/CD

A GitLab CI/CD automatikusan felismeri az order display verziókat és külön buildeli őket:

- **Regular build**: `build-electron-v2` job
- **Order display build**: `build-electron-v2-order-display` job

Az order display build automatikusan aktiválódik, ha:
- A tag `-order` végződéssel rendelkezik (pl. `v1.10.0-order`)
- A branch neve `order-display-` előtaggal kezdődik

## Különbségek a sima electron-v2 verziótól

1. **Kiosk mód**: Teljes képernyőben fut
2. **Alkalmazás név**: "placcon order display"
3. **Verziózás**: `-order` végződés
4. **Külön build folyamat**: GitLab CI/CD-ben külön job

## Használat

Az alkalmazás indítása után automatikusan betölti a test.core.placcon.com oldalt teljes képernyőben. A felhasználó nem tud kilépni a kiosk módból, ideális megjelenítő eszközökhöz.

## Fejlesztés

A fejlesztéshez használja a `main-order-display.js` és `package-order-display.json` fájlokat, hogy ne befolyásolja a sima electron-v2 buildelést. 