#!/bin/bash

# Configuration
APP_NAME="myproject"
FRONTEND_PORT=5173
BACKEND_PORT=34115
FRONTEND_DIR="./frontend"
BACKEND_EXEC="./build/bin/$APP_NAME.app/Contents/MacOS/$APP_NAME"

echo "🟢 Starting Vite frontend on port $FRONTEND_PORT..."
(cd "$FRONTEND_DIR" && npm run dev) &

FRONTEND_PID=$!
sleep 3

# Confirm backend exists
if [ ! -f "$BACKEND_EXEC" ]; then
  echo "❌ Backend binary not found. Run 'wails build' first."
  exit 1
fi

echo "🚀 Starting Wails Go backend directly (bypassing .app)..."
"$BACKEND_EXEC" &

BACKEND_PID=$!
sleep 2

echo ""
echo "🌍 Dev server should be live at: http://localhost:$BACKEND_PORT"
echo "🧠 Go bindings should now be accessible from the frontend in browser"
echo "🛑 Press Ctrl+C to stop both servers"
echo ""

# Trap Ctrl+C to clean up both processes
trap "echo '🛑 Stopping...'; kill $FRONTEND_PID $BACKEND_PID; exit" INT
wait