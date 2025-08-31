package storage

import (
	"bytes"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

// S3Provider implements storage using Amazon S3 or compatible services
type S3Provider struct {
	client   *s3.S3
	endpoint string
	region   string
	useSSL   bool
}

// NewS3Provider creates a new S3 storage provider
func NewS3Provider(endpoint, accessKey, secretKey, region string, useSSL bool) (*S3Provider, error) {
	// Create AWS session
	config := &aws.Config{
		Credentials:      credentials.NewStaticCredentials(accessKey, secretKey, ""),
		Region:           aws.String(region),
		S3ForcePathStyle: aws.Bool(true),
	}
	
	if endpoint != "" {
		config.Endpoint = aws.String(endpoint)
		config.DisableSSL = aws.Bool(!useSSL)
	}
	
	sess, err := session.NewSession(config)
	if err != nil {
		return nil, err
	}
	
	return &S3Provider{
		client:   s3.New(sess),
		endpoint: endpoint,
		region:   region,
		useSSL:   useSSL,
	}, nil
}

// CreateBucket creates a new S3 bucket
func (s *S3Provider) CreateBucket(name string, public bool) error {
	input := &s3.CreateBucketInput{
		Bucket: aws.String(name),
	}
	
	// Add location constraint for non-us-east-1 regions
	if s.region != "us-east-1" {
		input.CreateBucketConfiguration = &s3.CreateBucketConfiguration{
			LocationConstraint: aws.String(s.region),
		}
	}
	
	_, err := s.client.CreateBucket(input)
	if err != nil {
		return err
	}
	
	// Set bucket ACL if public
	if public {
		_, err = s.client.PutBucketAcl(&s3.PutBucketAclInput{
			Bucket: aws.String(name),
			ACL:    aws.String("public-read"),
		})
		if err != nil {
			return err
		}
	}
	
	return nil
}

// DeleteBucket deletes an S3 bucket
func (s *S3Provider) DeleteBucket(name string) error {
	// First check if bucket is empty
	objects, err := s.client.ListObjectsV2(&s3.ListObjectsV2Input{
		Bucket:  aws.String(name),
		MaxKeys: aws.Int64(1),
	})
	if err != nil {
		return err
	}
	
	if len(objects.Contents) > 0 {
		return fmt.Errorf("bucket %s is not empty", name)
	}
	
	_, err = s.client.DeleteBucket(&s3.DeleteBucketInput{
		Bucket: aws.String(name),
	})
	return err
}

// ListBuckets lists all S3 buckets
func (s *S3Provider) ListBuckets() ([]Bucket, error) {
	result, err := s.client.ListBuckets(&s3.ListBucketsInput{})
	if err != nil {
		return nil, err
	}
	
	var buckets []Bucket
	for _, b := range result.Buckets {
		bucket := Bucket{
			Name:      *b.Name,
			CreatedAt: *b.CreationDate,
		}
		
		// Get bucket ACL to determine if public
		aclResult, err := s.client.GetBucketAcl(&s3.GetBucketAclInput{
			Bucket: b.Name,
		})
		if err == nil {
			for _, grant := range aclResult.Grants {
				if grant.Grantee != nil && grant.Grantee.URI != nil {
					if *grant.Grantee.URI == "http://acs.amazonaws.com/groups/global/AllUsers" {
						bucket.Public = true
						break
					}
				}
			}
		}
		
		// Get bucket size and object count
		var totalSize int64
		var objectCount int64
		
		err = s.client.ListObjectsV2Pages(&s3.ListObjectsV2Input{
			Bucket: b.Name,
		}, func(page *s3.ListObjectsV2Output, lastPage bool) bool {
			for _, obj := range page.Contents {
				if obj.Size != nil {
					totalSize += *obj.Size
				}
				objectCount++
			}
			return true
		})
		
		bucket.TotalSize = totalSize
		bucket.ObjectCount = objectCount
		buckets = append(buckets, bucket)
	}
	
	return buckets, nil
}

// BucketExists checks if an S3 bucket exists
func (s *S3Provider) BucketExists(name string) (bool, error) {
	_, err := s.client.HeadBucket(&s3.HeadBucketInput{
		Bucket: aws.String(name),
	})
	if err != nil {
		return false, nil
	}
	return true, nil
}

// PutObject stores an object in S3
func (s *S3Provider) PutObject(bucket, key string, reader io.Reader, size int64, contentType string) error {
	// Read data into buffer
	buf := new(bytes.Buffer)
	if _, err := io.Copy(buf, reader); err != nil {
		return err
	}
	
	_, err := s.client.PutObject(&s3.PutObjectInput{
		Bucket:        aws.String(bucket),
		Key:           aws.String(key),
		Body:          bytes.NewReader(buf.Bytes()),
		ContentLength: aws.Int64(size),
		ContentType:   aws.String(contentType),
	})
	return err
}

// GetObject retrieves an object from S3
func (s *S3Provider) GetObject(bucket, key string) (io.ReadCloser, error) {
	result, err := s.client.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	return result.Body, nil
}

// DeleteObject deletes an object from S3
func (s *S3Provider) DeleteObject(bucket, key string) error {
	_, err := s.client.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	return err
}

// ListObjects lists objects in an S3 bucket
func (s *S3Provider) ListObjects(bucket, prefix string) ([]Object, error) {
	var objects []Object
	
	err := s.client.ListObjectsV2Pages(&s3.ListObjectsV2Input{
		Bucket: aws.String(bucket),
		Prefix: aws.String(prefix),
	}, func(page *s3.ListObjectsV2Output, lastPage bool) bool {
		for _, obj := range page.Contents {
			object := Object{
				Key:          *obj.Key,
				Size:         *obj.Size,
				LastModified: *obj.LastModified,
			}
			
			if obj.ETag != nil {
				object.ETag = *obj.ETag
			}
			
			// Determine if it's a directory (ends with /)
			if len(object.Key) > 0 && object.Key[len(object.Key)-1] == '/' {
				object.IsDirectory = true
			}
			
			objects = append(objects, object)
		}
		return true
	})
	
	if err != nil {
		return nil, err
	}
	
	// Get content types from head requests
	for i := range objects {
		if !objects[i].IsDirectory {
			head, err := s.client.HeadObject(&s3.HeadObjectInput{
				Bucket: aws.String(bucket),
				Key:    aws.String(objects[i].Key),
			})
			if err == nil && head.ContentType != nil {
				objects[i].ContentType = *head.ContentType
			} else {
				objects[i].ContentType = "application/octet-stream"
			}
		}
	}
	
	return objects, nil
}

// ObjectExists checks if an object exists in S3
func (s *S3Provider) ObjectExists(bucket, key string) (bool, error) {
	_, err := s.client.HeadObject(&s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return false, nil
	}
	return true, nil
}

// GetObjectInfo gets object metadata from S3
func (s *S3Provider) GetObjectInfo(bucket, key string) (*Object, error) {
	result, err := s.client.HeadObject(&s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	
	obj := &Object{
		Key:          key,
		Size:         *result.ContentLength,
		LastModified: *result.LastModified,
	}
	
	if result.ContentType != nil {
		obj.ContentType = *result.ContentType
	}
	
	if result.ETag != nil {
		obj.ETag = *result.ETag
	}
	
	return obj, nil
}

// GetPublicURL gets a public URL for an S3 object
func (s *S3Provider) GetPublicURL(bucket, key string) string {
	if s.endpoint != "" {
		protocol := "https"
		if !s.useSSL {
			protocol = "http"
		}
		return fmt.Sprintf("%s://%s/%s/%s", protocol, s.endpoint, bucket, key)
	}
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, s.region, key)
}

// GetSignedURL gets a pre-signed URL for an S3 object
func (s *S3Provider) GetSignedURL(bucket, key string, expiry time.Duration) (string, error) {
	req, _ := s.client.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	
	urlStr, err := req.Presign(expiry)
	if err != nil {
		return "", err
	}
	
	return urlStr, nil
}