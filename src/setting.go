package src

import (
	"cli-runner/src/settings"
)

type SettingRequest struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// GetSetting gets a setting
func (a *App) GetSetting(key string) (string, error) {
	value, err := settings.Get(a.db, key)
	if err != nil {
		return "", err
	}
	return value, nil
}

// SetSettings sets a setting
func (a *App) SetSettings(settingsData []SettingRequest) error {
	for _, setting := range settingsData {
		err := settings.CreateOrUpdate(a.db, setting.Key, setting.Value)
		if err != nil {
			return err
		}
	}
	return nil
}

// ListSettings lists all settings
func (a *App) ListSettings() ([]settings.Settings, error) {
	return settings.List(a.db)
}
