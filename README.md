# Placcon Launchers

This is an Electron-based application that provides two separate windows:
- Display: Fullscreen mode for Placcon Display
- Placcon: Windowed mode for Placcon application

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the application in development mode:
```bash
npm start
```

## Building

To build the application for your platform:

```bash
npm run build
```

The built executables will be available in the `dist` directory.

## Features

- Separate user profiles for Display and Placcon
- Display runs in fullscreen mode
- Placcon runs in windowed mode
- Automatic URL loading based on environment
- Cross-platform support (Windows, macOS, Linux)

## Build Variációk

### Windows
- **App (x64, prod):**
  ```bash
  npm run build:prod:app:win
  ```
- **App (arm64, prod):**
  ```bash
  npm run build:prod:app:win:arm
  ```
- **App (x64, test):**
  ```bash
  npm run build:test:app:win
  ```
- **App (arm64, test):**
  ```bash
  npm run build:test:app:win:arm
  ```
- **Display (x64, prod):**
  ```bash
  npm run build:prod:display:win
  ```
- **Display (arm64, prod):**
  ```bash
  npm run build:prod:display:win:arm
  ```
- **Display (x64, test):**
  ```bash
  npm run build:test:display:win
  ```
- **Display (arm64, test):**
  ```bash
  npm run build:test:display:win:arm
  ```

### macOS
- **App (prod):**
  ```bash
  npm run build:prod:app:mac
  ```
- **App (test):**
  ```bash
  npm run build:test:app:mac
  ```
- **Display (prod):**
  ```bash
  npm run build:prod:display:mac
  ```
- **Display (test):**
  ```bash
  npm run build:test:display:mac
  ```

### Linux
- **App (prod):**
  ```bash
  npm run build:prod:app:linux
  ```
- **App (test):**
  ```bash
  npm run build:test:app:linux
  ```
- **Display (prod):**
  ```bash
  npm run build:prod:display:linux
  ```
- **Display (test):**
  ```bash
  npm run build:test:display:linux
  ```

## Minden verzió buildelése egy paranccsal

```bash
npm run build:all
```

Ez a parancs minden támogatott platformra, minden variációban (test/prod, app/display, x64/arm) buildel. 