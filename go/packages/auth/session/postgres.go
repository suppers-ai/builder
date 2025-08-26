package session

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/gob"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"github.com/suppers-ai/database"
	"github.com/volatiletech/authboss/v3"
)

// ClientStateData implements authboss.ClientState interface
type ClientStateData map[string]string

// Get retrieves a value from the client state
func (c ClientStateData) Get(key string) (string, bool) {
	val, ok := c[key]
	return val, ok
}

type PostgresStore struct {
	db          database.Database
	Codecs      []securecookie.Codec
	Options     *sessions.Options
	maxAge      int
	request     *http.Request // Track the current request for WriteState
	sessionName string        // The name of the session
}

func NewPostgresStore(db database.Database, keyPairs ...[]byte) *PostgresStore {
	return &PostgresStore{
		db:     db,
		Codecs: securecookie.CodecsFromPairs(keyPairs...),
		Options: &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 30,
			HttpOnly: true,
			Secure:   false,
			SameSite: http.SameSiteLaxMode,
		},
		maxAge:      86400 * 30,
		sessionName: "auth", // Default session name
	}
}

// SetSessionName sets the session name
func (s *PostgresStore) SetSessionName(name string) {
	s.sessionName = name
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
		err = securecookie.DecodeMulti(name, c.Value, &session.ID, s.Codecs...)
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
	
	encoded, err := securecookie.EncodeMulti(session.Name(), session.ID, s.Codecs...)
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
	
	// Debug: Looking for session ID
	
	err := s.db.Get(ctx, &data, query, session.ID)
	if err != nil {
		if err == database.ErrNoRows {
			// Session not found in database
			return nil
		}
		// Error loading session
		return err
	}
	
	// Found session data
	
	// Deserialize session data
	dec := gob.NewDecoder(bytes.NewReader(data))
	err = dec.Decode(&session.Values)
	if err != nil {
		// Error decoding session
		return err
	}
	
	// Successfully decoded session values
	
	return nil
}

func (s *PostgresStore) save(ctx context.Context, session *sessions.Session) error {
	// Serialize session data
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	if err := enc.Encode(session.Values); err != nil {
		return err
	}
	data := buf.Bytes()
	
	expiresAt := time.Now().Add(time.Duration(s.Options.MaxAge) * time.Second)
	
	query := `
		INSERT INTO auth.sessions (id, data, created_at, updated_at, expires_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (id) DO UPDATE SET
			data = EXCLUDED.data,
			updated_at = EXCLUDED.updated_at,
			expires_at = EXCLUDED.expires_at`
	
	_, err := s.db.Exec(ctx, query, session.ID, data, time.Now(), time.Now(), expiresAt)
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

// ReadState loads the client state from the request
// This implements the authboss.ClientStateReadWriter interface
func (s *PostgresStore) ReadState(r *http.Request) (authboss.ClientState, error) {
	// Store the request for potential use in WriteState
	s.request = r
	
	// Create a new client state data holder
	state := make(ClientStateData)
	
	// Try to get the session using the configured session name
	session, err := s.Get(r, s.sessionName)
	if err != nil {
		// Also try with dash-separated name
		session, err = s.Get(r, strings.ReplaceAll(s.sessionName, "_", "-"))
		if err != nil {
			// Return empty state on error
			return state, nil
		}
	}
	
	// Convert session values to client state
	for key, value := range session.Values {
		// Type assert key to string
		if keyStr, ok := key.(string); ok {
			if str, ok := value.(string); ok {
				state[keyStr] = str
			} else if fmt.Sprintf("%v", value) != "" {
				// Try to convert other types to string
				state[keyStr] = fmt.Sprintf("%v", value)
			}
		}
	}
	
	// Session state loaded successfully
	
	return state, nil
}

// WriteState saves the client state to the response
func (s *PostgresStore) WriteState(w http.ResponseWriter, state authboss.ClientState, evs []authboss.ClientStateEvent) error {
	// Use the stored request from ReadState
	if s.request == nil {
		return fmt.Errorf("no request available for session")
	}
	
	// Try getting session with configured name first
	session, err := s.Get(s.request, s.sessionName)
	if err != nil {
		// Try with dash-separated name
		dashName := strings.ReplaceAll(s.sessionName, "_", "-")
		session, err = s.Get(s.request, dashName)
		if err != nil {
			// Create new session with dash name (gorilla sessions normalizes to dashes)
			session, err = s.New(s.request, dashName)
			if err != nil {
				return err
			}
		}
	}
	
	// Apply events to session
	for _, event := range evs {
		switch event.Kind {
		case authboss.ClientStateEventPut:
			session.Values[event.Key] = event.Value
		case authboss.ClientStateEventDel:
			delete(session.Values, event.Key)
		case authboss.ClientStateEventDelAll:
			session.Values = make(map[interface{}]interface{})
		}
	}
	
	// Save the session
	return s.Save(s.request, w, session)
}

func generateSessionID() string {
	return base64.URLEncoding.EncodeToString([]byte(fmt.Sprintf("%d-%d", time.Now().UnixNano(), time.Now().Unix())))
}

func init() {
	gob.Register(time.Time{})
}