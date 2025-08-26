package auth

import (
	"context"
	"net/http"
	"time"

	"github.com/volatiletech/authboss/v3"
	"github.com/gorilla/sessions"
	"github.com/suppers-ai/auth/config"
	"github.com/suppers-ai/auth/middleware"
	"github.com/suppers-ai/auth/models"
	"github.com/suppers-ai/database"
	"github.com/suppers-ai/mailer"
)

type Service struct {
	auth         *config.Auth
	db           database.Database
	sessionStore sessions.Store
	storage      authboss.ServerStorer
}

type Config struct {
	DB              database.Database
	Mailer          mailer.Mailer
	RootURL         string
	BCryptCost      int
	SessionName     string
	CookieKey       []byte
	SessionKey      []byte
	CSRFKey         []byte
	OAuth2Providers map[string]OAuth2Provider
}

type OAuth2Provider struct {
	ClientID     string
	ClientSecret string
	Scopes       []string
}

func New(cfg Config) (*Service, error) {
	authCfg := config.AuthConfig{
		DB:           cfg.DB,
		Mailer:       cfg.Mailer,
		RootURL:      cfg.RootURL,
		BCryptCost:   cfg.BCryptCost,
		SessionName:  cfg.SessionName,
		CookieKey:    cfg.CookieKey,
		SessionKey:   cfg.SessionKey,
		CSRFKey:      cfg.CSRFKey,
		OAuth2Providers: make(map[string]config.OAuth2Config),
	}
	
	for name, provider := range cfg.OAuth2Providers {
		authCfg.OAuth2Providers[name] = config.OAuth2Config{
			ClientID:     provider.ClientID,
			ClientSecret: provider.ClientSecret,
			Scopes:       provider.Scopes,
		}
	}
	
	auth, err := config.NewAuth(authCfg)
	if err != nil {
		return nil, err
	}
	
	return &Service{
		auth:         auth,
		db:           cfg.DB,
		sessionStore: auth.SessionStore,
		storage:      auth.Storage,
	}, nil
}

func (s *Service) Router() http.Handler {
	return s.auth.AB.Config.Core.Router
}

func (s *Service) LoadClientStateMiddleware(next http.Handler) http.Handler {
	return s.auth.Middleware(next)
}

func (s *Service) RequireAuth(next http.Handler) http.Handler {
	return s.auth.RequireAuth(next)
}

func (s *Service) RequireNoAuth(next http.Handler) http.Handler {
	return s.auth.RequireNoAuth(next)
}

func (s *Service) RequireAdmin(adminChecker func(authboss.User) bool) func(http.Handler) http.Handler {
	return middleware.RequireAdmin(s.auth.AB, adminChecker)
}

// RequireAdminSimple provides a simpler interface for admin checking
func (s *Service) RequireAdminSimple(adminChecker func(interface{}) bool) func(http.Handler) http.Handler {
	// Wrap the simple checker to work with authboss.User
	wrappedChecker := func(user authboss.User) bool {
		return adminChecker(user)
	}
	return middleware.RequireAdmin(s.auth.AB, wrappedChecker)
}

func (s *Service) CSRF(next http.Handler) http.Handler {
	return middleware.CSRF(s.auth.AB)(next)
}

func (s *Service) CurrentUser(r *http.Request) (authboss.User, error) {
	return s.auth.AB.CurrentUser(r)
}

func (s *Service) CurrentUserID(r *http.Request) (string, error) {
	return s.auth.AB.CurrentUserID(r)
}

func (s *Service) LoadUser(ctx context.Context, id string) (authboss.User, error) {
	return s.storage.Load(ctx, id)
}

func (s *Service) CreateUser(ctx context.Context, email, password string) (*models.User, error) {
	user := &models.User{
		Email:     email,
		Confirmed: false,
	}
	
	if password != "" {
		hashedPassword, err := s.auth.AB.Config.Core.Hasher.GenerateHash(password)
		if err != nil {
			return nil, err
		}
		user.Password = hashedPassword
	}
	
	// Use Create for new users instead of Save
	if storer, ok := s.storage.(interface {
		Create(context.Context, authboss.User) error
	}); ok {
		err := storer.Create(ctx, user)
		if err != nil {
			return nil, err
		}
	} else {
		// Fallback to Save if Create not available
		err := s.storage.Save(ctx, user)
		if err != nil {
			return nil, err
		}
	}
	
	return user, nil
}

func (s *Service) UpdateUser(ctx context.Context, user authboss.User) error {
	return s.storage.Save(ctx, user)
}

func (s *Service) DeleteUser(ctx context.Context, id string) error {
	query := `DELETE FROM auth.users WHERE id = $1`
	_, err := s.db.Exec(ctx, query, id)
	return err
}

func (s *Service) LockUser(ctx context.Context, id string) error {
	user, err := s.LoadUser(ctx, id)
	if err != nil {
		return err
	}
	
	if lockable, ok := user.(authboss.LockableUser); ok {
		lockable.PutLocked(time.Now())
		return s.UpdateUser(ctx, user)
	}
	
	return nil
}

func (s *Service) UnlockUser(ctx context.Context, id string) error {
	user, err := s.LoadUser(ctx, id)
	if err != nil {
		return err
	}
	
	if lockable, ok := user.(authboss.LockableUser); ok {
		lockable.PutLocked(time.Time{})
		lockable.PutAttemptCount(0)
		lockable.PutLastAttempt(time.Time{})
		return s.UpdateUser(ctx, user)
	}
	
	return nil
}

func (s *Service) CleanupSessions(ctx context.Context) error {
	return s.auth.CleanupSessions(ctx)
}

func (s *Service) SessionStore() sessions.Store {
	return s.sessionStore
}

func (s *Service) Authboss() *authboss.Authboss {
	return s.auth.AB
}

// AuthenticateUser authenticates a user with email and password
func (s *Service) AuthenticateUser(ctx context.Context, email, password string) (authboss.User, error) {
	user, err := s.storage.Load(ctx, email)
	if err != nil {
		return nil, err
	}
	
	// Verify password
	authUser := user.(authboss.AuthableUser)
	err = s.auth.AB.Config.Core.Hasher.CompareHashAndPassword(authUser.GetPassword(), password)
	if err != nil {
		return nil, err
	}
	
	return user, nil
}

// RegisterUser registers a new user
func (s *Service) RegisterUser(ctx context.Context, email, password string, extra map[string]interface{}) (authboss.User, error) {
	user := &models.User{
		Email:     email,
		Confirmed: false,
	}
	
	// Set extra fields
	if name, ok := extra["name"].(string); ok {
		// We'll handle this after creating the user
		_ = name
	}
	
	// Hash password
	hashedPassword, err := s.auth.AB.Config.Core.Hasher.GenerateHash(password)
	if err != nil {
		return nil, err
	}
	user.Password = hashedPassword
	
	// Create user - use Create for new users instead of Save
	if storer, ok := s.storage.(interface {
		Create(context.Context, authboss.User) error
	}); ok {
		err = storer.Create(ctx, user)
	} else {
		// Fallback to Save if Create not available
		err = s.storage.Save(ctx, user)
	}
	
	if err != nil {
		return nil, err
	}
	
	return user, nil
}