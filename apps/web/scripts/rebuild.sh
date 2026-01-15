#!/bin/bash
# Rebuild and install APK wirelessly to Android device
# Usage: ./scripts/rebuild.sh

set -e

cd "$(dirname "$0")/.."

echo "📦 Building SvelteKit app..."
pnpm build 2>&1 | tail -5

echo "🔄 Syncing with Capacitor..."
npx cap sync android 2>&1 | tail -3

echo "🔨 Building Android APK..."
cd android && ./gradlew assembleDebug 2>&1 | tail -3 && cd ..

echo "📲 Installing to device wirelessly..."
~/Library/Android/sdk/platform-tools/adb -s 192.168.0.225:5555 install -r android/app/build/outputs/apk/debug/app-debug.apk

echo "✅ Done!"
