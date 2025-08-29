package models

import (
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserRole represents user roles
type UserRole string

const (
	RoleUser    UserRole = "user"
	RoleManager UserRole = "manager"
	RoleAdmin   UserRole = "admin"
	RoleDeleted UserRole = "deleted"
)

// User represents a user account
type User struct {
	ID               uuid.UUID  `gorm:"type:char(36);primary_key" json:"id"`
	Email            string     `gorm:"uniqueIndex;not null;size:255" json:"email"`
	Password         string     `gorm:"not null" json:"-"` // Never expose in JSON
	Username         string     `gorm:"size:255" json:"username,omitempty"`
	Role             string     `gorm:"not null;default:'user';size:50" json:"role"`
	Confirmed        bool       `gorm:"default:false" json:"confirmed"`
	ConfirmToken     *string    `gorm:"size:255" json:"-"`
	ConfirmSelector  *string    `gorm:"size:255;index" json:"-"`
	RecoverToken     *string    `gorm:"size:255" json:"-"`
	RecoverTokenExp  *time.Time `json:"-"`
	RecoverSelector  *string    `gorm:"size:255;index" json:"-"`
	Locked           *time.Time `json:"locked,omitempty"`
	AttemptCount     int        `gorm:"default:0" json:"-"`
	LastAttempt      *time.Time `json:"-"`
	Metadata         JSON       `gorm:"type:text" json:"metadata,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	DeletedAt        *time.Time `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Sessions []Session `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Objects  []Object  `gorm:"foreignKey:UserID;constraint:OnDelete:SET NULL" json:"-"`
	Tokens   []Token   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName specifies the table name
func (User) TableName() string {
	return "auth_users"
}

// BeforeCreate hook
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	
	// Hash password if it's plain text
	if u.Password != "" && !isHashed(u.Password) {
		hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashed)
	}
	
	// Set default role
	if u.Role == "" {
		u.Role = string(RoleUser)
	}
	
	return nil
}

// BeforeUpdate hook
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	// Hash password if it changed and is plain text
	if tx.Statement.Changed("Password") && u.Password != "" && !isHashed(u.Password) {
		hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashed)
	}
	return nil
}

// CheckPassword verifies a password
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// Session represents a user session
type Session struct {
	ID        uuid.UUID `gorm:"type:char(36);primary_key" json:"id"`
	UserID    uuid.UUID `gorm:"type:char(36);not null;index" json:"user_id"`
	Token     string    `gorm:"uniqueIndex;not null;size:255" json:"token"`
	Data      []byte    `json:"-"`
	ExpiresAt time.Time `gorm:"not null;index" json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"-"`
}

// TableName specifies the table name
func (Session) TableName() string {
	return "auth_sessions"
}

// BeforeCreate hook
func (s *Session) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// Token represents various auth tokens
type Token struct {
	ID        uuid.UUID `gorm:"type:char(36);primary_key" json:"id"`
	UserID    uuid.UUID `gorm:"type:char(36);not null;index" json:"user_id"`
	Token     string    `gorm:"uniqueIndex;not null;size:255" json:"token"`
	Type      string    `gorm:"not null;size:50;index" json:"type"` // reset, confirm, etc.
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	UsedAt    *time.Time `json:"used_at,omitempty"`
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"-"`
}

// TableName specifies the table name
func (Token) TableName() string {
	return "auth_tokens"
}

// BeforeCreate hook
func (t *Token) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

// Helper function to check if password is already hashed
func isHashed(password string) bool {
	// BCrypt hashes start with $2a$, $2b$, or $2y$
	return len(password) >= 4 && password[0] == '$' && password[1] == '2'
}