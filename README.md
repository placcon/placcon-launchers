# Placcon Launcher

A desktop application launcher for the Placcon restaurant management system.

## Features

- **Cross-platform**: Windows (x64, ARM64), macOS (ARM64, x64), Linux (x64, ARM64)
- **Persistent storage**: Saves login credentials, cookies, and local storage data
- **Clean interface**: No browser bars, bookmarks, or search functionality
- **Secure**: Isolated from system, prevents external navigation
- **Native experience**: Looks and feels like a native desktop application

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd placcon-launchers
```

2. Install dependencies:
```bash
npm install
```

3. Start the development version:
```bash
npm start
```

## Building

### Local Build

**Build for all platforms:**
```bash
npm run build:all
```

**Build for specific platforms:**

Windows:
```bash
npm run build:win
```

macOS:
```bash
npm run build:mac
```

Linux:
```bash
npm run build:linux
```

### Automated Builds (GitHub Actions)

The project includes GitHub Actions workflows for automated builds:

1. **Build Workflows**:
   - `build-mac.yml` - Builds for macOS (DMG)
   - `build-win.yml` - Builds for Windows (EXE)
   - `build-linux.yml` - Builds for Linux (DEB)
   - All trigger on push/PR to `electron-v2` branch
   - Upload installers as artifacts (kept forever)

2. **Release Workflows**:
   - `create-release.yml` - Creates release from all build artifacts with auto-incrementing version
   - `release.yml` - Creates release when pushing tags (e.g., `v1.0.0`)
   - Both include all platform installers

### Build Outputs

The built applications will be available in the `dist` folder:

- **Windows**: `.exe` installer (x64, ARM64)
- **macOS**: `.dmg` files (ARM64, x64)
- **Linux**: `.deb` packages (x64, ARM64)

## Configuration

The application loads `https://test.core.placcon.com` by default. To change the target URL, modify the `mainWindow.loadURL()` call in `main.js`.

## Security Features

- Context isolation enabled
- Node.js integration disabled
- Web security enabled
- External navigation blocked
- File protocol access prevented

## Development

### Project Structure

```
placcon-launchers/
├── main.js          # Main Electron process
├── preload.js       # Preload script for security
├── renderer.js      # Renderer process script
├── index.html       # Loading page
├── package.json     # Project configuration
├── assets/          # Application icons
├── .github/workflows/ # GitHub Actions workflows
└── dist/           # Build outputs
```

### Available Scripts

- `npm start` - Start development version
- `npm run dev` - Start with development flags
- `npm run build` - Build for current platform
- `npm run build:win` - Build for Windows
- `npm run build:mac` - Build for macOS
- `npm run build:linux` - Build for Linux
- `npm run build:all` - Build for all platforms

## GitHub Actions

### Manual Build
Push to `electron-v2` branch to trigger automated builds.

### Create Release
1. Create and push a tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. GitHub Actions will automatically:
   - Build for all platforms
   - Create a release with installers
   - Generate release notes

### Accessing Builds
- **Artifacts**: Available in GitHub Actions tab for each workflow run
- **Releases**: Available in Releases tab with all platform installers

## Troubleshooting

### Common Issues

1. **Build fails on macOS**: Ensure you have Xcode Command Line Tools installed
2. **Windows build issues**: Install Visual Studio Build Tools
3. **Linux build issues**: Install required packages: `sudo apt-get install rpm`

### Logs

Check the console output for any error messages during development or build.

## License

MIT License 

### Version Management

The project uses automatic version incrementing:
- **Starting version**: v1.4.0 (current latest)
- **Auto-increment**: Minor version increases with each build (1.4.0 → 1.5.0 → 1.6.0...)
- **Manual tags**: Can still use manual tags for specific releases
- **Package.json**: Automatically updated with new version numbers 