# Verziókezelés

Ez a dokumentum leírja, hogyan működik a verziókezelés a Placcon Launcher projektben.

## Verzió formátum

- **Tag formátum:** `v{major}.{minor}.{patch}`
- **Példa:** `v1.5.0`
- **Package.json:** Automatikusan szinkronizálódik a tag-gel

## Release folyamat

### 1. Tag létrehozása
```bash
# Hozz létre egy új tag-et
git tag v1.5.0

# Push-old a tag-et
git push origin v1.5.0
```

### 2. Automatikus verzió frissítés
A GitHub Actions workflow automatikusan:
1. Kiolvassa a tag verzióját
2. Frissíti a `package.json` verzióját
3. Build-eli az alkalmazást a helyes verzióval
4. Létrehozza a release-t

### 3. Verzió szinkronizáció
```bash
# A workflow automatikusan futtatja:
TAG_VERSION=${GITHUB_REF#refs/tags/}
VERSION=${TAG_VERSION#v}
npm version $VERSION --no-git-tag-version
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
Ha a package.json verziója nem egyezik a tag-gel:

1. **Ellenőrizd a tag-et:**
   ```bash
   git tag --list
   ```

2. **Frissítsd a package.json-t:**
   ```bash
   npm version 1.5.0 --no-git-tag-version
   ```

3. **Commit-old a változásokat:**
   ```bash
   git add package.json
   git commit -m "Update version to 1.5.0"
   git push
   ```

### Automatikus verzió frissítés
A workflow automatikusan kezeli a verzió szinkronizációt, de ha problémák vannak:

1. **Ellenőrizd a workflow logokat**
2. **Nézd meg a "Update package.json version" lépést**
3. **Ellenőrizd, hogy a tag formátuma helyes-e**

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