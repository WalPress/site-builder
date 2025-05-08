package site

import (
	"time"

	"github.com/google/uuid"
)

type Site struct {
	Address     string    `json:"address"`
	ID          uuid.UUID `json:"id"`
	BlobID      string    `json:"blob_id" default:""`
	ObjectID    string    `json:"object_id" default:""`
	Name        string    `json:"name"`
	Content     string    `json:"content"`
	Status      string    `json:"status" default:"draft"`
	Published   bool      `json:"published" default:"false"`
	PublishedAt time.Time `json:"published_at" default:"null"`
	Linked      bool      `json:"linked" default:"false"`
	LinkedAt    time.Time `json:"linked_at" default:"null"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
