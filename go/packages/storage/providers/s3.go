package providers

import (
	"context"
	"errors"
	"fmt"
	"io"
	"reflect"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
	
	storage "github.com/suppers-ai/storage"
)

func init() {
	storage.Register(storage.ProviderS3, &S3Factory{})
}

type S3Factory struct{}

func (f *S3Factory) Create(cfg *storage.Config) (storage.Storage, error) {
	return NewS3Storage(cfg)
}

type S3Storage struct {
	client *s3.Client
	bucket string
	config *storage.Config
}

func NewS3Storage(cfg *storage.Config) (*S3Storage, error) {
	if cfg.Bucket == "" {
		return nil, &storage.Error{
			Code:    storage.ErrorCodeInvalidConfig,
			Message: "bucket name is required for S3 storage",
		}
	}

	awsCfg, err := buildAWSConfig(cfg)
	if err != nil {
		return nil, &storage.Error{
			Code:    storage.ErrorCodeInvalidConfig,
			Message: "failed to build AWS configuration",
			Cause:   err,
		}
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.Endpoint != "" {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
		}
		if cfg.UsePathStyle {
			o.UsePathStyle = true
		}
	})

	return &S3Storage{
		client: client,
		bucket: cfg.Bucket,
		config: cfg,
	}, nil
}

func buildAWSConfig(cfg *storage.Config) (aws.Config, error) {
	var opts []func(*config.LoadOptions) error

	if cfg.Region != "" {
		opts = append(opts, config.WithRegion(cfg.Region))
	}

	if cfg.AccessKeyID != "" && cfg.SecretAccessKey != "" {
		opts = append(opts, config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				cfg.AccessKeyID,
				cfg.SecretAccessKey,
				cfg.SessionToken,
			),
		))
	}

	return config.LoadDefaultConfig(context.Background(), opts...)
}

func (s *S3Storage) Upload(ctx context.Context, key string, reader io.Reader, opts *storage.UploadOptions) (*storage.Object, error) {
	input := &s3.PutObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
		Body:   reader,
	}

	if opts != nil {
		if opts.ContentType != "" {
			input.ContentType = aws.String(opts.ContentType)
		}
		if opts.ContentDisposition != "" {
			input.ContentDisposition = aws.String(opts.ContentDisposition)
		}
		if opts.CacheControl != "" {
			input.CacheControl = aws.String(opts.CacheControl)
		}
		if len(opts.Metadata) > 0 {
			input.Metadata = opts.Metadata
		}
		if opts.ACL != "" {
			input.ACL = types.ObjectCannedACL(opts.ACL)
		}
	}

	result, err := s.client.PutObject(ctx, input)
	if err != nil {
		return nil, s.wrapError(err, "failed to upload object")
	}

	return &storage.Object{
		Key:         key,
		ContentType: aws.ToString(input.ContentType),
		ETag:        aws.ToString(result.ETag),
		Metadata:    opts.Metadata,
	}, nil
}

func (s *S3Storage) Download(ctx context.Context, key string) (io.ReadCloser, error) {
	input := &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}

	result, err := s.client.GetObject(ctx, input)
	if err != nil {
		return nil, s.wrapError(err, "failed to download object")
	}

	return result.Body, nil
}

func (s *S3Storage) Delete(ctx context.Context, key string) error {
	input := &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}

	_, err := s.client.DeleteObject(ctx, input)
	if err != nil {
		return s.wrapError(err, "failed to delete object")
	}

	return nil
}

func (s *S3Storage) Exists(ctx context.Context, key string) (bool, error) {
	input := &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}

	_, err := s.client.HeadObject(ctx, input)
	if err != nil {
		var ae smithy.APIError
		if errors.As(err, &ae) && ae.ErrorCode() == "NotFound" {
			return false, nil
		}
		return false, s.wrapError(err, "failed to check object existence")
	}

	return true, nil
}

func (s *S3Storage) List(ctx context.Context, prefix string, opts *storage.ListOptions) ([]*storage.Object, error) {
	input := &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucket),
	}

	if prefix != "" {
		input.Prefix = aws.String(prefix)
	}

	if opts != nil {
		if opts.MaxKeys > 0 {
			input.MaxKeys = aws.Int32(int32(opts.MaxKeys))
		}
		if opts.Delimiter != "" {
			input.Delimiter = aws.String(opts.Delimiter)
		}
		if opts.StartAfter != "" {
			input.StartAfter = aws.String(opts.StartAfter)
		}
		if opts.ContinuationToken != "" {
			input.ContinuationToken = aws.String(opts.ContinuationToken)
		}
	}

	result, err := s.client.ListObjectsV2(ctx, input)
	if err != nil {
		return nil, s.wrapError(err, "failed to list objects")
	}

	objects := make([]*storage.Object, 0, len(result.Contents))
	for _, item := range result.Contents {
		objects = append(objects, &storage.Object{
			Key:          aws.ToString(item.Key),
			Size:         aws.ToInt64(item.Size),
			LastModified: aws.ToTime(item.LastModified),
			ETag:         aws.ToString(item.ETag),
		})
	}

	return objects, nil
}

func (s *S3Storage) GetSignedURL(ctx context.Context, key string, opts *storage.SignedURLOptions) (string, error) {
	presignClient := s3.NewPresignClient(s.client)

	var request interface{}
	var err error

	method := "GET"
	if opts != nil && opts.Method != "" {
		method = opts.Method
	}

	expires := 15 * time.Minute
	if opts != nil && opts.Expires > 0 {
		expires = opts.Expires
	}

	switch strings.ToUpper(method) {
	case "GET":
		input := &s3.GetObjectInput{
			Bucket: aws.String(s.bucket),
			Key:    aws.String(key),
		}
		request, err = presignClient.PresignGetObject(ctx, input, func(po *s3.PresignOptions) {
			po.Expires = expires
		})
	case "PUT":
		input := &s3.PutObjectInput{
			Bucket: aws.String(s.bucket),
			Key:    aws.String(key),
		}
		if opts != nil && opts.ContentType != "" {
			input.ContentType = aws.String(opts.ContentType)
		}
		request, err = presignClient.PresignPutObject(ctx, input, func(po *s3.PresignOptions) {
			po.Expires = expires
		})
	case "DELETE":
		input := &s3.DeleteObjectInput{
			Bucket: aws.String(s.bucket),
			Key:    aws.String(key),
		}
		request, err = presignClient.PresignDeleteObject(ctx, input, func(po *s3.PresignOptions) {
			po.Expires = expires
		})
	default:
		return "", &storage.Error{
			Code:    storage.ErrorCodeInvalidRequest,
			Message: fmt.Sprintf("unsupported method for signed URL: %s", method),
		}
	}

	if err != nil {
		return "", s.wrapError(err, "failed to create signed URL")
	}

	// In AWS SDK v2, all presigned requests have a URL field
	// Try reflection to get the URL field
	if request != nil {
		rv := reflect.ValueOf(request)
		if rv.Kind() == reflect.Ptr {
			rv = rv.Elem()
		}
		urlField := rv.FieldByName("URL")
		if urlField.IsValid() && urlField.Kind() == reflect.String {
			return urlField.String(), nil
		}
	}

	return "", &storage.Error{
		Code:    storage.ErrorCodeInternalError,
		Message: "failed to get URL from presigned request",
	}
}

func (s *S3Storage) Copy(ctx context.Context, srcKey, destKey string) error {
	input := &s3.CopyObjectInput{
		Bucket:     aws.String(s.bucket),
		CopySource: aws.String(fmt.Sprintf("%s/%s", s.bucket, srcKey)),
		Key:        aws.String(destKey),
	}

	_, err := s.client.CopyObject(ctx, input)
	if err != nil {
		return s.wrapError(err, "failed to copy object")
	}

	return nil
}

func (s *S3Storage) Move(ctx context.Context, srcKey, destKey string) error {
	if err := s.Copy(ctx, srcKey, destKey); err != nil {
		return err
	}

	return s.Delete(ctx, srcKey)
}

func (s *S3Storage) wrapError(err error, message string) error {
	if err == nil {
		return nil
	}

	var ae smithy.APIError
	if errors.As(err, &ae) {
		code := storage.ErrorCodeInternalError
		switch ae.ErrorCode() {
		case "NoSuchKey", "NotFound":
			code = storage.ErrorCodeNotFound
		case "AccessDenied", "Forbidden":
			code = storage.ErrorCodeAccessDenied
		case "InvalidRequest", "BadRequest":
			code = storage.ErrorCodeInvalidRequest
		}
		return &storage.Error{
			Code:    code,
			Message: message,
			Cause:   err,
		}
	}

	return &storage.Error{
		Code:    storage.ErrorCodeNetworkError,
		Message: message,
		Cause:   err,
	}
}