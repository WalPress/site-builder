package settings

import (
	"database/sql"
	"fmt"
	"time"
)

type Settings struct {
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func CreateOrUpdate(db *sql.DB, key string, value string) error {
	fmt.Println("CreateOrUpdate", key, value)
	tx, err := db.Begin()
	if err != nil {
		fmt.Println("CreateOrUpdate", err)
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2", key, value)
	if err != nil {
		fmt.Println("CreateOrUpdate", err)
		return err
	}
	fmt.Println("CreateOrUpdate", "commit")
	return tx.Commit()
}

func Delete(db *sql.DB, key string) error {
	_, err := db.Exec("DELETE FROM settings WHERE key = $1", key)
	if err != nil {
		return err
	}
	return nil
}

func Get(db *sql.DB, key string) (string, error) {
	var value string
	err := db.QueryRow("SELECT value FROM settings WHERE key = $1", key).Scan(&value)
	if err != nil {
		return "", err
	}
	return value, nil
}

func List(db *sql.DB) ([]Settings, error) {
	rows, err := db.Query("SELECT * FROM settings")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var settings []Settings
	for rows.Next() {
		var setting Settings
		err = rows.Scan(&setting.Key, &setting.Value, &setting.CreatedAt, &setting.UpdatedAt)
		if err != nil {
			return nil, err
		}
		settings = append(settings, setting)
	}
	return settings, nil
}
