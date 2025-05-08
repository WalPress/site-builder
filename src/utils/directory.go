package utils

import (
	"archive/tar"
	"compress/gzip"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

const (
	APP_NAME          = "walpress"
	TOOLS_PATH        = "tools"
	SUI_PATH          = "sui"
	SITE_BUILDER_PATH = "site-builder"
	WALRUS_PATH       = "walrus"
	CONFIG_PATH       = "config"
	SITE_PATH         = "sites-data"
	DB_PATH           = "db"
	DB_FILE           = "db.sqlite"
	IS_AUTHENTICATED  = "is_authenticated"
	ACTIVE_NETWORK    = "active_network"
	ACTIVE_ADDRESS    = "active_address"
)

func GetUserDataPath() (string, error) {
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

	path := basePath + "/" + APP_NAME
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

func FileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir() && info.Mode()&0111 != 0 // file is executable
}

// extractTGZ extracts a .tgz archive to a specified destination directory.
func ExtractTGZ(tgzPath, destDir string) error {
	// Open .tgz file
	f, err := os.Open(tgzPath)
	if err != nil {
		return err
	}
	defer f.Close()

	// Wrap with gzip reader
	gzr, err := gzip.NewReader(f)
	if err != nil {
		return err
	}
	defer gzr.Close()

	// Create tar reader
	tr := tar.NewReader(gzr)

	// Extract files
	for {
		header, err := tr.Next()
		if err == io.EOF {
			break // End of archive
		}
		if err != nil {
			return err
		}

		// Construct target path
		target := filepath.Join(destDir, header.Name)

		switch header.Typeflag {
		case tar.TypeDir:
			os.MkdirAll(target, os.FileMode(header.Mode))
		case tar.TypeReg:
			if err := os.MkdirAll(filepath.Dir(target), 0755); err != nil {
				return err
			}
			outFile, err := os.Create(target)
			if err != nil {
				return err
			}
			if _, err := io.Copy(outFile, tr); err != nil {
				outFile.Close()
				return err
			}
			outFile.Chmod(os.FileMode(header.Mode))
			outFile.Close()
		}
	}
	return nil
}

func GetToolsPath() (string, error) {
	userDataPath, err := GetUserDataPath()
	if err != nil {
		return "", err
	}

	return filepath.Join(userDataPath, TOOLS_PATH), nil
}

func GetSuiPath() (string, error) {
	toolsPath, err := GetToolsPath()
	if err != nil {
		return "", err
	}

	return filepath.Join(toolsPath, SUI_PATH), nil
}

func GetSiteBuilderPath() (string, error) {
	toolsPath, err := GetToolsPath()
	if err != nil {
		return "", err
	}

	return filepath.Join(toolsPath, SITE_BUILDER_PATH), nil
}

func GetWalrusPath() (string, error) {
	toolsPath, err := GetToolsPath()
	if err != nil {
		return "", err
	}

	return filepath.Join(toolsPath, WALRUS_PATH), nil
}

func GetSitePath() (string, error) {
	userDataPath, err := GetUserDataPath()
	if err != nil {
		return "", err
	}

	return filepath.Join(userDataPath, SITE_PATH), nil
}

func GetConfigPath() (string, error) {
	userDataPath, err := GetUserDataPath()
	if err != nil {
		return "", err
	}

	return filepath.Join(userDataPath, CONFIG_PATH), nil
}

func GetDBPath() (string, error) {
	userDataPath, err := GetUserDataPath()
	if err != nil {
		return "", err
	}
	dbPath := filepath.Join(userDataPath, DB_PATH)
	err = os.MkdirAll(dbPath, 0755)
	if err != nil {
		return "", err
	}
	return dbPath, nil
}

// Helper function to check for ".." sequences (basic path traversal prevention)
func ContainsDotDot(s string) bool {
	for i := 0; i+1 < len(s); i++ {
		if s[i] == '.' && s[i+1] == '.' {
			return true
		}
	}
	return false
}

func EscapePathForShell(path string) string {
	return strings.ReplaceAll(path, " ", `\ `)
}

func GetFileSize(path string) (int64, error) {
	info, err := os.Stat(path)
	if err != nil {
		return 0, err
	}
	return info.Size(), nil
}
