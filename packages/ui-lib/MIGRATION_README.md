# DaisyUI 5 & Tailwind 4 Migration Tools

This directory contains comprehensive tools for migrating the UI library from DaisyUI 4 to DaisyUI 5 and Tailwind CSS 3 to Tailwind CSS 4.

## 🚀 Quick Start

### Analyze Components
```bash
deno run --allow-read --allow-write migration-cli.ts analyze ./components
```

### Preview Migration
```bash
deno run --allow-read --allow-write migration-cli.ts preview ./components/Button.tsx
```

### Migrate Components
```bash
# Dry run first
deno run --allow-read --allow-write migration-cli.ts migrate ./components --dry-run

# Actual migration (creates backups)
deno run --allow-read --allow-write migration-cli.ts migrate ./components
```

## 📁 File Structure

```
packages/ui-lib/
├── migration-cli.ts                    # CLI tool for migration
├── utils/
│   ├── migration-utilities.ts          # Core migration functions
│   ├── migration-utilities.test.ts     # Tests for migration utilities
│   ├── migration-analysis.ts           # Component analysis tools
│   ├── migration-analysis.test.ts      # Tests for analysis tools
│   ├── migration-tracking.ts           # Migration progress tracking
│   └── mod.ts                          # Module exports
└── MIGRATION_README.md                 # This file
```

## 🛠️ Tools Overview

### 1. Migration Utilities (`migration-utilities.ts`)

Core functions for class mapping and file migration:

- **Class Mapping**: Comprehensive mappings from DaisyUI 4 to 5 and Tailwind 3 to 4
- **File Migration**: Single file and batch processing
- **Backup Management**: Automatic backup creation and rollback
- **Preview Mode**: See changes before applying them

#### Key Functions:
- `applyDaisyUIMigrations()` - Apply DaisyUI class updates
- `applyTailwindMigrations()` - Apply Tailwind class updates
- `migrateFile()` - Migrate a single file
- `migrateDirectory()` - Batch migrate multiple files
- `previewMigration()` - Preview changes without applying

### 2. Migration Analysis (`migration-analysis.ts`)

Advanced component analysis and validation:

- **Component Analysis**: Identify DaisyUI, Tailwind, and custom classes
- **Breaking Change Detection**: Identify potential issues
- **Complexity Assessment**: Estimate migration effort
- **Validation**: Check for common issues and best practices

#### Key Functions:
- `analyzeComponent()` - Basic component analysis
- `performEnhancedAnalysis()` - Comprehensive analysis with complexity scoring
- `validateComponent()` - Validate component for issues
- `batchAnalyzeComponents()` - Analyze multiple components
- `generateAnalysisReport()` - Create detailed reports

### 3. Migration CLI (`migration-cli.ts`)

Command-line interface for all migration operations:

```bash
# Available commands
analyze <directory>     # Analyze components for migration complexity
migrate <directory>     # Migrate all components in directory
migrate-file <file>     # Migrate a single file
preview <file>          # Preview migration changes without applying
stats <directory>       # Get migration statistics
rollback <directory>    # Rollback migrations using backup files
help                    # Show help message
```

## 📊 Migration Statistics

Current UI library statistics:
- **Total Files**: 462 component files
- **Files with DaisyUI Classes**: 78
- **Files with Tailwind Classes**: 143
- **Files with Both Frameworks**: 61
- **Estimated Changes**: 2,040

## 🔄 Class Mappings

### DaisyUI 4 → 5 Mappings

#### Loading Classes
- `loading` → `loading loading-spinner`
- `loading-dots` → `loading loading-dots`
- `loading-ring` → `loading loading-ring`
- `loading-ball` → `loading loading-ball`

#### Button Classes
- Most button classes remain compatible
- Verification needed for styling consistency

#### Input Classes
- Most input classes remain compatible
- Color variants need verification

#### Card Classes
- Card structure remains compatible
- Spacing and layout need verification

### Tailwind 3 → 4 Mappings

#### Color System
- `text-gray-*` → `text-slate-*`
- `bg-gray-*` → `bg-slate-*`
- `border-gray-*` → `border-slate-*`
- `ring-gray-*` → `ring-slate-*`

#### Other Classes
- Most utility classes remain compatible
- Typography and spacing scales preserved

## 🧪 Testing

### Run All Tests
```bash
# Migration utilities tests
deno test --allow-read --allow-write utils/migration-utilities.test.ts

# Migration analysis tests
deno test --allow-read --allow-write utils/migration-analysis.test.ts
```

### Test Coverage
- ✅ Class detection and mapping
- ✅ File migration with backup
- ✅ Batch processing
- ✅ Component analysis
- ✅ Validation and error handling
- ✅ CLI functionality

## 📈 Migration Workflow

### Phase 1: Analysis
1. Run component analysis to understand scope
2. Review high-complexity components
3. Plan migration order based on dependencies

### Phase 2: Preview
1. Preview changes for critical components
2. Validate migration mappings
3. Test with sample components

### Phase 3: Migration
1. Start with low-complexity components
2. Migrate in batches by category
3. Test after each batch
4. Address any issues before proceeding

### Phase 4: Validation
1. Run comprehensive tests
2. Visual regression testing
3. Performance validation
4. Documentation updates

## 🚨 Safety Features

### Automatic Backups
- All migrations create `.backup` files
- Rollback functionality available
- Dry-run mode for safe previewing

### Validation
- Syntax validation before migration
- Breaking change detection
- Accessibility checks
- Performance warnings

### Error Handling
- Graceful error recovery
- Detailed error reporting
- Progress tracking
- Partial migration support

## 📋 Migration Checklist

### Before Migration
- [ ] Run analysis to understand scope
- [ ] Review high-complexity components
- [ ] Test migration tools on sample files
- [ ] Ensure backup strategy is in place

### During Migration
- [ ] Migrate in small batches
- [ ] Test after each batch
- [ ] Monitor for breaking changes
- [ ] Update documentation as needed

### After Migration
- [ ] Run comprehensive tests
- [ ] Visual regression testing
- [ ] Performance validation
- [ ] Update component documentation
- [ ] Clean up backup files

## 🔧 Configuration

### File Extensions
Default: `tsx`, `jsx`, `ts`, `js`

Customize with `--extensions` flag:
```bash
deno run --allow-read --allow-write migration-cli.ts analyze ./components --extensions tsx,jsx
```

### Output Options
Save reports to files:
```bash
deno run --allow-read --allow-write migration-cli.ts analyze ./components --output analysis-report.md
```

### Verbose Mode
Get detailed output:
```bash
deno run --allow-read --allow-write migration-cli.ts migrate ./components --verbose
```

## 🐛 Troubleshooting

### Common Issues

#### Permission Errors
Ensure you have read/write permissions:
```bash
deno run --allow-read --allow-write migration-cli.ts <command>
```

#### File Not Found
Check file paths are relative to current directory:
```bash
# Correct
deno run --allow-read --allow-write migration-cli.ts preview ./components/Button.tsx

# Incorrect
deno run --allow-read --allow-write migration-cli.ts preview components/Button.tsx
```

#### Migration Failures
1. Check backup files exist
2. Review error messages
3. Use rollback if needed:
```bash
deno run --allow-read --allow-write migration-cli.ts rollback ./components
```

### Getting Help
```bash
deno run --allow-read --allow-write migration-cli.ts help
```

## 🤝 Contributing

### Adding New Mappings
1. Update `DAISYUI_CLASS_MIGRATIONS` or `TAILWIND_CLASS_MIGRATIONS` in `migration-utilities.ts`
2. Add corresponding tests
3. Update documentation

### Improving Analysis
1. Enhance patterns in `migration-analysis.ts`
2. Add new validation rules
3. Update complexity scoring

### CLI Enhancements
1. Add new commands to `migration-cli.ts`
2. Update help text
3. Add corresponding functionality

## 📚 References

- [DaisyUI 5 Documentation](https://daisyui.com/)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/)
- [Migration Specification](.kiro/specs/daisyui-5-tailwind-4-migration/)

## 📄 License

This migration tooling is part of the UI library project and follows the same license terms.