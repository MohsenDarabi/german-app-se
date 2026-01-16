#!/bin/bash
# Rebuild and deploy iOS app
# Usage: ./scripts/rebuild-ios.sh [--device] [--simulator]

set -e

cd "$(dirname "$0")/.."

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
        --list)
            echo "📱 Available targets:"
            npx cap run ios --list
            exit 0
            ;;
        *)
            DEVICE_ID="$1"
            shift
            ;;
    esac
done

echo "📦 Building SvelteKit app..."
pnpm run build

echo "🔄 Syncing with Capacitor..."
npx cap sync ios

echo "🔨 Building iOS app..."
cd ios/App

if [ "$TARGET" = "simulator" ]; then
    echo "📱 Running on simulator..."
    cd ../..
    npx cap run ios
else
    # Build for device
    if [ -n "$DEVICE_ID" ]; then
        DESTINATION="id=$DEVICE_ID"
    else
        # Try to find connected device
        DEVICE_ID=$(npx cap run ios --list 2>/dev/null | grep -v "simulator" | grep -v "API" | grep -v "^-" | head -1 | awk '{print $NF}')
        if [ -n "$DEVICE_ID" ]; then
            DESTINATION="id=$DEVICE_ID"
            echo "📱 Found device: $DEVICE_ID"
        else
            echo "⚠️  No physical device found. Use --simulator or connect a device."
            echo "   List targets: ./scripts/rebuild-ios.sh --list"
            exit 1
        fi
    fi

    echo "🏗️  Building with xcodebuild..."
    xcodebuild -project App.xcodeproj -scheme "App" -configuration Debug \
        -destination "$DESTINATION" build

    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "📲 To install on device, either:"
    echo "   1. Open Xcode and press Cmd+R (recommended for wireless)"
    echo "   2. Connect via USB and run: ios-deploy --bundle <path-to-app>"
    echo ""
    echo "   Xcode project: apps/web/ios/App/App.xcodeproj"
fi
