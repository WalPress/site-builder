package site

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Create creates a new site
func Create(db *sql.DB, address string, name string, content string) (uuid.UUID, error) {
	id := uuid.New()
	err := db.QueryRow(
		"INSERT INTO sites (id, address, name, content, published, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
		id.String(), address, name, content, false, "draft",
	).Scan(&id)
	fmt.Println("id", id, err)
	if err != nil {
		return uuid.Nil, err
	}

	return id, nil
}

// Update updates a site
func Update(db *sql.DB, id uuid.UUID, name string, content string) error {
	_, err := db.Exec(
		"UPDATE sites SET name = $1, content = $2, updated_at = $3 WHERE id = $4",
		name, content, time.Now(), id,
	)
	if err != nil {
		return err
	}

	return nil
}

func UpdateSiteStorage(db *sql.DB, id uuid.UUID, objectID string, blobID string) error {
	_, err := db.Exec("UPDATE sites SET object_id = $1, blob_id = $2, published = true, status = 'deployed' WHERE id = $3", objectID, blobID, id)
	if err != nil {
		return err
	}
	return nil
}

// Delete deletes a site
func Delete(db *sql.DB, id uuid.UUID) error {
	_, err := db.Exec("DELETE FROM sites WHERE id = $1", id)
	if err != nil {
		return err
	}
	return nil
}

// Get gets a site
func Get(db *sql.DB, id uuid.UUID) (Site, error) {
	var s Site
	err := db.QueryRow("SELECT id, name, content, address, published, object_id, blob_id, status, linked, published_at, created_at, updated_at FROM sites WHERE id = $1", id).Scan(&s.ID, &s.Name, &s.Content, &s.Address, &s.Published, &s.ObjectID, &s.BlobID, &s.Status, &s.Linked, &s.PublishedAt, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return Site{}, err
	}

	return s, nil
}

// List lists all sites
func List(db *sql.DB) ([]Site, error) {
	rows, err := db.Query("SELECT id, name, content, address, published, object_id, blob_id, status, linked, published_at, created_at, updated_at FROM sites ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sites []Site
	for rows.Next() {
		var s Site
		if err := rows.Scan(&s.ID, &s.Name, &s.Content, &s.Address, &s.Published, &s.ObjectID, &s.BlobID, &s.Status, &s.Linked, &s.PublishedAt, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		sites = append(sites, s)
	}
	return sites, nil
}

func Publish(db *sql.DB, id uuid.UUID, published bool) error {
	_, err := db.Exec("UPDATE sites SET published = $1 WHERE id = $2", published, id)
	if err != nil {
		return err
	}

	return nil
}
