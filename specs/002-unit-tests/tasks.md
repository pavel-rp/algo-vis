# Tasks: Unit Test Suite

**Feature**: 002-unit-tests
**Created**: 2025-10-05

## Task List

### Phase 1: Test Infrastructure Setup
- [ ] **T001** Configure Vitest in vite.config.ts with coverage options (@vitest/coverage-v8)
- [ ] **T002** Install test dependencies: `pnpm add -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/svelte happy-dom`
- [ ] **T003** Add test scripts to package.json: `test`, `test:ui`, `test:coverage`, `test:watch`
- [ ] **T004** Create vitest.config.ts with happy-dom environment and coverage thresholds (80% critical, 60% UI)

### Phase 2: Core Component Tests
- [ ] **T005** Write PlaybackController.test.ts covering all methods (play, pause, stepForward, stepBack, reset, setSpeed, loadTrace)
- [ ] **T006** Write validation.test.ts for validateTrace and validateFrameSequence functions
- [ ] **T007** Write trappingRainWater2 plugin tests verifying trace output schema and input validation
- [ ] **T008** Write uniquePathsWithObstacles plugin tests verifying trace output and validation

### Phase 3: UI Component Tests
- [ ] **T009** Write GridRenderer.test.ts testing rendering modes (height, obstacle, dp) and cell highlighting
- [ ] **T010** Write PlaybackControls.test.ts testing button interactions and disabled states
- [ ] **T011** Write SpeedControl.test.ts testing speed changes and range validation
- [ ] **T012** Write StatusPanel.test.ts testing display of frame data

### Phase 4: Coverage & CI
- [ ] **T013** Run coverage report and ensure thresholds met
- [ ] **T014** Create GitHub Actions workflow for running tests on PR
- [ ] **T015** Add coverage badge to README

## Implementation Order

Execute in sequence:
1. T001-T004 (infrastructure)
2. T005-T008 (core tests - critical path)
3. T009-T012 (UI tests)
4. T013-T015 (coverage & CI)
