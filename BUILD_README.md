# PlaccOn Build Instructions

## GitHub Actions Workflow

Ez a projekt automatikusan buildeli a Windows alkalmazásokat GitHub Actions segítségével.

### Automatikus Build

A workflow automatikusan fut, amikor:
- **Tag push**: `v1.0.0`, `v2.1.3` stb. formátumú tag-eket push-olsz
- **Manuális trigger**: GitHub Actions tab-ban manuálisan indíthatod

### Buildelt alkalmazások

Minden build során 4 különböző Windows executable készül:

1. **app-x64-prod.exe** - Fő alkalmazás Windows x64-re
2. **app-arm64-prod.exe** - Fő alkalmazás Windows ARM64-re  
3. **display-x64-prod.exe** - Vevőkijelző Windows x64-re
4. **display-arm64-prod.exe** - Vevőkijelző Windows ARM64-re

### Hogyan indítsd el a buildet

#### 1. Tag push (ajánlott)
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### 2. Manuális trigger
1. Menj a GitHub repository Actions tab-jára
2. Válaszd ki a "Build Windows Executables" workflow-ot
3. Kattints a "Run workflow" gombra
4. Válaszd ki az environment-t (prod/test)
5. Kattints a "Run workflow" gombra

### Release létrehozása

Amikor tag push történik, automatikusan létrejön egy GitHub Release a következőkkel:
- Minden 4 Windows executable
- Release notes a build információkkal
- Letölthető fájlok a GitHub Releases oldalon

### Build konfiguráció

A workflow a következőket csinálja:

1. **Node.js 18** telepítése
2. **Dependencies** telepítése (`npm ci`)
3. **Windows Electron** telepítése mindkét architektúrára
4. **Build** mindkét alkalmazásra mindkét architektúrára
5. **Executable-ek** átnevezése és összegyűjtése
6. **Artifact** feltöltése
7. **Release** létrehozása (ha tag push történt)

### Fájl struktúra

```
.github/workflows/
├── build.yml          # Komplex workflow (matrix build)
└── build-simple.yml   # Egyszerű workflow (ajánlott)

BUILD_README.md        # Ez a fájl
build.sh              # Lokális build script
```

### Lokális build

Ha lokálisan szeretnéd buildelni:

```bash
# Futtathatóvá teszem a scriptet
chmod +x build.sh

# Interaktív build
./build.sh

# Vagy automatikus válaszokkal
echo -e "1\n1\n1\ny" | ./build.sh  # App, prod, Windows x64
echo -e "2\n2\n2\ny" | ./build.sh  # Display, test, Windows ARM64
```

### Hibaelhárítás

#### "ffmpeg.dll not found" hiba
- A workflow automatikusan telepíti a Windows Electron-t
- Az `ffmpeg-static` csomag ffmpeg fájljait használja

#### Build sikertelen
- Ellenőrizd a GitHub Actions logokat
- Győződj meg róla, hogy a `package.json` és `electron-builder` konfigurációk helyesek

#### Executable nem található
- A workflow automatikusan átnevezi és összegyűjti a fájlokat
- Ellenőrizd a "Prepare artifacts" lépés logjait

### Environment változók

A build során a következő environment változók vannak beállítva:

- `PLACCON_MODE`: `app` vagy `display`
- `PLACCON_ENV`: `prod` vagy `test`

Ezek befolyásolják:
- Az alkalmazás nevét
- Az ikonokat (test esetén `-test` suffix)
- A build konfigurációt 