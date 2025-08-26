package session

import (
	"context"
	"encoding/base64"
	"encoding/gob"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/sessions"
	"github.com/suppers-ai/database"
)

type PostgresStore struct {
	db         database.Database
	Codecs     []sessions.Codec
	Options    *sessions.Options
	maxAge     int
	serializer sessions.Serializer
}

func NewPostgresStore(db database.Database, keyPairs ...[]byte) *PostgresStore {
	return &PostgresStore{
		db:     db,
		Codecs: sessions.CodecsFromPairs(keyPairs...),
		Options: &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 30,
			HttpOnly: true,
			Secure:   false,
			SameSite: http.SameSiteLaxMode,
		},
		maxAge:     86400 * 30,
		serializer: sessions.GobSerializer{},
	}
}

func (s *PostgresStore) Get(r *http.Request, name string) (*sessions.Session, error) {
	return sessions.GetRegistry(r).Get(s, name)
}

func (s *PostgresStore) New(r *http.Request, name string) (*sessions.Session, error) {
	session := sessions.NewSession(s, name)
	opts := *s.Options
	session.Options = &opts
	session.IsNew = true
	
	if c, err := r.Cookie(name); err == nil {
		err = sessions.DecodeMulti(name, c.Value, &session.ID, s.Codecs...)
		if err == nil {
			session.IsNew = false
			err = s.load(r.Context(), session)
		}
	}
	
	return session, nil
}

func (s *PostgresStore) Save(r *http.Request, w http.ResponseWriter, session *sessions.Session) error {
	if session.ID == "" {
		session.ID = generateSessionID()
	}
	
	encoded, err := sessions.EncodeMulti(session.Name(), session.ID, s.Codecs...)
	if err != nil {
		return err
	}
	
	http.SetCookie(w, &http.Cookie{
		Name:     session.Name(),
		Value:    encoded,
		Path:     s.Options.Path,
		Domain:   s.Options.Domain,
		MaxAge:   s.Options.MaxAge,
		HttpOnly: s.Options.HttpOnly,
		Secure:   s.Options.Secure,
		SameSite: s.Options.SameSite,
	})
	
	if session.Options.MaxAge < 0 {
		return s.delete(r.Context(), session)
	}
	
	return s.save(r.Context(), session)
}

func (s *PostgresStore) load(ctx context.Context, session *sessions.Session) error {
	var data []byte
	query := `SELECT data FROM auth.sessions WHERE id = $1 AND expires_at > NOW()`
	
	err := s.db.Get(ctx, &data, query, session.ID)
	if err != nil {
		if err == database.ErrNoRows {
			return nil
		}
		return err
	}
	
	return s.serializer.Deserialize(data, session)
}

func (s *PostgresStore) save(ctx context.Context, session *sessions.Session) error {
	data, err := s.serializer.Serialize(session)
	if err != nil {
		return err
	}
	
	expiresAt := time.Now().Add(time.Duration(s.Options.MaxAge) * time.Second)
	
	query := `
		INSERT INTO auth.sessions (id, data, created_at, updated_at, expires_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (id) DO UPDATE SET
			data = EXCLUDED.data,
			updated_at = EXCLUDED.updated_at,
			expires_at = EXCLUDED.expires_at`
	
	_, err = s.db.Exec(ctx, query, session.ID, data, time.Now(), time.Now(), expiresAt)
	return err
}

func (s *PostgresStore) delete(ctx context.Context, session *sessions.Session) error {
	query := `DELETE FROM auth.sessions WHERE id = $1`
	_, err := s.db.Exec(ctx, query, session.ID)
	return err
}

func (s *PostgresStore) CleanupSessions(ctx context.Context) error {
	query := `DELETE FROM auth.sessions WHERE expires_at < NOW()`
	_, err := s.db.Exec(ctx, query)
	return err
}

func generateSessionID() string {
	return base64.URLEncoding.EncodeToString([]byte(fmt.Sprintf("%d-%d", time.Now().UnixNano(), time.Now().Unix())))
}

func init() {
	gob.Register(time.Time{})
}