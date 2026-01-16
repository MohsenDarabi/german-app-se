#!/bin/bash
# Rebuild and deploy iOS app
#
# Usage:
#   ./scripts/rebuild-ios.sh                    # Build for first connected device
#   ./scripts/rebuild-ios.sh --list             # List available targets
#   ./scripts/rebuild-ios.sh --target <ID>      # Build for specific device
#   ./scripts/rebuild-ios.sh --simulator        # Run on simulator (interactive)
#
# Examples:
#   ./scripts/rebuild-ios.sh --list
#   ./scripts/rebuild-ios.sh --target 51fb285bae9bea103ae1e51c861bb12308a83151

set -e

# Store the apps/web directory
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"

# Parse arguments
TARGET="device"
DEVICE_ID=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --simulator)
            TARGET="simulator"
            shift
            ;;
        --device)
            TARGET="device"
            shift
            ;;
        --target)
            DEVICE_ID="$2"
            shift 2
            ;;
        --list)
            echo "📱 Available targets:"
            echo ""
            npx cap run ios --list
            echo ""
            echo "Usage: ./scripts/rebuild-ios.sh --target <Target ID>"
            exit 0
            ;;
        --help|-h)
            echo "Usage: ./scripts/rebuild-ios.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --list              List available devices/simulators"
            echo "  --target <ID>       Build for specific device ID"
            echo "  --simulator         Run on simulator (interactive picker)"
            echo "  --help, -h          Show this help"
            echo ""
            echo "Examples:"
            echo "  ./scripts/rebuild-ios.sh --list"
            echo "  ./scripts/rebuild-ios.sh --target 51fb285bae9bea103ae1e51c861bb12308a83151"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage"
            exit 1
            ;;
    esac
done

echo "📦 Building SvelteKit app..."
pnpm run build

echo "🔄 Syncing with Capacitor..."
npx cap sync ios

if [ "$TARGET" = "simulator" ]; then
    echo "📱 Running on simulator..."
    npx cap run ios
else
    # Build for device
    if [ -z "$DEVICE_ID" ]; then
        # Try to find connected device
        DEVICE_ID=$(npx cap run ios --list 2>/dev/null | grep -v "simulator" | grep -v "API" | grep -v "^-" | grep -v "^Name" | head -1 | awk '{print $NF}')
    fi

    if [ -z "$DEVICE_ID" ]; then
        echo "⚠️  No physical device found. Use --simulator or connect a device."
        echo "   List targets: ./scripts/rebuild-ios.sh --list"
        exit 1
    fi

    echo "📱 Building for device: $DEVICE_ID"
    echo "🔨 Building iOS app..."

    cd "$SCRIPT_DIR/ios/App"
    xcodebuild -project App.xcodeproj -scheme "App" -configuration Debug \
        -destination "id=$DEVICE_ID" build

    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "📲 To install on device, either:"
    echo "   1. Open Xcode and press Cmd+R (recommended for wireless)"
    echo "   2. Connect via USB and run:"
    echo "      ios-deploy --bundle ~/Library/Developer/Xcode/DerivedData/App-*/Build/Products/Debug-iphoneos/App.app"
    echo ""
    echo "   Xcode project: $SCRIPT_DIR/ios/App/App.xcodeproj"
fi
