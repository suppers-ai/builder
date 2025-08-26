package storage

import (
	"context"
	"io"
	"time"
)

type Provider string

const (
	ProviderS3    Provider = "s3"
	ProviderGCS   Provider = "gcs"
	ProviderAzure Provider = "azure"
	ProviderLocal Provider = "local"
)

type Storage interface {
	Upload(ctx context.Context, key string, reader io.Reader, opts *UploadOptions) (*Object, error)
	Download(ctx context.Context, key string) (io.ReadCloser, error)
	Delete(ctx context.Context, key string) error
	Exists(ctx context.Context, key string) (bool, error)
	List(ctx context.Context, prefix string, opts *ListOptions) ([]*Object, error)
	GetSignedURL(ctx context.Context, key string, opts *SignedURLOptions) (string, error)
	Copy(ctx context.Context, srcKey, destKey string) error
	Move(ctx context.Context, srcKey, destKey string) error
}

type Object struct {
	Key          string
	Size         int64
	LastModified time.Time
	ContentType  string
	ETag         string
	Metadata     map[string]string
}

type UploadOptions struct {
	ContentType        string
	ContentDisposition string
	CacheControl       string
	Metadata           map[string]string
	ACL                string
}

type ListOptions struct {
	MaxKeys      int
	Delimiter    string
	StartAfter   string
	ContinuationToken string
}

type SignedURLOptions struct {
	Method      string
	Expires     time.Duration
	ContentType string
	Headers     map[string]string
}

type Config struct {
	Provider Provider
	Region   string
	Bucket   string
	
	AccessKeyID     string
	SecretAccessKey string
	SessionToken    string
	
	Endpoint        string
	UsePathStyle    bool
	DisableSSL      bool
	
	ProjectID       string
	CredentialsPath string
	
	LocalPath       string
	
	CustomConfig    map[string]interface{}
}

type Factory interface {
	Create(config *Config) (Storage, error)
}

var factories = make(map[Provider]Factory)

func Register(provider Provider, factory Factory) {
	factories[provider] = factory
}

func New(config *Config) (Storage, error) {
	factory, ok := factories[config.Provider]
	if !ok {
		return nil, &Error{
			Code:    ErrorCodeInvalidConfig,
			Message: "unsupported storage provider: " + string(config.Provider),
		}
	}
	return factory.Create(config)
}