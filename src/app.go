package src

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"sync"

	"cli-runner/src/settings"
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
	initOnce      sync.Once // Added for one-time initialization
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// Bootstrap performs environment bootstrap steps
func (a *App) Bootstrap(ctx context.Context) {
	a.ctx = ctx
}

// doInitialSetup contains the actual application initialization logic.
// It's intended to be called once via initOnce.
func (a *App) doInitialSetup() {
	a.mu.Lock()
	if a.ready { // Already initialized by a concurrent call that won the race
		a.mu.Unlock()
		return
	}
	a.installing = true
	a.mu.Unlock()

	runtime.LogInfo(a.ctx, "Starting application setup...")
	// Get the app data directory
	dataDir, dErr := utils.GetUserDataPath()
	if dErr != nil {
		runtime.LogError(a.ctx, "Failed to get app data directory: "+dErr.Error())
		a.mu.Lock()
		a.installing = false // Reset flag on error
		a.mu.Unlock()
		// Consider how to signal this failure to callers if ensureInitialized doesn't return error
		return
	}

	runtime.LogInfo(a.ctx, "✅ User data path: "+dataDir)

	db := createDB() // Assuming createDB() is safe

	a.mu.Lock()
	a.db = db // Initialize a.db under lock
	a.mu.Unlock()

	// Check if appData folder exists
	appDataPath := dataDir
	if _, err := os.Stat(appDataPath); os.IsNotExist(err) {
		runtime.LogInfo(a.ctx, "Storage directory not found, creating: "+appDataPath)
		err := os.Mkdir(appDataPath, 0755) // Create directory with default permissions
		if err != nil {
			runtime.LogError(a.ctx, fmt.Sprintf("Failed to create storage directory: %v", err))
			a.mu.Lock()
			a.installing = false // Reset flag on error
			// a.db might be set, but part of init failed.
			a.mu.Unlock()
			return
		}
	} else {
		runtime.LogInfo(a.ctx, "✅ Storage directory found: "+appDataPath)
	}

	// Moved IS_AUTHENTICATED setting logic here, as it's part of initial setup
	// This logic requires a.db to be valid.
	// "check if the setting exists and if it doesn't skip" was the previous request for the CreateOrUpdate.
	// This means: if setting "IS_AUTHENTICATED" exists, update it to "false". If it doesn't exist, do nothing.
	_, getErr := settings.Get(a.db, utils.IS_AUTHENTICATED)
	fmt.Println("getErr", getErr)
	if getErr != nil { // If the setting does not exist
		err := settings.CreateOrUpdate(a.db, utils.IS_AUTHENTICATED, "false")
		if err != nil {
			runtime.LogError(a.ctx, fmt.Sprintf("Failed to create IS_AUTHENTICATED setting: %v", err))
		}
	}

	utils.AddALLEnvironments()

	wallet.SwitchNetwork(a.db, "mainnet")

	a.mu.Lock()
	a.ready = true
	a.installing = false
	a.mu.Unlock()
	runtime.LogInfo(a.ctx, "Application setup complete.")
}

// ensureInitialized guarantees that doInitialSetup is called exactly once.
func (a *App) ensureInitialized() {
	a.initOnce.Do(func() {
		a.doInitialSetup()
	})
}

// CheckUserAuth performs environment bootstrap steps
func (a *App) CheckUserAuth() (map[string]interface{}, error) {
	a.ensureInitialized() // Ensure initialization is done

	a.mu.Lock()
	if !a.ready || a.db == nil {
		a.mu.Unlock()
		runtime.LogError(a.ctx, "Application is not ready or DB not initialized after setup attempt.")
		return map[string]interface{}{
			"auth":     false,
			"address":  "",
			"appReady": false, // Reflect that critical init failed or timed out
			"status":   "Initialization Error",
		}, fmt.Errorf("application initialization failed or did not complete successfully")
	}
	// Safe to use a.db now. Capture current state under lock.
	currentDB := a.db
	appIsReady := a.ready // Should be true here
	a.mu.Unlock()

	authSettingValue, err := settings.Get(currentDB, utils.IS_AUTHENTICATED)
	if err != nil {
		// Setting not found or DB error, treat as not authenticated for this check
		runtime.LogInfo(a.ctx, fmt.Sprintf("Could not retrieve IS_AUTHENTICATED setting: %v. Treating as not authenticated.", err))
		return map[string]interface{}{
			"auth":     false,
			"address":  "",
			"appReady": appIsReady, // Reflects actual ready state
		}, nil // Original code returns nil error here
	}

	// If we are here, appIsReady is true (checked above)
	// authSettingValue holds the string value of IS_AUTHENTICATED like "true" or "false"

	address, walletErr := wallet.CheckUserAuth()
	if walletErr != nil {
		runtime.LogInfo(a.ctx, fmt.Sprintf("wallet.CheckUserAuth failed: %v", walletErr))
		return map[string]interface{}{
			"auth":     false, // Wallet auth failed
			"address":  "",
			"appReady": appIsReady,
		}, nil // Original code returns nil error here
	}

	// Assuming authSettingValue from settings.Get is a string like "true" or "false"
	// Convert to boolean for the map
	isAuthenticated := authSettingValue == "true"

	return map[string]interface{}{
		"auth":     isAuthenticated,
		"address":  address,
		"appReady": appIsReady,
	}, nil
}

func (a *App) Logout() (string, error) {
	err := settings.CreateOrUpdate(a.db, utils.IS_AUTHENTICATED, "false")
	if err != nil {
		return "", fmt.Errorf("failed to logout: " + err.Error())
	}
	runtime.LogInfo(a.ctx, "Logged out successfully")
	return "success", nil
}
