package utils

import (
	"archive/tar"
	"compress/gzip"
	"io"
	"os"
	"path/filepath"
	"runtime"
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

	return filepath.Join(userDataPath, DB_PATH), nil
}

// extractFileFromTarGz extracts a specific file from a .tar.gz archive to a destination path.
// func extractFileFromTarGz(gzipStreamPath string, targetFileInArchive string, finalDestinationPath string) error {
// 	gzipFile, err := os.Open(gzipStreamPath)
// 	if err != nil {
// 		return fmt.Errorf("failed to open gzip stream %s: %w", gzipStreamPath, err)
// 	}
// 	defer gzipFile.Close()

// 	uncompressedStream, err := gzip.NewReader(gzipFile)
// 	if err != nil {
// 		return fmt.Errorf("failed to create gzip reader for %s: %w", gzipStreamPath, err)
// 	}
// 	defer uncompressedStream.Close()

// 	tarReader := tar.NewReader(uncompressedStream)

// 	for {
// 		header, err := tarReader.Next()
// 		if err == io.EOF {
// 			break // End of archive
// 		}
// 		if err != nil {
// 			return fmt.Errorf("failed to read tar header: %w", err)
// 		}

// 		// Normalize path separators for comparison
// 		if filepath.ToSlash(header.Name) == filepath.ToSlash(targetFileInArchive) {
// 			if header.Typeflag == tar.TypeReg { // Is a regular file
// 				outFile, err := os.Create(finalDestinationPath)
// 				if err != nil {
// 					return fmt.Errorf("failed to create target file %s: %w", finalDestinationPath, err)
// 				}
// 				// Using a variable to capture io.Copy error to handle outFile.Close() correctly
// 				var copyErr error
// 				func() {
// 					defer outFile.Close()
// 					_, copyErr = io.Copy(outFile, tarReader)
// 				}()
// 				if copyErr != nil {
// 					return fmt.Errorf("failed to copy content to target file %s: %w", finalDestinationPath, copyErr)
// 				}
// 				return nil // File found and extracted
// 			} else {
// 				return fmt.Errorf("target path %s in archive is not a regular file (type: %c)", targetFileInArchive, header.Typeflag)
// 			}
// 		}
// 	}
// 	return fmt.Errorf("target file %s not found in tar.gz archive %s", targetFileInArchive, gzipStreamPath)
// }

// // extractFileFromZip extracts a specific file from a .zip archive to a destination path.
// func extractFileFromZip(zipFilePath string, targetFileInArchive string, finalDestinationPath string) error {
// 	r, err := zip.OpenReader(zipFilePath)
// 	if err != nil {
// 		return fmt.Errorf("failed to open zip file %s: %w", zipFilePath, err)
// 	}
// 	defer r.Close()

// 	for _, f := range r.File {
// 		// Normalize path separators for comparison
// 		if filepath.ToSlash(f.Name) == filepath.ToSlash(targetFileInArchive) {
// 			if f.FileInfo().IsDir() {
// 				return fmt.Errorf("target path %s in archive is a directory, not a file", targetFileInArchive)
// 			}

// 			rc, err := f.Open()
// 			if err != nil {
// 				return fmt.Errorf("failed to open file %s in zip: %w", f.Name, err)
// 			}

// 			outFile, err := os.Create(finalDestinationPath)
// 			if err != nil {
// 				rc.Close() // Close source file before returning
// 				return fmt.Errorf("failed to create target file %s: %w", finalDestinationPath, err)
// 			}

// 			var copyErr error
// 			// Scope to manage closing rc and outFile
// 			func() {
// 				defer rc.Close()
// 				defer outFile.Close()
// 				_, copyErr = io.Copy(outFile, rc)
// 			}()

// 			if copyErr != nil {
// 				return fmt.Errorf("failed to copy content to target file %s from zip entry %s: %w", finalDestinationPath, f.Name, copyErr)
// 			}
// 			return nil // File found and extracted
// 		}
// 	}
// 	return fmt.Errorf("target file %s not found in zip archive %s", targetFileInArchive, zipFilePath)
// }

// Helper function to check for ".." sequences (basic path traversal prevention)
func ContainsDotDot(s string) bool {
	for i := 0; i+1 < len(s); i++ {
		if s[i] == '.' && s[i+1] == '.' {
			return true
		}
	}
	return false
}
