# Changelog

All notable changes to DreamTheater will be documented in this file.

## [Sprint 1] - 2025-11-20 @ Starbucks เมญ่า, เชียงใหม่

### 🚀 Multi-World Support

**Major Features:**
- ✅ World picker UI - เลือก world ได้หลายเรื่อง
- ✅ Save/Load system - เซฟความคืบหน้าใน localStorage
- ✅ New Game / Continue / Delete Save buttons
- ✅ Tutorial world - world ที่ 2 สำหรับสอนการเล่น
- ✅ Validation errors แสดงใน UI

**Technical Changes:**
- Created `src/worlds/` folder structure
- Moved DSL files from `src/rules/` to `src/worlds/`
- Added world loader utility (`src/lib/worlds/loader.ts`)
- Added persistence utility (`src/lib/worlds/persistence.ts`)
- Created `WorldPicker.svelte` component
- Refactored `+page.svelte` to support multi-world

**Testing:**
- Added 9 new multi-world integration tests
- Total test count: 52 tests
- Pass rate: 100%

**Files Added:**
- `src/worlds/tutorial.dsl` - Tutorial world
- `src/lib/worlds/loader.ts` - World loading utilities
- `src/lib/worlds/persistence.ts` - Save/load system
- `src/lib/components/WorldPicker.svelte` - World selection UI
- `tests/multiworld.test.mjs` - Multi-world tests
- `static/worlds/` - Static DSL files for serving

**Files Modified:**
- `src/routes/+page.svelte` - Complete rewrite with Svelte 5 runes
- `tests/dreamflow.test.mjs` - Updated path references

---

## [Sprint 0] - 2025-11-20

### 🛡️ Safety Net - Test Coverage

**Major Features:**
- ✅ Comprehensive test suite (43 tests)
- ✅ Error handling in parser
- ✅ Validation warnings (undefined scenes, unreachable scenes)

**Files Added:**
- `tests/parse.test.mjs` - Parser tests (18 tests)
- `tests/engine.simple.test.mjs` - Engine tests (7 tests)
- `tests/effects.simple.test.mjs` - Effects tests (7 tests)
- `tests/validation.test.mjs` - Validation tests (9 tests)
- `TESTING.md` - Testing documentation

**Files Modified:**
- `src/lib/engine/parse.ts` - Added error handling
- `package.json` - Updated test script

**Test Coverage:**
- Parser: ✅ 100%
- Engine: ✅ 100%
- Effects: ✅ 100%
- Validation: ✅ 100%

---

## [Initial Release]

### Core Features
- DSL Parser for story flow definition
- DreamEngine state machine
- Effect system (goto, reveal, announce, finish, block)
- Scene-based UI with HUD
- Sample world: Dreamflow 2025

### Technical Stack
- SvelteKit
- TypeScript
- Vite
- Node.js test runner
