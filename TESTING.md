# Testing Guide

## Overview

DreamTheater engine has comprehensive test coverage across all core modules.

## Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
node --loader ts-node/esm --test tests/parse.test.mjs
```

## Test Coverage

### ✅ Parser Tests (18 tests)
**File:** `tests/parse.test.mjs`

Tests for DSL parsing including:
- World name extraction
- Scene definitions (with/without hints, empty actions)
- Rule annotations (@flow, @guard, @effect, @system, @physics)
- Multiple scenes and rules
- Edge cases (CRLF, hyphens, underscores)

### ✅ Engine Tests (7 tests)
**File:** `tests/engine.simple.test.mjs`

Tests for state machine execution:
- Default state initialization
- Simple flow triggers
- AND conditions
- Comparison operators (==, !=, >, <, >=, <=)
- Scene comparisons
- History tracking

### ✅ Effects Tests (7 tests)
**File:** `tests/effects.simple.test.mjs`

Tests for all built-in effects:
- `goto()` - scene transitions
- `reveal()` - counter increments
- `announce()` - message accumulation
- `clearAnnouncements()` - message clearing
- `finish()` - end state
- `block()` - blocked state
- Integration tests

### ✅ Validation Tests (9 tests)
**File:** `tests/validation.test.mjs`

Tests for error detection and validation:
- Missing scene descriptions
- Undefined goto targets
- Unreachable scenes
- Multiple error accumulation
- Error structure validation

### ✅ Integration Tests (3 tests)
**File:** `tests/dreamflow.test.mjs`

End-to-end tests using the real `dreamflow.dsl`:
- Full world parsing
- Guard rule enforcement
- Complete playthrough

## Test Statistics

- **Total Tests:** 43
- **Pass Rate:** 100%
- **Coverage Areas:**
  - Parser: ✅
  - Engine: ✅
  - Effects: ✅
  - Validation: ✅
  - Integration: ✅

## Error Handling

The parser now returns validation errors and warnings:

```typescript
type ParsedDSL = {
  world?: string;
  rules: Rule[];
  scenes: Record<string, SceneDefinition>;
  errors: ParseError[]; // New!
};

type ParseError = {
  type: 'error' | 'warning';
  message: string;
  line?: number;
  context?: string;
};
```

### Error Types

**Errors:**
- Missing scene descriptions

**Warnings:**
- Goto targets that don't exist
- Scenes with no incoming flows

## Adding New Tests

1. Create a new test file in `tests/` with `.test.mjs` extension
2. Import test utilities:
   ```javascript
   import test from 'node:test';
   import assert from 'node:assert/strict';
   ```
3. Import modules to test:
   ```javascript
   const { parseDSL } = await import('../src/lib/engine/parse.ts');
   ```
4. Write tests using node:test API
5. Run `npm run test` to verify

## Best Practices

- ✅ Test happy paths and edge cases
- ✅ Use descriptive test names
- ✅ Keep tests focused and isolated
- ✅ Verify both success and failure scenarios
- ✅ Check error messages for clarity

## Future Testing Goals

- [ ] Add test coverage reporting
- [ ] Set up CI/CD pipeline
- [ ] Add performance benchmarks
- [ ] Test DSL linter (when implemented)
- [ ] Test multi-world support (when implemented)
