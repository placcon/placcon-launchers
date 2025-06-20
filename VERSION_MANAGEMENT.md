# Verziókezelés

Ez a dokumentum leírja, hogyan működik a verziókezelés a Placcon Launcher projektben.

## Verzió formátum

- **Tag formátum:** `v{major}.{minor}.{patch}`
- **Példa:** `v1.5.0`
- **Package.json:** Automatikusan szinkronizálódik a tag-gel

## Release folyamat

### 1. Tag létrehozása
```bash
# Ellenőrizd, hogy létezik-e már a release
npm run check-release v1.8.0

# Hozz létre egy új tag-et
git tag v1.8.0

# Push-old a tag-et
git push origin v1.8.0
```

### 2. Automatikus verzió frissítés
A GitHub Actions workflow automatikusan:
1. Ellenőrzi, hogy létezik-e már a release
2. Kiolvassa a `package.json` verzióját
3. Build-eli az alkalmazást a package.json verziójával
4. Létrehozza a release-t

### 3. Release létezés ellenőrzése
```bash
# A workflow automatikusan ellenőrzi:
gh release view "$TAG_NAME"
if [ $? -eq 0 ]; then
  echo "❌ Release already exists!"
  exit 1
fi
```

## Verzió konvenciók

### Major verzió (1.x.x)
- Nagyobb változások
- Breaking changes
- Új funkciók

### Minor verzió (x.1.x)
- Új funkciók
- Visszafelé kompatibilis változások

### Patch verzió (x.x.1)
- Bug fixek
- Kisebb javítások

## Hibaelhárítás

### Verzió eltérés
Ha a package.json verziója nem megfelelő:

1. **Ellenőrizd a package.json-t:**
   ```bash
   cat package.json | grep '"version"'
   ```

2. **Frissítsd a package.json-t:**
   ```bash
   npm version 1.8.0 --no-git-tag-version
   ```

3. **Commit-old a változásokat:**
   ```bash
   git add package.json
   git commit -m "Update version to 1.8.0"
   git push
   ```

### Automatikus verzió frissítés
A workflow automatikusan kezeli a verzió szinkronizációt, de ha problémák vannak:

1. **Ellenőrizd a workflow logokat**
2. **Nézd meg a "Update package.json version" lépést**
3. **Ellenőrizd, hogy a tag formátuma helyes-e**

### Automatikus release létrehozás
A workflow automatikusan kezeli a release létrehozást, de ha problémák vannak:

1. **Ellenőrizd a workflow logokat**
2. **Nézd meg a "Get version from package.json" lépést**
3. **Ellenőrizd, hogy a package.json verziója helyes-e**
4. **Használd a check-release script-et: `npm run check-release v1.8.0`**

### Release már létezik
Ha a release már létezik:

```bash
# Ellenőrizd a meglévő release-t
npm run check-release v1.8.0

# Töröld a meglévő release-t (ha szükséges)
gh release delete v1.8.0

# Vagy használj másik verziót
git tag v1.8.1
git push origin v1.8.1
```

## Példák

### Helyes folyamat
```bash
# 1. Tag létrehozása
git tag v1.5.0
git push origin v1.5.0

# 2. Workflow automatikusan:
# - Frissíti package.json-t 1.5.0-ra
# - Build-eli az alkalmazást
# - Létrehozza a release-t v1.5.0 tag-gel
```

### Hibás folyamat
```bash
# ❌ Rossz: package.json v1.6.0, tag v1.5.0
# Ez duplikált fájlokat eredményez
```

## Kapcsolódó fájlok

- `.github/workflows/release.yml` - Release workflow
- `.github/workflows/prepare-release.yml` - Prepare release workflow
- `package.json` - Projekt verzió
- `scripts/create-release.sh` - Release script 

### 3. Verzió kezelés
```bash
# A felhasználó manuálisan frissíti a package.json verzióját
npm version 1.8.0 --no-git-tag-version
git add package.json
git commit -m "Update version to 1.8.0"
git push

# A workflow automatikusan kiolvassa a verziót:
VERSION=$(node -p "require('./package.json').version")
``` 