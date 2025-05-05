package src

import (
	"context"
	"database/sql"
	"fmt"
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

// Start performs environment bootstrap steps
func (a *App) Start() (string, error) {
	runtime.LogInfo(a.ctx, "Starting application...")
	// Get the app data directory
	dataDir, dErr := utils.GetUserDataPath("walpress")
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

	// 2. Check for rust installation
	a.checkRustInstallation()

	// 3. Check for sui installation
	suiBinaryPath, err := a.checkSuiInstallation(dataDir, folderAssets, a.env)
	if err != nil {
		log.Fatalf("Failed to check for sui installation: %v", err)
	}
	runtime.LogInfo(a.ctx, "✅ Sui binary downloaded at: "+suiBinaryPath)

	// 4. Check for walrus installation
	a.checkWalrusInstallation()

	// 5. Check for site-builder installation
	a.checkSiteBuilderInstallation(dataDir)

	// 6. Check for walrus client config
	a.checkWalrusClientConfig(dataDir)

	// 7. Check for walrus site config
	a.checkWalrusSiteConfig(dataDir)

	// 8. Check for walrus site config
	a.checkWalrusSiteConfig(dataDir)

	runtime.LogInfo(a.ctx, "Application setup complete.")
	runtime.LogInfo(a.ctx, "Checking for user authentication...")
	return a.checkUserAuth()
}

func (a *App) checkUserAuth() (string, error) {
	runtime.LogInfo(a.ctx, "Checking for user authentication...")
	return wallet.CheckUserAuth()
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
