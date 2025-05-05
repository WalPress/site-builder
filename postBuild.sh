#!/bin/bash

APP_NAME="walpress" # change if needed
BUILD_PATH="./build/bin/$APP_NAME.app"
MACOS_BIN="$BUILD_PATH/Contents/MacOS/$APP_NAME"

echo "🛠️ Building Wails app..."
wails build -clean -race -trimpath

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "🔧 Ensuring binary is executable..."
chmod +x "$MACOS_BIN"

echo "🔏 Signing app with ad-hoc identity..."
codesign --force --deep --sign - "$BUILD_PATH"

echo "🚀 Launching app..."
open "$BUILD_PATH"