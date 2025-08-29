# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Rules

### No Backward Compatibility or Migration Steps
**IMPORTANT**: When implementing new features or refactoring existing code:
- DO NOT worry about backward compatibility
- DO NOT create migration steps or migration guides
- DO NOT maintain legacy code paths
- Simply replace old implementations with new ones
- Assume a clean slate for each major change

This is a development project where we prioritize clean, modern implementations over compatibility.

### Storage Implementation
- The storage system uses a provider-based architecture
- Supported providers: Local filesystem and S3
- Default to local storage for development
- All storage operations should go through the storage package

### Database Implementation  
- Database operations go through the database package
- Support for PostgreSQL and SQLite
- Use GORM for ORM operations
- All models should use UUID primary keys

### Code Style
- Keep implementations clean and simple
- Use interfaces for abstraction
- Follow Go best practices
- No unnecessary comments or documentation unless specifically requested

### Testing
- Focus on functionality over test coverage
- Test real implementations, not mocks
- Integration tests are preferred over unit tests

## Project Structure

```
/go/dufflebagbase/
├── cmd/           # Command line tools
├── config/        # Configuration management
├── database/      # Database abstraction layer
├── models/        # Data models
├── services/      # Business logic
├── storage/       # Storage abstraction layer
├── views/         # Templ templates
└── web/           # HTTP handlers
```

## Development Workflow

1. Make changes directly without migration paths
2. Test locally with real services
3. Deploy fresh when ready
4. No need to maintain upgrade paths