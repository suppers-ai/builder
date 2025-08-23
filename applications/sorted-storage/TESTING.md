# Testing Guide for Sorted Storage

This document provides comprehensive information about the testing strategy, setup, and execution
for the Sorted Storage application.

## Overview

The Sorted Storage application implements a comprehensive testing strategy covering:

- **Unit Tests**: Individual component and utility function testing
- **Integration Tests**: Testing component interactions and API integrations
- **End-to-End Tests**: Complete user workflow testing
- **Performance Tests**: Large file operations and scalability testing

## Requirements Coverage

Our test suite addresses the following requirements:

- **8.1**: Performance and reliability testing
- **8.2**: Error handling and user feedback testing
- **8.3**: Layout switching and data integrity testing
- **8.4**: Error recovery and user experience testing
- **8.5**: Large dataset handling and optimization testing

## Test Structure

```
applications/sorted-storage/
├── components/           # Component unit tests
│   ├── *.test.tsx       # React component tests
├── islands/             # Island component tests
│   ├── *.test.tsx       # Interactive component tests
├── lib/                 # Utility function tests
│   ├── *.test.ts        # Pure function tests
├── e2e/                 # End-to-end workflow tests
│   ├── *.test.ts        # User journey tests
├── performance/         # Performance and load tests
│   ├── *.test.ts        # Scalability tests
├── test-setup.ts        # Global test configuration
├── test-runner.ts       # Custom test runner
└── TESTING.md          # This documentation
```

## Running Tests

### Quick Start

```bash
# Run all tests
deno task test

# Run specific test categories
deno task test:unit
deno task test:integration
deno task test:e2e
deno task test:performance

# Run with coverage
deno task test:coverage

# Run with verbose output
deno task test:verbose

# CI/CD mode (fail-fast with coverage)
deno task test:ci
```

### Advanced Usage

```bash
# Run custom test runner with options
deno run --allow-all test-runner.ts --coverage --verbose --fail-fast

# Run specific test files
deno test --allow-all components/FileItem.test.tsx

# Watch mode for development
deno task test:watch
```

## Test Categories

### Unit Tests

**Purpose**: Test individual components and functions in isolation.

**Coverage**:

- All React components (FileItem, FolderItem, Layout, etc.)
- All utility functions (storage-api, auth, error-handler, etc.)
- All islands (StorageDashboardIsland, FileUploadIsland, etc.)

**Example**:

```typescript
Deno.test("FileItem component", async (t) => {
  await t.step("should render file with metadata", () => {
    const mockFile = {/* ... */};
    const { container } = render(<FileItem file={mockFile} />);
    assertEquals(container.textContent?.includes(mockFile.name), true);
  });
});
```

### Integration Tests

**Purpose**: Test component interactions and API integrations.

**Coverage**:

- Component communication
- API service integration
- Layout system integration
- State management across components

**Example**:

```typescript
Deno.test("Layout integration", async (t) => {
  await t.step("should switch layouts and preserve state", async () => {
    const layoutManager = new LayoutManager();
    const items = await loadTestItems();

    const defaultLayout = layoutManager.render(items, "default");
    const timelineLayout = layoutManager.render(items, "timeline");

    assertEquals(defaultLayout.items.length, timelineLayout.items.length);
  });
});
```

### End-to-End Tests

**Purpose**: Test complete user workflows from start to finish.

**Coverage**:

- File upload workflow
- Folder management workflow
- Sharing workflow
- Authentication flow

**Example**:

```typescript
Deno.test("File upload workflow E2E", async (t) => {
  await t.step("should complete single file upload workflow", async () => {
    const testFile = new File(["test content"], "test-file.txt");
    const uploadResult = await simulateFileUpload(testFile);
    assertEquals(uploadResult.success, true);
  });
});
```

### Performance Tests

**Purpose**: Test application performance under load and with large datasets.

**Coverage**:

- Large file upload performance
- Large file list rendering
- Concurrent operations
- Memory usage optimization
- Search performance on large datasets

**Example**:

```typescript
Deno.test("Large file operations performance", async (t) => {
  await t.step("should handle large file upload within acceptable time", async () => {
    const timer = new PerformanceTimer();
    const largeFile = new File(["x".repeat(1000)], "large-file.bin", {
      size: 100 * 1024 * 1024, // 100MB
    });

    timer.start();
    const result = await simulateLargeFileUpload(largeFile);
    const duration = timer.end();

    assertEquals(result.success, true);
    assertEquals(duration < 5000, true); // Under 5 seconds
  });
});
```

## Test Environment Setup

### Global Mocks

The `test-setup.ts` file provides global mocks for:

- **IntersectionObserver**: For lazy loading components
- **File API**: For file upload testing
- **FileReader**: For file processing testing
- **fetch**: For API call mocking
- **localStorage/sessionStorage**: For client-side storage
- **URL.createObjectURL**: For blob URL generation

### Custom Test Runner

The `test-runner.ts` provides:

- **Categorized test execution**: Run specific test types
- **Coverage reporting**: Generate coverage reports
- **Performance metrics**: Track test execution time
- **Parallel execution**: Run tests concurrently
- **Fail-fast mode**: Stop on first failure
- **Verbose output**: Detailed test information

## Coverage Goals

We aim for the following coverage targets:

- **Statements**: 85%+
- **Branches**: 80%+
- **Functions**: 90%+
- **Lines**: 85%+

### Generating Coverage Reports

```bash
# Generate coverage report
deno task test:coverage

# View coverage in browser (if supported)
deno coverage coverage --html
```

## Continuous Integration

### GitHub Actions

The `.github/workflows/test.yml` file provides:

- **Multi-matrix testing**: Test across different Deno versions and test categories
- **Automated linting**: Code quality checks
- **Security scanning**: Dependency vulnerability checks
- **Performance monitoring**: Track performance regressions
- **Coverage reporting**: Upload coverage to external services

### CI Commands

```bash
# Run all CI checks locally
deno task lint
deno task fmt:check
deno task check
deno task test:ci
```

## Writing Tests

### Best Practices

1. **Test Structure**: Use descriptive test names and organize with `t.step()`
2. **Mocking**: Mock external dependencies and API calls
3. **Assertions**: Use specific assertions from `@std/assert`
4. **Cleanup**: Clean up resources and reset state between tests
5. **Performance**: Keep tests fast and focused

### Component Testing

```typescript
import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { MyComponent } from "./MyComponent.tsx";

Deno.test("MyComponent", async (t) => {
  await t.step("should render with default props", () => {
    const { container } = render(<MyComponent />);
    assertExists(container);
  });

  await t.step("should handle user interaction", () => {
    let clicked = false;
    const { container } = render(
      <MyComponent onClick={() => clicked = true} />,
    );

    const button = container.querySelector("button");
    button?.click();
    assertEquals(clicked, true);
  });
});
```

### Utility Testing

```typescript
import { assertEquals, assertThrows } from "@std/assert";
import { myUtilityFunction } from "./my-utility.ts";

Deno.test("myUtilityFunction", async (t) => {
  await t.step("should process valid input", () => {
    const result = myUtilityFunction("valid input");
    assertEquals(result.success, true);
  });

  await t.step("should throw on invalid input", () => {
    assertThrows(
      () => {
        myUtilityFunction(null);
      },
      Error,
      "Invalid input",
    );
  });
});
```

## Debugging Tests

### Common Issues

1. **Import Errors**: Ensure all imports are properly configured in `deno.json`
2. **Mock Issues**: Verify mocks are set up correctly in `test-setup.ts`
3. **Async Issues**: Use proper `await` for async operations
4. **Type Errors**: Fix TypeScript errors before running tests

### Debugging Commands

```bash
# Run single test file with verbose output
deno test --allow-all --verbose components/FileItem.test.tsx

# Run tests with inspector for debugging
deno test --allow-all --inspect-brk components/FileItem.test.tsx

# Check test file syntax
deno check components/FileItem.test.tsx
```

## Performance Benchmarking

### Benchmarking Tests

```typescript
Deno.test("Performance benchmark", async (t) => {
  await t.step("should benchmark file processing", async () => {
    const iterations = 1000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      await processFile(mockFile);
    }

    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;

    console.log(`Average processing time: ${avgTime.toFixed(2)}ms`);
    assertEquals(avgTime < 10, true); // Should be under 10ms per file
  });
});
```

## Contributing

When adding new features:

1. **Write tests first**: Follow TDD principles
2. **Update coverage**: Ensure new code is tested
3. **Run full suite**: Verify all tests pass
4. **Update documentation**: Keep this guide current

### Test Checklist

- [ ] Unit tests for new components/functions
- [ ] Integration tests for component interactions
- [ ] E2E tests for new user workflows
- [ ] Performance tests for scalability concerns
- [ ] Error handling tests for edge cases
- [ ] Documentation updates

## Resources

- [Deno Testing Guide](https://deno.land/manual/testing)
- [Preact Testing Library](https://testing-library.com/docs/preact-testing-library/intro)
- [Fresh Testing Documentation](https://fresh.deno.dev/docs/concepts/testing)
- [Performance Testing Best Practices](https://web.dev/performance-testing/)

## Support

For testing-related questions or issues:

1. Check this documentation first
2. Review existing test files for examples
3. Check the test runner output for specific errors
4. Consult the Deno testing documentation
5. Ask the development team for guidance
