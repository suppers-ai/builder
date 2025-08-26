package models

import (
	"context"
	"database/sql"
	"time"
)

type User struct {
	ID               string         `db:"id"`
	Email            string         `db:"email"`
	Password         string         `db:"password"`
	Username         sql.NullString `db:"username"`
	Role             sql.NullString `db:"role"`
	Confirmed        bool           `db:"confirmed"`
	ConfirmToken     sql.NullString `db:"confirm_token"`
	ConfirmSelector  sql.NullString `db:"confirm_selector"`
	RecoverToken     sql.NullString `db:"recover_token"`
	RecoverTokenExp  sql.NullTime   `db:"recover_token_exp"`
	RecoverSelector  sql.NullString `db:"recover_selector"`
	TOTPSecret       sql.NullString `db:"totp_secret"`
	TOTPSecretBackup sql.NullString `db:"totp_secret_backup"`
	SMSPhoneNumber   sql.NullString `db:"sms_phone_number"`
	RecoveryCodes    sql.NullString `db:"recovery_codes"`
	OAuth2UID        sql.NullString `db:"oauth2_uid"`
	OAuth2Provider   sql.NullString `db:"oauth2_provider"`
	OAuth2Token      sql.NullString `db:"oauth2_token"`
	OAuth2Refresh    sql.NullString `db:"oauth2_refresh"`
	OAuth2Expiry     sql.NullTime   `db:"oauth2_expiry"`
	Locked           sql.NullTime   `db:"locked"`
	AttemptCount     int            `db:"attempt_count"`
	LastAttempt      sql.NullTime   `db:"last_attempt"`
	Metadata         sql.NullString `db:"metadata"`
	CreatedAt        time.Time      `db:"created_at"`
	UpdatedAt        time.Time      `db:"updated_at"`
}

func (u *User) GetPID() string { return u.ID }
func (u *User) PutPID(id string) { u.ID = id }
func (u *User) GetEmail() string { return u.Email }
func (u *User) PutEmail(email string) { u.Email = email }
func (u *User) GetUsername() string { 
	if u.Username.Valid {
		return u.Username.String
	}
	return ""
}
func (u *User) PutUsername(username string) {
	u.Username = sql.NullString{String: username, Valid: username != ""}
}
func (u *User) GetRole() string {
	if u.Role.Valid {
		return u.Role.String
	}
	return ""
}
func (u *User) PutRole(role string) {
	u.Role = sql.NullString{String: role, Valid: role != ""}
}
func (u *User) GetPassword() string { return u.Password }
func (u *User) PutPassword(password string) { u.Password = password }
func (u *User) GetConfirmed() bool { return u.Confirmed }
func (u *User) PutConfirmed(confirmed bool) { u.Confirmed = confirmed }
func (u *User) GetConfirmSelector() string {
	if u.ConfirmSelector.Valid {
		return u.ConfirmSelector.String
	}
	return ""
}
func (u *User) PutConfirmSelector(selector string) {
	u.ConfirmSelector = sql.NullString{String: selector, Valid: selector != ""}
}
func (u *User) GetConfirmVerifier() string {
	if u.ConfirmToken.Valid {
		return u.ConfirmToken.String
	}
	return ""
}
func (u *User) PutConfirmVerifier(verifier string) {
	u.ConfirmToken = sql.NullString{String: verifier, Valid: verifier != ""}
}
func (u *User) GetRecoverSelector() string {
	if u.RecoverSelector.Valid {
		return u.RecoverSelector.String
	}
	return ""
}
func (u *User) PutRecoverSelector(selector string) {
	u.RecoverSelector = sql.NullString{String: selector, Valid: selector != ""}
}
func (u *User) GetRecoverVerifier() string {
	if u.RecoverToken.Valid {
		return u.RecoverToken.String
	}
	return ""
}
func (u *User) PutRecoverVerifier(verifier string) {
	u.RecoverToken = sql.NullString{String: verifier, Valid: verifier != ""}
}
func (u *User) GetRecoverExpiry() time.Time {
	if u.RecoverTokenExp.Valid {
		return u.RecoverTokenExp.Time
	}
	return time.Time{}
}
func (u *User) PutRecoverExpiry(expiry time.Time) {
	u.RecoverTokenExp = sql.NullTime{Time: expiry, Valid: !expiry.IsZero()}
}
func (u *User) GetTOTPSecretKey() string {
	if u.TOTPSecret.Valid {
		return u.TOTPSecret.String
	}
	return ""
}
func (u *User) PutTOTPSecretKey(secret string) {
	u.TOTPSecret = sql.NullString{String: secret, Valid: secret != ""}
}
func (u *User) GetSMSPhoneNumber() string {
	if u.SMSPhoneNumber.Valid {
		return u.SMSPhoneNumber.String
	}
	return ""
}
func (u *User) PutSMSPhoneNumber(phone string) {
	u.SMSPhoneNumber = sql.NullString{String: phone, Valid: phone != ""}
}
func (u *User) GetRecoveryCodes() string {
	if u.RecoveryCodes.Valid {
		return u.RecoveryCodes.String
	}
	return ""
}
func (u *User) PutRecoveryCodes(codes string) {
	u.RecoveryCodes = sql.NullString{String: codes, Valid: codes != ""}
}
func (u *User) GetOAuth2UID() string {
	if u.OAuth2UID.Valid {
		return u.OAuth2UID.String
	}
	return ""
}
func (u *User) PutOAuth2UID(uid string) {
	u.OAuth2UID = sql.NullString{String: uid, Valid: uid != ""}
}
func (u *User) GetOAuth2Provider() string {
	if u.OAuth2Provider.Valid {
		return u.OAuth2Provider.String
	}
	return ""
}
func (u *User) PutOAuth2Provider(provider string) {
	u.OAuth2Provider = sql.NullString{String: provider, Valid: provider != ""}
}
func (u *User) GetOAuth2AccessToken() string {
	if u.OAuth2Token.Valid {
		return u.OAuth2Token.String
	}
	return ""
}
func (u *User) PutOAuth2AccessToken(token string) {
	u.OAuth2Token = sql.NullString{String: token, Valid: token != ""}
}
func (u *User) GetOAuth2RefreshToken() string {
	if u.OAuth2Refresh.Valid {
		return u.OAuth2Refresh.String
	}
	return ""
}
func (u *User) PutOAuth2RefreshToken(token string) {
	u.OAuth2Refresh = sql.NullString{String: token, Valid: token != ""}
}
func (u *User) GetOAuth2Expiry() time.Time {
	if u.OAuth2Expiry.Valid {
		return u.OAuth2Expiry.Time
	}
	return time.Time{}
}
func (u *User) PutOAuth2Expiry(expiry time.Time) {
	u.OAuth2Expiry = sql.NullTime{Time: expiry, Valid: !expiry.IsZero()}
}
func (u *User) IsOAuth2User() bool {
	return u.OAuth2UID.Valid && u.OAuth2Provider.Valid
}
func (u *User) GetAttemptCount() int { return u.AttemptCount }
func (u *User) PutAttemptCount(count int) { u.AttemptCount = count }
func (u *User) GetLastAttempt() time.Time {
	if u.LastAttempt.Valid {
		return u.LastAttempt.Time
	}
	return time.Time{}
}
func (u *User) PutLastAttempt(attempt time.Time) {
	u.LastAttempt = sql.NullTime{Time: attempt, Valid: !attempt.IsZero()}
}
func (u *User) GetLocked() time.Time {
	if u.Locked.Valid {
		return u.Locked.Time
	}
	return time.Time{}
}
func (u *User) PutLocked(locked time.Time) {
	u.Locked = sql.NullTime{Time: locked, Valid: !locked.IsZero()}
}
func (u *User) GetArbitrary() map[string]string {
	return map[string]string{
		"created_at": u.CreatedAt.Format(time.RFC3339),
		"updated_at": u.UpdatedAt.Format(time.RFC3339),
	}
}
func (u *User) PutArbitrary(values map[string]string) {}

type RememberToken struct {
	ID        int       `db:"id"`
	UserID    string    `db:"user_id"`
	Token     string    `db:"token"`
	CreatedAt time.Time `db:"created_at"`
	ExpiresAt time.Time `db:"expires_at"`
}

type Session struct {
	ID        string         `db:"id"`
	UserID    sql.NullString `db:"user_id"`
	Data      []byte         `db:"data"`
	CreatedAt time.Time      `db:"created_at"`
	UpdatedAt time.Time      `db:"updated_at"`
	ExpiresAt time.Time      `db:"expires_at"`
}

type UserRepository interface {
	Load(ctx context.Context, key string) (*User, error)
	Save(ctx context.Context, user *User) error
	Create(ctx context.Context, user *User) error
	LoadByConfirmSelector(ctx context.Context, selector string) (*User, error)
	LoadByRecoverSelector(ctx context.Context, selector string) (*User, error)
}