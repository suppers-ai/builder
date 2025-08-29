# Performance Optimizations

This document describes the performance optimizations implemented in the Formula Pricing Site Go rewrite.

## Overview

The application has been optimized for production use with several performance enhancements:

1. **Gzip Compression** - Automatic compression of text-based responses
2. **Caching Headers** - Appropriate cache headers for static assets
3. **Connection Management** - Configurable timeouts and limits
4. **Metrics Collection** - Comprehensive performance monitoring

## Gzip Compression

### Implementation
- Automatic gzip compression for all text-based content (HTML, CSS, JS, JSON)
- Compression is applied via middleware and respects client `Accept-Encoding` headers
- Skips compression for already compressed content (images, videos, archives)

### Benefits
- Reduces bandwidth usage by 30-70% for text content
- Faster page load times, especially on slower connections
- Lower server bandwidth costs

### Configuration
Compression is enabled by default and requires no configuration. It automatically:
- Detects client support via `Accept-Encoding: gzip` header
- Sets appropriate response headers (`Content-Encoding: gzip`, `Vary: Accept-Encoding`)
- Skips compression for binary content types

## Caching Headers

### Implementation
Static assets are served with appropriate cache headers based on file type:

| Asset Type | Cache Duration | Max-Age | Rationale |
|------------|----------------|---------|-----------|
| CSS, JS | 1 hour | 3600s | May change during development |
| Images (PNG, JPG, SVG) | 24 hours | 86400s | Less likely to change |
| Fonts (WOFF, WOFF2, TTF) | 1 week | 604800s | Very stable assets |
| Other files | 1 hour | 3600s | Conservative default |

### Benefits
- Reduces server load by serving cached content from browser/CDN
- Faster subsequent page loads for returning visitors
- Lower bandwidth usage for repeated requests

### Headers Set
```http
Cache-Control: public, max-age=<seconds>
Expires: <future-date>
Content-Type: <appropriate-mime-type>
```

## Connection Management

### Server Configuration
The HTTP server is configured with production-ready timeouts and limits:

```go
ReadTimeout:    15 seconds  // Time to read request headers and body
WriteTimeout:   15 seconds  // Time to write response
IdleTimeout:    60 seconds  // Time to keep connections alive
MaxHeaderBytes: 1MB         // Maximum size of request headers
RequestTimeout: 30 seconds  // Overall request processing timeout
```

### Environment Variables
These settings can be configured via environment variables:

```bash
READ_TIMEOUT=15          # Server read timeout in seconds
WRITE_TIMEOUT=15         # Server write timeout in seconds  
IDLE_TIMEOUT=60          # Server idle timeout in seconds
MAX_HEADER_BYTES=1048576 # Maximum header size in bytes (1MB)
REQUEST_TIMEOUT=30       # Request timeout in seconds
```

### Benefits
- Prevents resource exhaustion from slow or malicious clients
- Ensures predictable response times
- Protects against various DoS attack vectors
- Enables proper connection pooling and reuse

## Metrics Collection

### Implementation
Comprehensive metrics collection system that tracks:

#### Request Metrics
- Total requests processed
- Response time statistics (min, max, average)
- Response time histogram (buckets: <10ms, 10-50ms, 50-100ms, 100-500ms, 500ms-1s, >1s)
- Status code distribution (2xx, 3xx, 4xx, 5xx)
- Error rate tracking

#### Performance Metrics
- Active connection count
- Request timeout occurrences
- Panic recovery events
- Static asset serving statistics

#### Compression Metrics
- Number of compressed responses
- Estimated bandwidth savings from compression

### Endpoints
Metrics are exposed via HTTP endpoints:

#### JSON Format
```
GET /metrics
```
Returns detailed metrics in JSON format suitable for monitoring dashboards.

#### Prometheus Format
```
GET /metrics/prometheus
```
Returns metrics in Prometheus format for integration with Prometheus monitoring.

### Sample Metrics Output
```json
{
  "total_requests": 1250,
  "total_errors": 23,
  "average_response_time_ms": 45.2,
  "status_2xx": 1180,
  "status_4xx": 18,
  "status_5xx": 5,
  "compressed_responses": 890,
  "compression_savings_bytes": 2450000,
  "active_connections": 12,
  "uptime": "2h15m30s"
}
```

### Benefits
- Real-time visibility into application performance
- Early detection of performance degradation
- Capacity planning data
- Integration with monitoring and alerting systems

## Performance Testing

### Test Coverage
The implementation includes comprehensive performance tests:

1. **Compression Tests** - Verify gzip compression works correctly
2. **Cache Header Tests** - Ensure proper cache headers are set
3. **Metrics Tests** - Validate metrics collection accuracy
4. **Timeout Tests** - Confirm timeout handling works
5. **Benchmark Tests** - Measure performance characteristics

### Running Tests
```bash
# Run all performance tests
go test ./tests/performance/ -v

# Run benchmarks
go test ./tests/performance/ -bench=. -benchmem

# Run specific test
go test ./tests/performance/ -run TestGzipCompression -v
```

### Benchmark Results
Current performance characteristics:
- Metrics recording: ~40ns per operation (0 allocations)
- Gzip compression: ~78μs per operation
- Memory usage: Minimal allocations for core operations

## Monitoring and Alerting

### Recommended Monitoring
Set up monitoring for these key metrics:

1. **Response Time** - Alert if average response time > 500ms
2. **Error Rate** - Alert if error rate > 5%
3. **Active Connections** - Alert if connections > 80% of limit
4. **Memory Usage** - Monitor for memory leaks
5. **CPU Usage** - Track CPU utilization trends

### Health Checks
The application provides health check endpoints:
- `/health` - Basic health status
- `/healthz` - Alternative health endpoint (Kubernetes style)

Both endpoints return JSON with uptime and status information.

## Production Deployment

### Recommended Settings
For production deployment, use these environment variables:

```bash
ENVIRONMENT=production
LOG_LEVEL=WARN
READ_TIMEOUT=30
WRITE_TIMEOUT=30
IDLE_TIMEOUT=120
REQUEST_TIMEOUT=60
ENABLE_METRICS=true
```

### Load Testing
Before deploying to production:

1. Run load tests to determine capacity limits
2. Test with realistic traffic patterns
3. Verify metrics collection under load
4. Test timeout and error handling scenarios

### Scaling Considerations
The application is designed to scale horizontally:
- Stateless design (metrics are per-instance)
- No shared state between requests
- Efficient memory usage
- Fast startup time

For high-traffic deployments, consider:
- Load balancer with health checks
- Multiple application instances
- CDN for static assets
- Prometheus for metrics aggregation