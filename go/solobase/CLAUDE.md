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

### CSS Guidelines
**IMPORTANT**: When working with CSS in this project:
- ALWAYS use the common CSS files when possible:
  - `/static/css/variables.css` - For all CSS variables
  - `/static/css/common/base.css` - For typography and resets
  - `/static/css/common/buttons.css` - For all button styles
  - `/static/css/common/cards.css` - For card and panel components
  - `/static/css/common/forms.css` - For form elements and inputs
  - `/static/css/common/utilities.css` - For utility classes
  - `/static/css/tables.css` - For table styles
- Import common styles via `/static/css/common.css` in templates
- Avoid creating duplicate styles - check common files first
- Keep page-specific styles minimal and focused
- Use CSS variables from `variables.css` for consistency
- Maintain the glass morphism design pattern (transparent backgrounds with blur)

### Testing
- Focus on functionality over test coverage
- Test real implementations, not mocks
- Integration tests are preferred over unit tests

## Project Structure

```
/go/solobase/
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