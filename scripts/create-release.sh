#!/bin/bash

# Placcon Launcher Release Script
# This script helps create a release manually

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Placcon Launcher Release Script${NC}"
echo "=================================="

# Check if tag is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a tag name${NC}"
    echo "Usage: $0 <tag>"
    echo "Example: $0 v1.5.0"
    exit 1
fi

TAG=$1
echo -e "${YELLOW}Creating release for tag: $TAG${NC}"

# Build for all platforms
echo -e "${GREEN}Building for all platforms...${NC}"
npm run build:all

# Find release files
echo -e "${GREEN}Finding release files...${NC}"
DMG_FILES=$(find dist -name "*.dmg" -type f | grep -E "Placcon Launcher-[0-9]+\.[0-9]+\.[0-9]+-arm64" | sort -u)
EXE_FILES=$(find dist -name "*.exe" -type f | grep -E "Placcon Launcher Setup [0-9]+\.[0-9]+\.[0-9]+\.exe$" | sort -u)
DEB_FILES=$(find dist -name "*.deb" -type f | grep -E "placcon-launcher_[0-9]+\.[0-9]+\.[0-9]+" | sort -u)

echo -e "${YELLOW}Found files:${NC}"
if [ ! -z "$DMG_FILES" ]; then
    echo "DMG files:"
    echo "$DMG_FILES"
fi

if [ ! -z "$EXE_FILES" ]; then
    echo "EXE files:"
    echo "$EXE_FILES"
fi

if [ ! -z "$DEB_FILES" ]; then
    echo "DEB files:"
    echo "$DEB_FILES"
fi

# Rename files with platform prefixes
echo -e "${GREEN}Renaming files with platform prefixes...${NC}"

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

# Rename DMG file (macOS)
DMG_FILE=$(echo "$DMG_FILES" | head -1)
if [ ! -z "$DMG_FILE" ]; then
    NEW_DMG_NAME="osx-Placcon-Launcher-$VERSION-arm64.dmg"
    NEW_DMG_PATH=$(dirname "$DMG_FILE")/$NEW_DMG_NAME
    mv "$DMG_FILE" "$NEW_DMG_PATH"
    echo "Renamed DMG: $NEW_DMG_NAME"
fi

# Rename EXE file (Windows)
EXE_FILE=$(echo "$EXE_FILES" | head -1)
if [ ! -z "$EXE_FILE" ]; then
    NEW_EXE_NAME="windows-Placcon-Launcher-Setup-$VERSION.exe"
    NEW_EXE_PATH=$(dirname "$EXE_FILE")/$NEW_EXE_NAME
    mv "$EXE_FILE" "$NEW_EXE_PATH"
    echo "Renamed EXE: $NEW_EXE_NAME"
fi

# Rename DEB files (Linux)
for DEB_FILE in $DEB_FILES; do
    if [[ "$DEB_FILE" == *"amd64"* ]]; then
        NEW_DEB_NAME="linux-placcon-launcher-$VERSION-amd64.deb"
    elif [[ "$DEB_FILE" == *"arm64"* ]]; then
        NEW_DEB_NAME="linux-placcon-launcher-$VERSION-arm64.deb"
    else
        NEW_DEB_NAME="linux-$(basename "$DEB_FILE")"
    fi
    NEW_DEB_PATH=$(dirname "$DEB_FILE")/$NEW_DEB_NAME
    mv "$DEB_FILE" "$NEW_DEB_PATH"
    echo "Renamed DEB: $NEW_DEB_NAME"
done

# Create final file list (one file per platform)
FINAL_FILES=""

# Add renamed DMG file (ARM64)
if [ ! -z "$DMG_FILE" ]; then
    FINAL_FILES="$FINAL_FILES $NEW_DMG_PATH"
fi

# Add renamed EXE file (Setup)
if [ ! -z "$EXE_FILE" ]; then
    FINAL_FILES="$FINAL_FILES $NEW_EXE_PATH"
fi

# Add renamed DEB files (both architectures)
for DEB_FILE in $DEB_FILES; do
    if [[ "$DEB_FILE" == *"amd64"* ]]; then
        FINAL_FILES="$FINAL_FILES $(dirname "$DEB_FILE")/linux-placcon-launcher-$VERSION-amd64.deb"
    elif [[ "$DEB_FILE" == *"arm64"* ]]; then
        FINAL_FILES="$FINAL_FILES $(dirname "$DEB_FILE")/linux-placcon-launcher-$VERSION-arm64.deb"
    fi
done

echo -e "${GREEN}Final release files:${NC}"
echo "$FINAL_FILES"

# Create release using GitHub CLI if available
if command -v gh &> /dev/null; then
    echo -e "${GREEN}GitHub CLI found. Creating release...${NC}"
    
    # Create release
    gh release create $TAG \
        --title "Release $TAG" \
        --notes "Placcon Launcher $TAG

## Changes
- Automated release

## Downloads
- macOS: DMG installer
- Windows: EXE installer  
- Linux: DEB package" \
        --draft=false \
        --prerelease=false \
        $FINAL_FILES
    
    echo -e "${GREEN}Release created successfully!${NC}"
else
    echo -e "${YELLOW}GitHub CLI not found.${NC}"
    echo "Please install GitHub CLI or create the release manually:"
    echo "1. Go to https://github.com/your-repo/releases"
    echo "2. Click 'Draft a new release'"
    echo "3. Use tag: $TAG"
    echo "4. Upload the following files:"
    echo "$FINAL_FILES"
fi

echo -e "${GREEN}Done!${NC}" 