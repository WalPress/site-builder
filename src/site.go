package src

import (
	"cli-runner/src/site"
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// uploadSession stores information about an ongoing chunked upload
type uploadSession struct {
	SiteID         uuid.UUID
	TargetFileName string
	TempFilePath   string
	FileHandle     *os.File
	Started        time.Time // For potential cleanup logic
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) ListSites() ([]site.Site, error) {
	return site.List(a.db)
}

func (a *App) GetSite(id uuid.UUID) (site.Site, error) {
	return site.Get(a.db, id)
}

func (a *App) CreateSite(address string, name string, content string) (uuid.UUID, error) {
	// 1. Create the site record in the database
	siteID, err := site.Create(a.db, address, name, content)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to create site record: %v", err))
		return uuid.Nil, fmt.Errorf("failed to create site record: %w", err)
	}

	// 2. Determine the base path for site assets
	configDir, err := os.UserConfigDir()
	if err != nil {
		// Log the error and potentially return it, preventing file creation
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to get user config directory: %v", err))
		// Return the siteID but indicate the file part failed? Or return the error fully?
		// Returning the error seems safer, as the site isn't fully set up.
		return siteID, fmt.Errorf("failed to get user config directory: %w", err)
	}
	baseAssetPath := filepath.Join(configDir, "walpress", "sites-data")

	// 3. Create the site-specific asset folder using the site's UUID
	siteAssetPath := filepath.Join(baseAssetPath, siteID.String())
	err = os.MkdirAll(siteAssetPath, 0755) // Create nested dirs if needed, rwxr-xr-x permissions
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to create asset directory '%s': %v", siteAssetPath, err))
		// DB record exists, but folder creation failed. Return error.
		return siteID, fmt.Errorf("failed to create asset directory '%s': %w", siteAssetPath, err)
	}

	// 4. Generate index.html in the asset folder from the content
	indexPath := filepath.Join(siteAssetPath, "index.html")
	// Write the content string as bytes to the file, rw-r--r-- permissions
	err = os.WriteFile(indexPath, []byte(content), 0644)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to write index.html to '%s': %v", indexPath, err))
		// DB record and folder exist, but file writing failed. Return error.
		return siteID, fmt.Errorf("failed to write index.html to '%s': %w", indexPath, err)
	}

	runtime.LogInfo(a.ctx, fmt.Sprintf("Successfully created site record and assets for site %s at %s", siteID, siteAssetPath))
	return siteID, nil
}

// UpdateSite updates the site record and regenerates its index.html file.
func (a *App) UpdateSite(id uuid.UUID, name string, content string) error {
	// 1. Update the site record in the database
	err := site.Update(a.db, id, name, content)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to update site record for ID %s: %v", id, err))
		return fmt.Errorf("failed to update site record: %w", err)
	}

	// 2. Determine the base path for site assets
	configDir, err := os.UserConfigDir()
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to get user config directory while updating site %s: %v", id, err))
		// DB was updated, but we can't update files. Return the error.
		return fmt.Errorf("failed to get user config directory: %w", err)
	}
	baseAssetPath := filepath.Join(configDir, "walpress", "sites-data")

	// 3. Ensure the site-specific asset folder exists
	siteAssetPath := filepath.Join(baseAssetPath, id.String())
	err = os.MkdirAll(siteAssetPath, 0755) // Ensure directory exists, creates if not
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to ensure asset directory '%s' exists for site %s: %v", siteAssetPath, id, err))
		// DB was updated, but we can't update files. Return the error.
		return fmt.Errorf("failed to ensure asset directory '%s' exists: %w", siteAssetPath, err)
	}

	// 4. Regenerate index.html in the asset folder with the new content
	indexPath := filepath.Join(siteAssetPath, "index.html")
	err = os.WriteFile(indexPath, []byte(content), 0644) // Overwrite or create index.html
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to write updated index.html to '%s' for site %s: %v", indexPath, id, err))
		// DB was updated, folder exists, but file writing failed. Return error.
		return fmt.Errorf("failed to write updated index.html to '%s': %w", indexPath, err)
	}

	runtime.LogInfo(a.ctx, fmt.Sprintf("Successfully updated site record and regenerated index.html for site %s", id))
	return nil
}

// DeleteSite removes the site's asset folder and then its database record.
func (a *App) DeleteSite(id uuid.UUID) error {
	// 1. Determine the path for site assets
	configDir, err := os.UserConfigDir()
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to get user config directory while deleting site %s: %v", id, err))
		// Cannot determine path, cannot delete folder. Stop before deleting DB record.
		return fmt.Errorf("failed to get user config directory: %w", err)
	}
	baseAssetPath := filepath.Join(configDir, "walpress", "sites-data")
	siteAssetPath := filepath.Join(baseAssetPath, id.String())

	// 2. Delete the site's asset folder
	runtime.LogInfof(a.ctx, "Attempting to delete asset folder: %s", siteAssetPath)
	err = os.RemoveAll(siteAssetPath)
	if err != nil {
		// Check if the error is because the path doesn't exist, which is not a failure case here.
		if !os.IsNotExist(err) {
			runtime.LogError(a.ctx, fmt.Sprintf("Failed to delete asset directory '%s' for site %s: %v", siteAssetPath, id, err))
			// Failed to delete folder. Stop before deleting DB record.
			return fmt.Errorf("failed to delete asset directory '%s': %w", siteAssetPath, err)
		} else {
			runtime.LogInfof(a.ctx, "Asset folder '%s' did not exist, proceeding with DB deletion.", siteAssetPath)
		}
	} else {
		runtime.LogInfof(a.ctx, "Successfully deleted asset folder: %s", siteAssetPath)
	}

	// 3. Delete the site record from the database
	runtime.LogInfof(a.ctx, "Attempting to delete database record for site ID: %s", id)
	err = site.Delete(a.db, id)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to delete site record for ID %s: %v", id, err))
		// Folder might have been deleted, but DB deletion failed.
		return fmt.Errorf("failed to delete site record: %w", err)
	}

	runtime.LogInfo(a.ctx, fmt.Sprintf("Successfully deleted site %s (record and assets).", id))
	return nil
}

// Helper function to check for ".." sequences (basic path traversal prevention)
func containsDotDot(s string) bool {
	for i := 0; i+1 < len(s); i++ {
		if s[i] == '.' && s[i+1] == '.' {
			return true
		}
	}
	return false
}

// StartUpload initializes a chunked file upload process
func (a *App) StartUpload(siteID uuid.UUID, targetFileName string) (string, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.activeUploads == nil {
		a.activeUploads = make(map[string]*uploadSession)
		runtime.LogWarning(a.ctx, "activeUploads map was nil, initialized on first use.")
	}

	runtime.LogInfof(a.ctx, "Starting upload for site '%s', target '%s'", siteID, targetFileName)

	// 1. Validate inputs
	if targetFileName == "" {
		return "", fmt.Errorf("target file name cannot be empty")
	}
	if filepath.IsAbs(targetFileName) || containsDotDot(targetFileName) {
		return "", fmt.Errorf("invalid target file name: %s", targetFileName)
	}

	// 2. Generate unique upload ID and temporary file path
	uploadID := uuid.NewString()
	tempDir := os.TempDir()
	tempFilePath := filepath.Join(tempDir, fmt.Sprintf("walpress_upload_%s.part", uploadID))

	// 3. Create and open the temporary file
	fileHandle, err := os.Create(tempFilePath)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to create temp file '%s' for upload %s: %v", tempFilePath, uploadID, err))
		return "", fmt.Errorf("failed to create temporary file: %w", err)
	}

	// 4. Store upload session details
	session := &uploadSession{
		SiteID:         siteID,
		TargetFileName: targetFileName,
		TempFilePath:   tempFilePath,
		FileHandle:     fileHandle,
		Started:        time.Now(),
	}
	a.activeUploads[uploadID] = session

	runtime.LogInfof(a.ctx, "Upload %s started, temp file: %s", uploadID, tempFilePath)
	return uploadID, nil
}

// UploadChunk receives and appends a chunk of data to an ongoing upload
func (a *App) UploadChunk(uploadID string, chunkBase64 string) error {
	runtime.LogInfof(a.ctx, "UploadChunk received for upload ID: %s", uploadID)
	a.mu.Lock()
	if a.activeUploads == nil {
		a.mu.Unlock()
		runtime.LogError(a.ctx, "UploadChunk called but activeUploads map is nil.")
		return fmt.Errorf("upload state not initialized")
	}
	session, exists := a.activeUploads[uploadID]
	a.mu.Unlock()

	if !exists {
		runtime.LogError(a.ctx, fmt.Sprintf("UploadChunk received for unknown upload ID: %s", uploadID))
		return fmt.Errorf("invalid or expired upload ID: %s", uploadID)
	}

	if session.FileHandle == nil {
		runtime.LogError(a.ctx, fmt.Sprintf("UploadChunk received for completed/aborted upload ID: %s", uploadID))
		return fmt.Errorf("upload %s already completed or aborted", uploadID)
	}

	runtime.LogDebugf(a.ctx, "Receiving chunk for upload ID: %s", uploadID)

	// 1. Decode chunk
	decodedChunk, err := base64.StdEncoding.DecodeString(chunkBase64)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to decode base64 chunk for upload %s: %v", uploadID, err))
		return fmt.Errorf("failed to decode base64 chunk: %w", err)
	}

	// 2. Write chunk
	_, err = session.FileHandle.Write(decodedChunk)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to write chunk to temp file '%s' for upload %s: %v", session.TempFilePath, uploadID, err))
		return fmt.Errorf("failed to write chunk to temporary file: %w", err)
	}

	runtime.LogDebugf(a.ctx, "Successfully wrote chunk for upload ID: %s", uploadID)
	return nil
}

// FinishUpload completes the upload process
func (a *App) FinishUpload(uploadID string) (string, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.activeUploads == nil {
		runtime.LogError(a.ctx, "FinishUpload called but activeUploads map is nil.")
		return "", fmt.Errorf("upload state not initialized")
	}

	session, exists := a.activeUploads[uploadID]
	if !exists {
		runtime.LogError(a.ctx, fmt.Sprintf("FinishUpload received for unknown upload ID: %s", uploadID))
		return "", fmt.Errorf("invalid or expired upload ID: %s", uploadID)
	}

	runtime.LogInfof(a.ctx, "Finishing upload %s", uploadID)

	// 1. Close temp file
	if session.FileHandle != nil {
		err := session.FileHandle.Close()
		session.FileHandle = nil // Mark as closed
		if err != nil {
			runtime.LogError(a.ctx, fmt.Sprintf("Error closing temp file '%s' for upload %s: %v", session.TempFilePath, uploadID, err))
		}
	} else {
		runtime.LogWarningf(a.ctx, "FinishUpload called for upload %s, but file handle was already nil.", uploadID)
		return "", fmt.Errorf("upload %s already finished or aborted", uploadID)
	}

	// 2. Determine final destination path
	configDir, err := os.UserConfigDir()
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to get user config directory while finishing upload %s: %v", uploadID, err))
		os.Remove(session.TempFilePath)   // Cleanup temp file
		delete(a.activeUploads, uploadID) // Cleanup map entry
		return "", fmt.Errorf("failed to get user config directory: %w", err)
	}
	baseAssetPath := filepath.Join(configDir, "walpress", "sites-data")
	siteAssetPath := filepath.Join(baseAssetPath, session.SiteID.String())
	destinationPath := filepath.Join(siteAssetPath, session.TargetFileName)

	// 3. Ensure final directory exists
	err = os.MkdirAll(siteAssetPath, 0755)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to ensure final asset directory '%s' exists for upload %s: %v", siteAssetPath, uploadID, err))
		os.Remove(session.TempFilePath)
		delete(a.activeUploads, uploadID)
		return "", fmt.Errorf("failed to ensure final asset directory '%s' exists: %w", siteAssetPath, err)
	}

	// 4. Move temp file
	err = os.Rename(session.TempFilePath, destinationPath)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to move temp file '%s' to final destination '%s' for upload %s: %v", session.TempFilePath, destinationPath, uploadID, err))
		os.Remove(session.TempFilePath)
		delete(a.activeUploads, uploadID)
		return "", fmt.Errorf("failed to move completed file to destination: %w", err)
	}

	// 5. Clean up map
	delete(a.activeUploads, uploadID)

	runtime.LogInfof(a.ctx, "Successfully finished upload %s, file saved to '%s'", uploadID, destinationPath)

	// 6. Return relative path
	return session.TargetFileName, nil
}

// AbortUpload cleans up an incomplete upload
func (a *App) AbortUpload(uploadID string) error {
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.activeUploads == nil {
		runtime.LogWarningf(a.ctx, "AbortUpload called but activeUploads map is nil.")
		return nil // Map not init, nothing to abort
	}

	session, exists := a.activeUploads[uploadID]
	if !exists {
		runtime.LogWarningf(a.ctx, "AbortUpload received for unknown/already completed upload ID: %s", uploadID)
		return nil
	}

	runtime.LogInfof(a.ctx, "Aborting upload %s", uploadID)

	// Close file handle
	if session.FileHandle != nil {
		session.FileHandle.Close()
		session.FileHandle = nil
	}

	// Delete temp file
	err := os.Remove(session.TempFilePath)
	if err != nil && !os.IsNotExist(err) {
		runtime.LogError(a.ctx, fmt.Sprintf("Error deleting temp file '%s' during abort for upload %s: %v", session.TempFilePath, uploadID, err))
	}

	// Remove from map
	delete(a.activeUploads, uploadID)

	runtime.LogInfof(a.ctx, "Upload %s aborted and cleaned up.", uploadID)
	return nil
}
