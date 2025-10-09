# Quickstart: GCD Array Visualization

**Feature**: Find Greatest Common Divisor of Array
**Purpose**: End-to-end validation of multi-phase visualization framework
**Estimated Time**: 3-5 minutes

## Prerequisites

- Development server running (`pnpm dev`)
- Browser with DevTools open (for performance verification)
- All implementation tasks complete (see tasks.md)

## Test Scenario

This quickstart validates the primary user story from the feature spec:
> A student learning algorithms wants to understand how to find the greatest common divisor (GCD) of an array efficiently. They select the "Find GCD of Array" algorithm from the visualization library, choose a preset example or enter their own array, and watch the step-by-step execution.

## Step-by-Step Validation

### 1. Navigate to Algorithm Page

**Action**:
1. Open browser to `http://localhost:5173` (or dev server URL)
2. Click sidebar hamburger menu (if on mobile/tablet)
3. Expand "Math" category in navigation tree
4. Expand "Number Theory" subcategory
5. Click "Find GCD of Array"

**Expected Result**:
- ✅ Page loads at `/math/number-theory/find-gcd-array`
- ✅ Page title displays "Find GCD of Array"
- ✅ Algorithm description explains min/max search + Euclidean algorithm
- ✅ Preset selector shows 5 options:
  - Simple Case
  - Common Factors
  - Extreme Range
  - All Same
  - Fibonacci Worst-Case

**Validation**: Navigation tree, routing, and plugin metadata work correctly.

---

### 2. Select Fibonacci Preset

**Action**:
1. Click preset dropdown
2. Select "Fibonacci Worst-Case"

**Expected Result**:
- ✅ Input field populates with `[233, 377]`
- ✅ Preset description appears: "Consecutive Fibonacci numbers require maximum Euclidean steps"
- ✅ Visualization initializes but hasn't started playing yet

**Validation**: Preset loading and input population work.

---

### 3. Start Visualization

**Action**:
1. Click "Play" button in playback controls

**Expected Result**:
- ✅ **Phase 1 (Min/Max Search)** begins:
  - Array `[233, 377]` displays horizontally
  - First element (233) highlights with "focus" role
  - Min/Max indicators initialize
  - Step counter shows "Step 1 of ~15" (approximate)
  - Description reads: "Examining element at index 0 (value: 233)"

**Validation**: Phase 1 rendering and playback start correctly.

---

### 4. Observe Min/Max Search Phase

**Action**:
1. Watch automatic playback through first ~3 steps
2. Pause playback
3. Click "Step Forward" button twice
4. Click "Step Backward" button once

**Expected Result**:
- ✅ Each step highlights the current element being examined
- ✅ Min indicator moves to index 0 (value 233) and stays there
- ✅ Max indicator moves to index 1 (value 377) and stays there
- ✅ Descriptions accurately reflect current operation
- ✅ Step forward/backward work smoothly
- ✅ Phase 1 section label reads "Finding Min & Max"

**Validation**: ArrayRenderer highlights, step navigation, and phase metadata display correctly.

---

### 5. Observe Phase Transition

**Action**:
1. Click "Play" button to resume
2. Watch until Phase 1 completes

**Expected Result**:
- ✅ **Phase transition occurs** (smooth, no flicker)
- ✅ **Phase 2 (GCD Computation)** begins:
  - Array renderer disappears
  - ScalarPairRenderer appears showing `m = 377, n = 233`
  - Operation display shows "377 % 233 = 144"
  - Next step preview: "m=233, n=144"
  - Phase section label reads "Computing GCD"

**Validation**: Phase container auto-switches based on trace metadata.

---

### 6. Observe GCD Computation Phase

**Action**:
1. Continue watching or step through GCD computation
2. Count the number of Euclidean algorithm iterations

**Expected Result**:
- ✅ Each step shows:
  - Current `m` and `n` values
  - Modulo operation (e.g., "233 % 144 = 89")
  - Next values after swap
- ✅ Values follow expected Euclidean sequence:
  ```
  (377, 233) → (233, 144) → (144, 89) → (89, 55) →
  (55, 34) → (34, 21) → (21, 13) → (13, 8) →
  (8, 5) → (5, 3) → (3, 2) → (2, 1) → (1, 0)
  ```
- ✅ Final step shows `m = 1, n = 0` with "GCD = 1" message
- ✅ Approximately 12-13 steps for this phase

**Validation**: ScalarPairRenderer displays correctly, Euclidean algorithm logic is correct.

---

### 7. Test Custom Input

**Action**:
1. Click "Reset" button
2. Clear input field
3. Enter custom array: `[12, 18, 24]`
4. Click "Generate Trace" (or equivalent button)
5. Click "Play"

**Expected Result**:
- ✅ Input validates successfully
- ✅ New trace generates
- ✅ Phase 1 shows array `[12, 18, 24]`
- ✅ Min = 12 (index 0), Max = 24 (index 2)
- ✅ Phase 2 computes GCD(12, 24):
  ```
  (24, 12) → (12, 0)
  → GCD = 12
  ```
- ✅ Final result displays: "GCD = 12"

**Validation**: Custom input, validation, and trace generation work.

---

### 8. Test Input Validation

**Action**:
1. Try invalid inputs:
   - Empty array: `[]`
   - Out of range: `[0, 5, 10]`
   - Too many elements: `[1, 2, 3, ...]` (1001 elements)
   - Non-integers: `[1.5, 2.7]`

**Expected Result**:
- ✅ Each invalid input shows appropriate error message:
  - "Array must contain at least 1 element"
  - "Values must be between 1 and 10000"
  - "Array cannot exceed 1000 elements"
  - "Values must be integers"
- ✅ Trace generation is blocked until input is valid

**Validation**: Zod schema validation working (FR-009).

---

### 9. Performance Verification

**Action**:
1. Open DevTools Performance tab
2. Start recording
3. Load preset "Simple Case" (`[2, 5, 6, 9, 10]`)
4. Click "Play" and let visualization complete
5. Stop recording

**Expected Result**:
- ✅ Trace generation time <100ms (check console.time or Performance timeline)
- ✅ Frame rendering consistently <16ms (60fps)
- ✅ No layout thrashing (check "Rendering" section)
- ✅ CSS animations use `transform` (GPU-accelerated)

**Validation**: Performance meets Constitutional Principle V (FR-013, FR-014).

---

### 10. Accessibility Check

**Action**:
1. Navigate page using only keyboard (Tab, Enter, Arrow keys)
2. Run DevTools Lighthouse accessibility audit
3. Test with screen reader (optional)

**Expected Result**:
- ✅ All interactive elements keyboard-accessible
- ✅ Playback controls have clear focus indicators
- ✅ Phase sections have ARIA labels
- ✅ Highlighted array elements have role annotations
- ✅ Lighthouse accessibility score >90

**Validation**: Accessible to all users.

---

## Success Criteria

All checkboxes above must pass (✅) for quickstart validation to succeed.

**Summary Checklist**:
- [ ] Navigation to algorithm page works
- [ ] All 5 presets load correctly
- [ ] Phase 1 (Min/Max Search) renders and animates properly
- [ ] Phase transition is smooth and automatic
- [ ] Phase 2 (GCD Computation) renders correctly
- [ ] Custom input accepts valid arrays
- [ ] Input validation rejects invalid arrays
- [ ] Performance targets met (<100ms trace, 60fps render)
- [ ] Keyboard navigation works
- [ ] Accessibility audit passes

## Troubleshooting

### Issue: Phase 2 doesn't appear
- Check: ExecutionStep includes `phaseId: 'gcd-computation'`
- Check: PhaseContainer receives `phases` prop with both phase definitions

### Issue: Highlights don't update
- Check: ArrayRenderer receives new `highlight` prop on each step
- Check: Svelte reactivity triggers (use `$derived` or `$state`)

### Issue: Performance <60fps
- Check: CSS animations use `transform`, not `width`/`height`
- Check: Virtualization enabled for arrays >100 elements (if implemented)
- Check: Browser DevTools Performance tab for bottlenecks

## Next Steps

After quickstart passes:
1. Run full test suite: `pnpm test`
2. Check coverage: `pnpm test:coverage`
3. Build production: `pnpm build`
4. Deploy to staging environment
5. Update CLAUDE.md with multi-phase patterns

---

**Estimated Execution Time**: 3-5 minutes (manual testing)
**Automated Equivalent**: See `tests/integration/gcd-visualization.test.ts`
