package services

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/logger"
)

// UsersService handles user-related operations
type UsersService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewUsersService creates a new users service
func NewUsersService(db *gorm.DB, logger logger.Logger) *UsersService {
	return &UsersService{
		db:     db,
		logger: logger,
	}
}

// CreateUser creates a new user
func (s *UsersService) CreateUser(ctx context.Context, email, password string, role models.UserRole) (*models.User, error) {
	user := &models.User{
		Email:     email,
		Password:  password, // Will be hashed in BeforeCreate hook
		Role:      string(role),
		Confirmed: false,
	}

	if err := s.db.WithContext(ctx).Create(user).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, fmt.Errorf("user with email %s already exists", email)
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func (s *UsersService) GetUserByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	err := s.db.WithContext(ctx).Where("id = ?", id).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by email
func (s *UsersService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := s.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}

// UpdateUser updates a user's information
func (s *UsersService) UpdateUser(ctx context.Context, id uuid.UUID, updates map[string]interface{}) error {
	// Validate role if it's being updated
	if role, ok := updates["role"]; ok {
		if !isValidRole(role.(string)) {
			return fmt.Errorf("invalid role: %s", role)
		}
	}

	// Hash password if it's being updated
	if password, ok := updates["password"]; ok {
		hashed, err := bcrypt.GenerateFromPassword([]byte(password.(string)), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password: %w", err)
		}
		updates["password"] = string(hashed)
	}

	result := s.db.WithContext(ctx).Model(&models.User{}).Where("id = ?", id).Updates(updates)
	if result.Error != nil {
		return fmt.Errorf("failed to update user: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// DeleteUser soft deletes a user
func (s *UsersService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	result := s.db.WithContext(ctx).Delete(&models.User{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete user: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("user not found")
	}
	return nil
}

// ListUsers lists users with pagination
func (s *UsersService) ListUsers(ctx context.Context, offset, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Get total count
	if err := s.db.WithContext(ctx).Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	// Get paginated results
	err := s.db.WithContext(ctx).
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&users).Error

	if err != nil {
		return nil, 0, fmt.Errorf("failed to list users: %w", err)
	}

	return users, total, nil
}

// AuthenticateUser verifies user credentials
func (s *UsersService) AuthenticateUser(ctx context.Context, email, password string) (*models.User, error) {
	user, err := s.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	if !user.CheckPassword(password) {
		// Update failed attempt count
		s.db.WithContext(ctx).Model(user).Updates(map[string]interface{}{
			"attempt_count": gorm.Expr("attempt_count + ?", 1),
			"last_attempt":  time.Now(),
		})
		return nil, fmt.Errorf("invalid credentials")
	}

	// Check if account is locked
	if user.Locked != nil && user.Locked.After(time.Now()) {
		return nil, fmt.Errorf("account is locked")
	}

	// Check if email is confirmed
	if !user.Confirmed {
		return nil, fmt.Errorf("email not confirmed")
	}

	// Reset attempt count on successful login
	s.db.WithContext(ctx).Model(user).Updates(map[string]interface{}{
		"attempt_count": 0,
		"last_attempt":  nil,
	})

	return user, nil
}

// LockUser locks a user account
func (s *UsersService) LockUser(ctx context.Context, id uuid.UUID, duration time.Duration) error {
	lockUntil := time.Now().Add(duration)
	return s.UpdateUser(ctx, id, map[string]interface{}{
		"locked": lockUntil,
	})
}

// UnlockUser unlocks a user account
func (s *UsersService) UnlockUser(ctx context.Context, id uuid.UUID) error {
	return s.UpdateUser(ctx, id, map[string]interface{}{
		"locked":        nil,
		"attempt_count": 0,
	})
}

// ConfirmEmail confirms a user's email
func (s *UsersService) ConfirmEmail(ctx context.Context, id uuid.UUID) error {
	return s.UpdateUser(ctx, id, map[string]interface{}{
		"confirmed":        true,
		"confirm_token":    nil,
		"confirm_selector": nil,
	})
}

// CreatePasswordResetToken creates a password reset token
func (s *UsersService) CreatePasswordResetToken(ctx context.Context, email string) (*models.Token, error) {
	user, err := s.GetUserByEmail(ctx, email)
	if err != nil {
		// Don't reveal whether user exists
		return nil, nil
	}

	// Generate secure random token
	tokenValue := generateSecureToken(32)

	token := &models.Token{
		UserID:    user.ID,
		Token:     tokenValue,
		Type:      "password_reset",
		ExpiresAt: time.Now().Add(time.Hour), // 1 hour expiry
	}

	if err := s.db.WithContext(ctx).Create(token).Error; err != nil {
		return nil, fmt.Errorf("failed to create reset token: %w", err)
	}

	return token, nil
}

// ResetPassword resets a user's password using a token
func (s *UsersService) ResetPassword(ctx context.Context, token, newPassword string) error {
	var tokenRecord models.Token
	err := s.db.WithContext(ctx).
		Where("token = ? AND type = ? AND expires_at > ? AND used_at IS NULL", 
			token, "password_reset", time.Now()).
		First(&tokenRecord).Error

	if err != nil {
		return fmt.Errorf("invalid or expired token")
	}

	// Update password
	if err := s.UpdateUser(ctx, tokenRecord.UserID, map[string]interface{}{
		"password": newPassword,
	}); err != nil {
		return err
	}

	// Mark token as used
	now := time.Now()
	tokenRecord.UsedAt = &now
	s.db.WithContext(ctx).Save(&tokenRecord)

	return nil
}

// Helper functions
func isValidRole(role string) bool {
	validRoles := []models.UserRole{
		models.RoleUser,
		models.RoleManager,
		models.RoleAdmin,
		models.RoleDeleted,
	}
	for _, r := range validRoles {
		if string(r) == role {
			return true
		}
	}
	return false
}

// generateSecureToken generates a cryptographically secure random token
func generateSecureToken(length int) string {
	// Create a byte slice to hold the random data
	bytes := make([]byte, length)
	
	// Read random bytes from crypto/rand
	if _, err := rand.Read(bytes); err != nil {
		// Fallback to UUID if crypto/rand fails (shouldn't happen)
		return uuid.New().String()
	}
	
	// Encode to URL-safe base64 string
	// This ensures the token is safe to use in URLs and doesn't contain special characters
	return base64.URLEncoding.EncodeToString(bytes)
}

// ListUsersInfo returns user information for UI display
func (s *UsersService) ListUsersInfo(ctx context.Context, offset, limit int) ([]UserInfo, int64, error) {
	users, total, err := s.ListUsers(ctx, offset, limit)
	if err != nil {
		return nil, 0, err
	}
	
	infos := make([]UserInfo, len(users))
	for i, user := range users {
		infos[i] = UserInfo{
			ID:          user.ID.String(),
			Email:       user.Email,
			Role:        user.Role,
			Confirmed:   user.Confirmed,
			CreatedAt:   user.CreatedAt,
			UpdatedAt:   user.UpdatedAt,
			LastLoginAt: nil, // Not tracked in current model
		}
	}
	
	return infos, total, nil
}

// UpdateUserRole updates a user's role
func (s *UsersService) UpdateUserRole(ctx context.Context, id uuid.UUID, role UserRole) error {
	return s.UpdateUser(ctx, id, map[string]interface{}{
		"role": string(role),
	})
}

// SendPasswordResetEmail sends a password reset email to the user
func (s *UsersService) SendPasswordResetEmail(ctx context.Context, email string) error {
	token, err := s.CreatePasswordResetToken(ctx, email)
	if err != nil {
		return err
	}
	
	// TODO: Send email with token
	// This would integrate with the mailer service
	s.logger.Info(ctx, "Password reset token created", 
		logger.String("email", email),
		logger.String("token", token.Token))
	
	return nil
}