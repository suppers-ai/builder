package models

import (
	"time"
)

type User struct {
	ID        string     `gorm:"primaryKey" json:"id"`
	Email     string     `gorm:"uniqueIndex;not null" json:"email"`
	Password  string     `gorm:"not null" json:"-"`
	Role      string     `gorm:"default:'user'" json:"role"`
	Confirmed bool       `gorm:"default:false" json:"confirmed"`
	Locked    *time.Time `json:"locked,omitempty"`
	Metadata  string     `gorm:"type:text" json:"metadata,omitempty"` // JSON string for SQLite compatibility
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}