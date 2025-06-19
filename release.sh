#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  PlaccOn Release Helper${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run this script from the project root."
    exit 1
fi

print_header

# Get current version from package.json
current_version=$(node -p "require('./package.json').version")
print_status "Current version in package.json: $current_version"

echo ""
echo "Select release type:"
echo "1) Patch release (1.0.0 -> 1.0.1)"
echo "2) Minor release (1.0.0 -> 1.1.0)"
echo "3) Major release (1.0.0 -> 2.0.0)"
echo "4) Custom version"
echo ""
read -p "Enter your choice (1-4): " release_choice

case $release_choice in
    1)
        # Patch release
        new_version=$(echo $current_version | awk -F. '{print $1"."$2"."$3+1}')
        ;;
    2)
        # Minor release
        new_version=$(echo $current_version | awk -F. '{print $1"."$2+1".0"}')
        ;;
    3)
        # Major release
        new_version=$(echo $current_version | awk -F. '{print $1+1".0.0"}')
        ;;
    4)
        # Custom version
        read -p "Enter custom version (e.g., 1.2.3): " new_version
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_status "New version will be: $new_version"

echo ""
echo "Select environment:"
echo "1) Production"
echo "2) Test"
echo ""
read -p "Enter your choice (1-2): " env_choice

case $env_choice in
    1) env="prod" ;;
    2) env="test" ;;
    *) print_error "Invalid environment choice"; exit 1 ;;
esac

echo ""
print_status "Environment: $env"

read -p "Proceed with creating tag v$new_version? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    print_status "Release cancelled"
    exit 0
fi

# Update package.json version
print_status "Updating package.json version..."
npm version $new_version --no-git-tag-version

# Create git tag
print_status "Creating git tag v$new_version..."
git add package.json
git commit -m "Bump version to $new_version"
git tag "v$new_version"

# Push changes
print_status "Pushing changes and tag to remote..."
git push origin main
git push origin "v$new_version"

echo ""
print_status "Release tag v$new_version created and pushed!"
print_status "GitHub Actions will automatically start building the executables."
print_status "Check the Actions tab in your GitHub repository to monitor the build progress."
print_status "Once complete, the release will be available in the Releases section." 