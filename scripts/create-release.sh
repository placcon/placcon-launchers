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
EXE_FILES=$(find dist -name "*.exe" -type f | grep -E "Placcon Launcher Setup [0-9]+\.[0-9]+\.[0-9]+" | sort -u)
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
        $DMG_FILES $EXE_FILES $DEB_FILES
    
    echo -e "${GREEN}Release created successfully!${NC}"
else
    echo -e "${YELLOW}GitHub CLI not found.${NC}"
    echo "Please install GitHub CLI or create the release manually:"
    echo "1. Go to https://github.com/your-repo/releases"
    echo "2. Click 'Draft a new release'"
    echo "3. Use tag: $TAG"
    echo "4. Upload the following files:"
    echo "$DMG_FILES $EXE_FILES $DEB_FILES"
fi

echo -e "${GREEN}Done!${NC}" 