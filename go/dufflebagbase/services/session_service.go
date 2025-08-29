package services

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/suppers-ai/auth"
	"github.com/suppers-ai/logger"
)

// SessionService handles session management
type SessionService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewSessionService creates a new session service
func NewSessionService(db *gorm.DB, logger logger.Logger) *SessionService {
	return &SessionService{
		db:     db,
		logger: logger,
	}
}

// CreateSession creates a new session for a user
func (s *SessionService) CreateSession(ctx context.Context, userID uuid.UUID) (*auth.Session, error) {
	// Generate a secure random session ID
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return nil, fmt.Errorf("failed to generate session ID: %w", err)
	}
	sessionID := base64.URLEncoding.EncodeToString(b)

	// Generate a secure token
	if _, err := rand.Read(b); err != nil {
		return nil, fmt.Errorf("failed to generate session token: %w", err)
	}
	token := base64.URLEncoding.EncodeToString(b)

	// Create session
	session := &auth.Session{
		ID:        sessionID,
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(24 * time.Hour), // 24 hour expiry
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.db.WithContext(ctx).Create(session).Error; err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	return session, nil
}

// GetSession retrieves a session by ID
func (s *SessionService) GetSession(ctx context.Context, sessionID string) (*auth.Session, error) {
	var session auth.Session
	err := s.db.WithContext(ctx).
		Where("id = ? AND expires_at > ?", sessionID, time.Now()).
		First(&session).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("session not found or expired")
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	return &session, nil
}

// GetSessionByToken retrieves a session by token
func (s *SessionService) GetSessionByToken(ctx context.Context, token string) (*auth.Session, error) {
	var session auth.Session
	err := s.db.WithContext(ctx).
		Where("token = ? AND expires_at > ?", token, time.Now()).
		First(&session).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("session not found or expired")
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	return &session, nil
}

// DeleteSession deletes a session
func (s *SessionService) DeleteSession(ctx context.Context, sessionID string) error {
	result := s.db.WithContext(ctx).Delete(&auth.Session{}, "id = ?", sessionID)
	if result.Error != nil {
		return fmt.Errorf("failed to delete session: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("session not found")
	}
	return nil
}

// CleanExpiredSessions removes expired sessions
func (s *SessionService) CleanExpiredSessions(ctx context.Context) (int64, error) {
	result := s.db.WithContext(ctx).Delete(&auth.Session{}, "expires_at < ?", time.Now())
	if result.Error != nil {
		return 0, fmt.Errorf("failed to clean expired sessions: %w", result.Error)
	}
	return result.RowsAffected, nil
}