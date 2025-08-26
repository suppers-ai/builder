package storage

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/volatiletech/authboss/v3"
	"github.com/suppers-ai/auth/models"
	"github.com/suppers-ai/database"
)

type PostgresStorage struct {
	db database.Database
}

func NewPostgresStorage(db database.Database) *PostgresStorage {
	return &PostgresStorage{db: db}
}

func (s *PostgresStorage) Load(ctx context.Context, key string) (authboss.User, error) {
	user := &models.User{}
	
	// Check if key is a valid UUID (for ID lookup) or email
	var query string
	var args []interface{}
	
	// Simple check - UUIDs have dashes, emails have @
	if strings.Contains(key, "@") {
		// It's an email
		query = `SELECT * FROM auth.users WHERE email = $1 LIMIT 1`
		args = []interface{}{key}
	} else {
		// Try as ID first, then email as fallback
		query = `SELECT * FROM auth.users WHERE id = $1 OR email = $2 LIMIT 1`
		args = []interface{}{key, key}
	}
	
	err := s.db.Get(ctx, user, query, args...)
	if err != nil {
		if err == database.ErrNoRows {
			return nil, authboss.ErrUserNotFound
		}
		return nil, err
	}
	return user, nil
}

func (s *PostgresStorage) Save(ctx context.Context, user authboss.User) error {
	u := user.(*models.User)
	u.UpdatedAt = time.Now()
	
	query := `
		UPDATE auth.users SET
			email = :email,
			password = :password,
			username = :username,
			role = :role,
			confirmed = :confirmed,
			confirm_token = :confirm_token,
			confirm_selector = :confirm_selector,
			recover_token = :recover_token,
			recover_token_exp = :recover_token_exp,
			recover_selector = :recover_selector,
			totp_secret = :totp_secret,
			totp_secret_backup = :totp_secret_backup,
			sms_phone_number = :sms_phone_number,
			recovery_codes = :recovery_codes,
			oauth2_uid = :oauth2_uid,
			oauth2_provider = :oauth2_provider,
			oauth2_token = :oauth2_token,
			oauth2_refresh = :oauth2_refresh,
			oauth2_expiry = :oauth2_expiry,
			locked = :locked,
			attempt_count = :attempt_count,
			last_attempt = :last_attempt,
			metadata = :metadata,
			updated_at = :updated_at
		WHERE id = :id`
	
	_, err := s.db.NamedExec(ctx, query, u)
	return err
}

func (s *PostgresStorage) Create(ctx context.Context, user authboss.User) error {
	u := user.(*models.User)
	if u.ID == "" {
		u.ID = generateUUID()
	}
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()
	
	query := `
		INSERT INTO auth.users (
			id, email, password, username, role, confirmed,
			confirm_token, confirm_selector,
			recover_token, recover_token_exp, recover_selector,
			totp_secret, totp_secret_backup, sms_phone_number, recovery_codes,
			oauth2_uid, oauth2_provider, oauth2_token, oauth2_refresh, oauth2_expiry,
			locked, attempt_count, last_attempt, metadata,
			created_at, updated_at
		) VALUES (
			:id, :email, :password, :username, :role, :confirmed,
			:confirm_token, :confirm_selector,
			:recover_token, :recover_token_exp, :recover_selector,
			:totp_secret, :totp_secret_backup, :sms_phone_number, :recovery_codes,
			:oauth2_uid, :oauth2_provider, :oauth2_token, :oauth2_refresh, :oauth2_expiry,
			:locked, :attempt_count, :last_attempt, :metadata,
			:created_at, :updated_at
		)`
	
	_, err := s.db.NamedExec(ctx, query, u)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

func (s *PostgresStorage) LoadByConfirmSelector(ctx context.Context, selector string) (authboss.ConfirmableUser, error) {
	user := &models.User{}
	query := `SELECT * FROM auth.users WHERE confirm_selector = $1 LIMIT 1`
	err := s.db.Get(ctx, user, query, selector)
	if err != nil {
		if err == database.ErrNoRows {
			return nil, authboss.ErrUserNotFound
		}
		return nil, err
	}
	return user, nil
}

func (s *PostgresStorage) LoadByRecoverSelector(ctx context.Context, selector string) (authboss.RecoverableUser, error) {
	user := &models.User{}
	query := `SELECT * FROM auth.users WHERE recover_selector = $1 LIMIT 1`
	err := s.db.Get(ctx, user, query, selector)
	if err != nil {
		if err == database.ErrNoRows {
			return nil, authboss.ErrUserNotFound
		}
		return nil, err
	}
	return user, nil
}

func (s *PostgresStorage) AddRememberToken(ctx context.Context, pid, token string) error {
	query := `
		INSERT INTO auth.remember_tokens (user_id, token, created_at, expires_at)
		VALUES ($1, $2, $3, $4)`
	
	_, err := s.db.Exec(ctx, query, pid, token, time.Now(), time.Now().Add(30*24*time.Hour))
	return err
}

func (s *PostgresStorage) DelRememberTokens(ctx context.Context, pid string) error {
	query := `DELETE FROM auth.remember_tokens WHERE user_id = $1`
	_, err := s.db.Exec(ctx, query, pid)
	return err
}

func (s *PostgresStorage) UseRememberToken(ctx context.Context, pid, token string) error {
	tx, err := s.db.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	var exists bool
	checkQuery := `
		SELECT EXISTS(
			SELECT 1 FROM auth.remember_tokens 
			WHERE user_id = $1 AND token = $2 AND expires_at > NOW()
		)`
	
	err = tx.Get(ctx, &exists, checkQuery, pid, token)
	if err != nil {
		return err
	}
	
	if !exists {
		return authboss.ErrTokenNotFound
	}
	
	deleteQuery := `DELETE FROM auth.remember_tokens WHERE user_id = $1 AND token = $2`
	_, err = tx.Exec(ctx, deleteQuery, pid, token)
	if err != nil {
		return err
	}
	
	return tx.Commit()
}

func (s *PostgresStorage) NewFromOAuth2(ctx context.Context, provider string, details map[string]string) (authboss.OAuth2User, error) {
	user := &models.User{
		ID:             generateUUID(),
		Email:          details["email"],
		OAuth2UID:      sql.NullString{String: details["uid"], Valid: true},
		OAuth2Provider: sql.NullString{String: provider, Valid: true},
		Confirmed:      true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	
	if username, ok := details["name"]; ok {
		user.Username = sql.NullString{String: username, Valid: true}
	}
	
	return user, nil
}

func (s *PostgresStorage) SaveOAuth2(ctx context.Context, user authboss.OAuth2User) error {
	u := user.(*models.User)
	
	if u.ID == "" {
		return s.Create(ctx, u)
	}
	return s.Save(ctx, u)
}

func generateUUID() string {
	return uuid.New().String()
}