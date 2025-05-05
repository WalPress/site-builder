package utils

import (
	"io"
	"os"
	"path/filepath"
	"runtime"
)

func GetUserDataPath(appName string) (string, error) {
	var basePath string

	home, err := os.UserConfigDir()
	configDir := home
	if err != nil {
		return "", err
	}

	if runtime.GOOS == "windows" {
		basePath = os.Getenv("APPDATA")
		if basePath == "" {
			basePath = configDir
		}
	} else {
		basePath = configDir
	}

	path := basePath + "/" + appName
	err = os.MkdirAll(path, 0755)
	return path, err
}

func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, _ := filepath.Rel(src, path)
		destPath := filepath.Join(dst, relPath)

		if info.IsDir() {
			return os.MkdirAll(destPath, info.Mode())
		}

		srcFile, err := os.Open(path)
		if err != nil {
			return err
		}
		defer srcFile.Close()

		destFile, err := os.Create(destPath)
		if err != nil {
			return err
		}
		defer destFile.Close()

		_, err = io.Copy(destFile, srcFile)
		if err != nil {
			return err
		}

		return os.Chmod(destPath, info.Mode())
	})
}
