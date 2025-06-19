#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
    echo -e "${BLUE}  PlaccOn Build Script${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to show menu and get user selection
show_menu() {
    echo ""
    echo "Select application type:"
    echo "1) App (Main application)"
    echo "2) Display (Customer display)"
    echo ""
    read -p "Enter your choice (1-2): " app_choice
    
    echo ""
    echo "Select environment:"
    echo "1) Production"
    echo "2) Test"
    echo ""
    read -p "Enter your choice (1-2): " env_choice
    
    echo ""
    echo "Select operating system:"
    echo "1) Windows (x64)"
    echo "2) Windows (ARM64)"
    echo "3) macOS"
    echo "4) Linux"
    echo ""
    read -p "Enter your choice (1-4): " os_choice
}

# Function to create temporary config files with proper variable substitution
create_temp_config() {
    local app_type=$1
    local env=$2
    local os=$3
    local config_file=""
    
    if [ "$app_type" = "app" ]; then
        config_file="electron-builder.app.json"
    else
        config_file="electron-builder.display.json"
    fi
    
    # Create temporary config file
    local temp_config="temp-${config_file}"
    
    # Set product name based on environment and app type
    local product_name=""
    if [ "$app_type" = "app" ]; then
        if [ "$env" = "test" ]; then
            product_name="PlaccOn TEST"
        else
            product_name="PlaccOn"
        fi
    else
        if [ "$env" = "test" ]; then
            product_name="PlaccOn Vevőkijelző TEST"
        else
            product_name="PlaccOn Vevőkijelző"
        fi
    fi
    
    # Set icon suffix
    local icon_suffix=""
    if [ "$env" = "test" ]; then
        icon_suffix="-test"
    fi
    
    # Create modified config file
    cat "$config_file" | sed "s/\${env:PLACCON_ENV,test,PlaccOn TEST,PlaccOn}/$product_name/g" | \
    sed "s/\${env:PLACCON_ENV,test,PlaccOn Vevőkijelző TEST,PlaccOn Vevőkijelző}/$product_name/g" | \
    sed "s/\${env:PLACCON_ENV,test,-test,}/$icon_suffix/g" > "$temp_config"
    
    echo "$temp_config"
}

# Function to build the application
build_app() {
    local app_type=$1
    local env=$2
    local os=$3
    
    print_status "Building $app_type for $env on $os..."
    
    # Set environment variables
    if [ "$app_type" = "app" ]; then
        export PLACCON_MODE=app
    else
        export PLACCON_MODE=display
    fi
    
    if [ "$env" = "test" ]; then
        export PLACCON_ENV=test
    else
        export PLACCON_ENV=prod
    fi
    
    # Create temporary config file
    local temp_config=$(create_temp_config "$app_type" "$env" "$os")
    
    # Build command based on OS
    case $os in
        "windows-x64")
            if [ "$app_type" = "app" ]; then
                npx electron-builder --config "$temp_config" --win --x64 --publish never
            else
                npx electron-builder --config "$temp_config" --win --x64 --publish never
            fi
            ;;
        "windows-arm64")
            if [ "$app_type" = "app" ]; then
                npx electron-builder --config "$temp_config" --win --arm64 --publish never
            else
                npx electron-builder --config "$temp_config" --win --arm64 --publish never
            fi
            ;;
        "macos")
            if [ "$app_type" = "app" ]; then
                if [ "$env" = "test" ]; then
                    npx electron-builder --config "$temp_config" --mac --publish never
                else
                    npx electron-builder --config "$temp_config" --mac --publish never
                fi
            else
                if [ "$env" = "test" ]; then
                    npx electron-builder --config "$temp_config" --mac --publish never
                else
                    npx electron-builder --config "$temp_config" --mac --publish never
                fi
            fi
            ;;
        "linux")
            if [ "$app_type" = "app" ]; then
                npx electron-builder --config "$temp_config" --linux --publish never
            else
                npx electron-builder --config "$temp_config" --linux --publish never
            fi
            ;;
    esac
    
    # Clean up temporary config
    rm -f "$temp_config"
}

# Function to find and copy the final executable
copy_final_executable() {
    local app_type=$1
    local env=$2
    local os=$3
    
    print_status "Looking for final executable..."
    
    local dist_dir="dist"
    local final_file=""
    local target_dir="builds"
    
    # Create builds directory if it doesn't exist
    mkdir -p "$target_dir"
    
    # Set product name for file search
    local product_name=""
    if [ "$app_type" = "app" ]; then
        if [ "$env" = "test" ]; then
            product_name="PlaccOn TEST"
        else
            product_name="PlaccOn"
        fi
    else
        if [ "$env" = "test" ]; then
            product_name="PlaccOn Vevőkijelző TEST"
        else
            product_name="PlaccOn Vevőkijelző"
        fi
    fi
    
    # Find the executable based on OS and app type
    case $os in
        "windows-x64"|"windows-arm64")
            # Look for portable exe files first
            final_file=$(find "$dist_dir" -name "*$product_name*.exe" -type f | head -1)
            if [ -z "$final_file" ]; then
                # Fallback to any exe file
                final_file=$(find "$dist_dir" -name "*.exe" -type f | head -1)
            fi
            ;;
        "macos")
            # Look for .app bundles
            final_file=$(find "$dist_dir" -name "*$product_name*.app" -type d | head -1)
            if [ -z "$final_file" ]; then
                # Fallback to any .app bundle
                final_file=$(find "$dist_dir" -name "*.app" -type d | head -1)
            fi
            ;;
        "linux")
            # Look for AppImage files
            final_file=$(find "$dist_dir" -name "*$product_name*.AppImage" -type f | head -1)
            if [ -z "$final_file" ]; then
                # Fallback to any AppImage
                final_file=$(find "$dist_dir" -name "*.AppImage" -type f | head -1)
            fi
            ;;
    esac
    
    if [ -n "$final_file" ] && [ -e "$final_file" ]; then
        local filename=$(basename "$final_file")
        local target_path="$target_dir/$filename"
        
        if [ -d "$final_file" ]; then
            # For macOS .app bundles
            rm -rf "$target_path"
            cp -R "$final_file" "$target_path"
        else
            # For Windows .exe and Linux .AppImage
            cp "$final_file" "$target_path"
        fi
        
        print_status "Final executable copied to: $target_path"
        echo ""
        print_status "Build completed successfully!"
        print_status "Your executable is ready at: $target_path"
    else
        print_error "Could not find final executable in dist directory"
        print_warning "Please check the dist folder manually"
        print_status "Available files in dist:"
        find "$dist_dir" -type f -o -type d | head -10
    fi
}

# Function to clean up build artifacts
cleanup() {
    print_status "Cleaning up build artifacts..."
    
    # Remove dist directory but keep the builds directory
    if [ -d "dist" ]; then
        rm -rf dist
        print_status "Build artifacts cleaned up"
    fi
    
    # Remove any temporary config files
    rm -f temp-*.json
}

# Main script
main() {
    print_header
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found. Installing dependencies..."
        npm install
    fi
    
    # Show menu and get user input
    show_menu
    
    # Validate input
    case $app_choice in
        1) app_type="app" ;;
        2) app_type="display" ;;
        *) print_error "Invalid app choice"; exit 1 ;;
    esac
    
    case $env_choice in
        1) env="prod" ;;
        2) env="test" ;;
        *) print_error "Invalid environment choice"; exit 1 ;;
    esac
    
    case $os_choice in
        1) os="windows-x64" ;;
        2) os="windows-arm64" ;;
        3) os="macos" ;;
        4) os="linux" ;;
        *) print_error "Invalid OS choice"; exit 1 ;;
    esac
    
    echo ""
    print_status "Selected configuration:"
    echo "  Application: $app_type"
    echo "  Environment: $env"
    echo "  Operating System: $os"
    echo ""
    
    read -p "Proceed with build? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        print_status "Build cancelled"
        exit 0
    fi
    
    # Start build process
    echo ""
    print_status "Starting build process..."
    
    # Build the application
    build_app "$app_type" "$env" "$os"
    
    # Check if build was successful
    if [ $? -eq 0 ]; then
        # Copy final executable
        copy_final_executable "$app_type" "$env" "$os"
        
        # Clean up
        cleanup
    else
        print_error "Build failed!"
        cleanup
        exit 1
    fi
}

# Run main function
main "$@" 