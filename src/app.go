package src

import (
	"context"
	"database/sql"
	"log"
	"os"
	"sync"

	"cli-runner/src/utils"
	"cli-runner/src/wallet"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	_ "modernc.org/sqlite"
)

// App struct
type App struct {
	ctx           context.Context
	db            *sql.DB
	env           string
	ready         bool
	installing    bool
	mu            sync.Mutex
	activeUploads map[string]*uploadSession
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// Bootstrap performs environment bootstrap steps
func (a *App) Bootstrap(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) start() {
	if a.installing {
		return
	}
	a.installing = true
	runtime.LogInfo(a.ctx, "Starting application...")
	// Get the app data directory
	dataDir, dErr := utils.GetUserDataPath()
	if dErr != nil {
		panic("Failed to get app data directory: " + dErr.Error())
	}

	runtime.LogInfo(a.ctx, "✅ User data path: "+dataDir)

	db := createDB()
	a.db = db
	// 1. Check if appData folder exists
	appDataPath := dataDir
	if _, err := os.Stat(appDataPath); os.IsNotExist(err) {
		runtime.LogInfo(a.ctx, "Storage directory not found, creating: "+appDataPath)
		err := os.Mkdir(appDataPath, 0755) // Create directory with default permissions
		if err != nil {
			log.Fatalf("Failed to create storage directory: %v", err)
		}
	} else {
		runtime.LogInfo(a.ctx, "✅ Storage directory found: "+appDataPath)
	}

	runtime.LogInfo(a.ctx, "Application setup complete.")
	a.ready = true
}

// Start performs environment bootstrap steps
func (a *App) CheckUserAuth() (map[string]interface{}, error) {
	go a.start()
	if !a.ready {
		return map[string]interface{}{
			"auth":     false,
			"address":  "",
			"appReady": a.ready,
			"status":   "Installing dependencies...",
		}, nil
	}
	// go a.init()
	address, err := wallet.CheckUserAuth()
	if err != nil {
		return map[string]interface{}{
			"auth":     false,
			"address":  "",
			"appReady": a.ready,
		}, nil
	}
	return map[string]interface{}{
		"auth":     true,
		"address":  address,
		"appReady": a.ready,
	}, nil
}
