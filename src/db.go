package src

import (
	"cli-runner/src/utils"
	"database/sql"
	"fmt"
	"path/filepath"

	_ "modernc.org/sqlite"
)

func createDB() *sql.DB {
	dataDir, dErr := utils.GetUserDataPath("walpress")
	if dErr != nil {
		panic("Failed to get app data directory: " + dErr.Error())
	}

	dbPath := filepath.Join(dataDir, "db.sqlite")

	fmt.Println("Creating DB at:", dbPath)
	db, openErr := sql.Open("sqlite", dbPath)
	if openErr != nil {
		panic("Failed to create/open SQLite database " + dbPath + ": " + openErr.Error())
	}

	err := db.Ping()
	if err != nil {
		panic("❌ DB not reachable: " + err.Error())
	}

	fmt.Println("✅ DB connected at:", dbPath)
	createTables(db)
	return db
}

func createSettingsTable(db *sql.DB) {
	createTable := `
	CREATE TABLE IF NOT EXISTS settings (
		key TEXT NOT NULL,
		value TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
	`
	_, err := db.Exec(createTable)
	if err != nil {
		panic("❌ Failed to create settings table: " + err.Error())
	}
}

func createSitesTable(db *sql.DB) {
	createTable := `
	CREATE TABLE IF NOT EXISTS sites (
		id UUID PRIMARY KEY,
		address TEXT NOT NULL,
		name TEXT NOT NULL,
		content TEXT NOT NULL,
		published BOOLEAN NOT NULL,
		blob_id TEXT NOT NULL,
		status TEXT NOT NULL,
		published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
	`
	_, err := db.Exec(createTable)
	if err != nil {
		panic("❌ Failed to create sites table: " + err.Error())
	}
}

func createNSTable(db *sql.DB) {
	createTable := `
	CREATE TABLE IF NOT EXISTS ns (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		owner_address TEXT NOT NULL,
		name TEXT NOT NULL,
		site_blob_id TEXT NOT NULL,
		site_url TEXT NOT NULL,
		linked BOOLEAN NOT NULL DEFAULT FALSE,
		registered_at DATETIME DEFAULT NULL,
		expires_at DATETIME DEFAULT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
	`
	_, err := db.Exec(createTable)
	if err != nil {
		panic("❌ Failed to create ns table: " + err.Error())
	}
}

func createTables(db *sql.DB) {
	createSettingsTable(db)
	createSitesTable(db)
	createNSTable(db)
}
