# Quickstart: Tree-Based Sidebar Navigation

**Feature**: 003-move-the-navigation | **Date**: 2025-10-06

## Purpose

This guide provides step-by-step manual testing procedures to validate all functional requirements for the tree-based sidebar navigation system. Each test corresponds to acceptance scenarios from the feature specification.

## Prerequisites

- Development server running (`pnpm run dev`)
- Browser with DevTools open (for localStorage/sessionStorage inspection)
- Test browsers: Chrome, Firefox, Safari (latest versions)
- Mobile device or browser DevTools responsive mode
- Test URLs bookmarked for deep linking tests

## Test Environment Setup

1. **Clear browser storage** (run before each test session):
   ```javascript
   // In browser DevTools console
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Start development server**:
   ```bash
   cd B:\Projects\algo-vis
   pnpm run dev
   ```

3. **Navigate to application**:
   - Open http://localhost:5173 in browser

---

## Test Suite

### Test 1: Sidebar Visibility on Initial Load

**Requirement**: FR-001 (Display sidebar navigation panel)

**Steps**:
1. Navigate to home page (http://localhost:5173)
2. Observe page layout

**Expected Results**:
- ✅ Sidebar visible on left side of screen
- ✅ Sidebar contains collapsible tree structure
- ✅ Top-level categories visible (e.g., "Dynamic Programming", "Graphs")
- ✅ Main content area visible on right side

**Failure Indicators**:
- ❌ Sidebar not rendered
- ❌ Layout broken (sidebar overlaps content)
- ❌ Tree structure not visible

---

### Test 2: Category Expansion

**Requirement**: FR-003, FR-004 (Expand/collapse nodes, show only direct children)

**Steps**:
1. Navigate to home page
2. Observe initial tree state (all categories collapsed)
3. Click "Dynamic Programming" category
4. Observe tree changes
5. Click "Graphs" category (keep DP expanded)
6. Click "Dynamic Programming" again

**Expected Results**:
- ✅ Step 3: "Dynamic Programming" expands, shows direct children (e.g., "2D Array")
- ✅ Step 3: Grandchildren not visible (e.g., "Trapping Rain Water II" still hidden)
- ✅ Step 5: Both "Dynamic Programming" and "Graphs" expanded simultaneously
- ✅ Step 6: "Dynamic Programming" collapses, children hidden

**Failure Indicators**:
- ❌ Clicking category does nothing
- ❌ All descendants visible on first click (grandchildren shown)
- ❌ Previous category collapses when expanding new one
- ❌ Animation glitchy or missing

---

### Test 3: Nested Category Expansion

**Requirement**: FR-010 (Support unlimited nesting depth)

**Steps**:
1. Navigate to home page
2. Click "Dynamic Programming" (level 1)
3. Click "2D Array" subcategory (level 2)
4. Observe tree structure

**Expected Results**:
- ✅ "Dynamic Programming" expands, shows "2D Array"
- ✅ "2D Array" expands, shows algorithms (e.g., "Trapping Rain Water II")
- ✅ Only expanded paths visible
- ✅ Visual indentation shows nesting level

**Failure Indicators**:
- ❌ Cannot expand subcategories
- ❌ Indentation incorrect or missing
- ❌ Tree structure flattens

---

### Test 4: Algorithm Selection

**Requirement**: FR-005, FR-006, FR-009 (Select algorithm, display visualization, indicate active)

**Steps**:
1. Navigate to home page
2. Expand "Dynamic Programming" → "2D Array"
3. Click "Trapping Rain Water II" algorithm
4. Observe URL, main content area, and tree

**Expected Results**:
- ✅ URL changes to `/dynamic-programming/trapping-rain-water-2`
- ✅ Main content area displays "Trapping Rain Water II" visualization
- ✅ "Trapping Rain Water II" node highlighted in tree (e.g., background color change)
- ✅ PlaybackController loads correct algorithm plugin

**Failure Indicators**:
- ❌ URL doesn't change
- ❌ Visualization doesn't load
- ❌ Active state not highlighted
- ❌ Wrong algorithm loaded

---

### Test 5: Sidebar Collapse/Expand

**Requirement**: FR-007, FR-008 (Collapse/expand sidebar, preserve state)

**Steps**:
1. Navigate to home page
2. Expand "Dynamic Programming" → "2D Array"
3. Click sidebar toggle button (collapse)
4. Observe layout
5. Click toggle button again (expand)
6. Observe tree state

**Expected Results**:
- ✅ Step 3: Sidebar slides out of view, main content area expands
- ✅ Step 4: Toggle button still visible (or hamburger menu)
- ✅ Step 5: Sidebar slides back into view
- ✅ Step 5: "Dynamic Programming" and "2D Array" still expanded

**Failure Indicators**:
- ❌ Sidebar disappears instead of sliding
- ❌ Toggle button hidden when collapsed
- ❌ Tree state reset (categories collapsed)
- ❌ Main content doesn't adjust width

---

### Test 6: State Persistence Across Page Reloads

**Requirement**: FR-008 (Preserve navigation state)

**Steps**:
1. Navigate to home page
2. Expand "Dynamic Programming" → "2D Array"
3. Collapse sidebar using toggle button
4. Reload page (F5 or Ctrl+R)
5. Observe tree and sidebar state

**Expected Results**:
- ✅ After reload: "Dynamic Programming" and "2D Array" still expanded
- ✅ After reload: Sidebar collapsed (if using sessionStorage) or open (if using localStorage)
- ✅ Tree expansion state persisted via localStorage

**Verification** (DevTools console):
```javascript
// Check localStorage
JSON.parse(localStorage.getItem('algovis_expanded_nodes'));
// Expected: ["dynamic-programming", "dp-2d-array"]

// Check sessionStorage (if sidebar state stored there)
JSON.parse(sessionStorage.getItem('algovis_sidebar_open'));
// Expected: false (if collapsed)
```

**Failure Indicators**:
- ❌ Tree collapses after reload
- ❌ localStorage not updated
- ❌ Sidebar state not preserved

---

### Test 7: Algorithm Navigation

**Requirement**: FR-005, FR-006 (Navigate between algorithms)

**Steps**:
1. Navigate to `/dynamic-programming/trapping-rain-water-2`
2. Observe visualization and tree
3. Expand "Graphs" → "Path Finding"
4. Click "Unique Paths with Obstacles"
5. Observe URL and content

**Expected Results**:
- ✅ Step 1: "Trapping Rain Water II" visualization loaded and highlighted
- ✅ Step 4: URL changes to `/graphs/unique-paths-obstacles`
- ✅ Step 4: "Unique Paths with Obstacles" visualization replaces previous
- ✅ Step 4: Tree highlights new active algorithm
- ✅ Previous algorithm no longer highlighted

**Failure Indicators**:
- ❌ Both algorithms highlighted
- ❌ Visualization doesn't update
- ❌ URL doesn't change

---

### Test 8: Mobile Drawer Overlay

**Requirement**: FR-012 (Mobile drawer overlay)

**Steps**:
1. Open DevTools responsive mode
2. Set viewport to iPhone SE (375x667)
3. Navigate to home page
4. Observe sidebar behavior
5. Click outside sidebar (on backdrop/overlay)
6. Observe sidebar state

**Expected Results**:
- ✅ Sidebar hidden by default on mobile
- ✅ Hamburger menu button visible
- ✅ Clicking hamburger slides sidebar in from left
- ✅ Backdrop overlay visible behind sidebar
- ✅ Clicking backdrop dismisses sidebar
- ✅ Sidebar animates smoothly (60fps)

**Failure Indicators**:
- ❌ Sidebar always visible (no drawer behavior)
- ❌ No backdrop overlay
- ❌ Cannot dismiss sidebar
- ❌ Animation laggy

---

### Test 9: Tablet Responsive Width

**Requirement**: FR-012a (Tablet responsive width)

**Steps**:
1. Open DevTools responsive mode
2. Set viewport to iPad (768x1024)
3. Navigate to home page
4. Observe sidebar behavior
5. Resize viewport between 768px and 1024px

**Expected Results**:
- ✅ Sidebar visible at narrower width than desktop (e.g., 200px vs 280px)
- ✅ Sidebar fixed position (not drawer overlay)
- ✅ Main content area adjusts width responsively
- ✅ Tree text doesn't wrap awkwardly

**Failure Indicators**:
- ❌ Sidebar same width as desktop
- ❌ Drawer behavior on tablet
- ❌ Content overlap
- ❌ Text truncated or wrapped poorly

---

### Test 10: URL Deep Linking

**Requirement**: FR-013 (Auto-expand path from URL)

**Steps**:
1. Clear browser storage (localStorage.clear())
2. Navigate directly to `/dynamic-programming/trapping-rain-water-2`
3. Observe tree state (all categories should start collapsed)
4. Wait for page load to complete
5. Observe tree expansion

**Expected Results**:
- ✅ "Dynamic Programming" category automatically expanded
- ✅ "2D Array" subcategory automatically expanded
- ✅ "Trapping Rain Water II" algorithm visible and highlighted
- ✅ Full ancestor path visible in tree
- ✅ Visualization loads correctly

**Verification** (DevTools console):
```javascript
// After page load, check expanded nodes
JSON.parse(localStorage.getItem('algovis_expanded_nodes'));
// Expected: ["dynamic-programming", "dp-2d-array"]
```

**Failure Indicators**:
- ❌ Tree remains fully collapsed
- ❌ Algorithm not visible in tree
- ❌ Active algorithm not highlighted
- ❌ Must manually expand to find active item

---

### Test 11: Empty Category Handling

**Requirement**: Edge case handling (deferred clarification)

**Steps**:
1. Temporarily add empty category to navigation tree:
   ```typescript
   {
     type: 'category',
     id: 'sorting',
     label: 'Sorting',
     children: []
   }
   ```
2. Reload page
3. Observe tree rendering

**Expected Results** (per research.md default):
- ✅ Empty category hidden in UI
- ✅ No expand/collapse icon shown
- ✅ No layout issues

**Alternative** (if different behavior implemented):
- ✅ Empty category shown with disabled state
- ✅ Placeholder text visible (e.g., "No algorithms yet")

**Failure Indicators**:
- ❌ Application crashes
- ❌ Layout broken
- ❌ Empty category shown with expand icon

---

### Test 12: Keyboard Navigation

**Requirement**: Accessibility best practice (from research.md)

**Steps**:
1. Navigate to home page
2. Focus sidebar using Tab key
3. Use Arrow keys to navigate tree:
   - Down: Next node
   - Up: Previous node
   - Right: Expand category
   - Left: Collapse category
   - Enter: Select algorithm

**Expected Results**:
- ✅ Focus visible on tree nodes
- ✅ Arrow keys navigate correctly
- ✅ Enter key selects/expands as appropriate
- ✅ Screen reader announces node type and state

**Failure Indicators**:
- ❌ Keyboard navigation doesn't work
- ❌ Focus invisible
- ❌ ARIA attributes missing

---

## Performance Validation

### Test 13: Expansion Animation Performance

**Requirement**: Performance goal (<16ms render for 60fps)

**Steps**:
1. Open DevTools Performance tab
2. Start recording
3. Click category to expand
4. Stop recording
5. Analyze frame timing

**Expected Results**:
- ✅ Expansion animation completes in <200ms total
- ✅ No frames take >16ms (60fps maintained)
- ✅ No layout thrashing visible in flame graph

**Failure Indicators**:
- ❌ Animation laggy or janky
- ❌ Frames exceed 16ms
- ❌ Layout recalculations in hot path

---

### Test 14: Large Tree Performance

**Requirement**: Scalability (up to 100 nodes)

**Steps**:
1. Add 50 algorithm nodes to navigation tree (test fixture)
2. Reload page
3. Expand all categories
4. Observe rendering performance
5. Collapse/expand various categories rapidly

**Expected Results**:
- ✅ Initial render completes in <1 second
- ✅ Tree interactions remain smooth (60fps)
- ✅ Memory usage reasonable (<50MB for tree)

**Failure Indicators**:
- ❌ Slow initial render (>2 seconds)
- ❌ Laggy interactions
- ❌ Memory leak (usage grows indefinitely)

---

## Cross-Browser Testing

### Test 15: Browser Compatibility

**Browsers**: Chrome, Firefox, Safari, Edge (latest versions)

**Steps**:
1. Run Tests 1-10 in each browser
2. Verify identical behavior
3. Check DevTools console for errors

**Expected Results**:
- ✅ All tests pass in all browsers
- ✅ No console errors
- ✅ Visual appearance consistent

**Known Limitations**:
- Safari: localStorage may be cleared on privacy settings

---

## Regression Testing

### Test 16: Existing Playback Controller Integration

**Requirement**: No breaking changes to existing functionality

**Steps**:
1. Navigate to `/dynamic-programming/trapping-rain-water-2`
2. Use playback controls (play, pause, step, speed)
3. Switch to different algorithm
4. Use playback controls again

**Expected Results**:
- ✅ PlaybackController still works correctly
- ✅ Trace generation not affected
- ✅ Algorithm plugins load properly
- ✅ No regressions in visualization rendering

**Failure Indicators**:
- ❌ Playback controls broken
- ❌ Visualization doesn't animate
- ❌ Algorithm switching broken

---

## Accessibility Testing

### Test 17: Screen Reader Compatibility

**Requirement**: ARIA Tree View pattern compliance

**Steps**:
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate to sidebar
3. Explore tree using screen reader

**Expected Results**:
- ✅ Tree announced as "navigation tree"
- ✅ Categories announced as "category, collapsed/expanded"
- ✅ Algorithms announced as "link, [algorithm name]"
- ✅ Active algorithm announced as "selected"

**ARIA Attributes to Verify** (DevTools inspector):
```html
<nav role="tree" aria-label="Algorithm categories">
  <div role="treeitem" aria-expanded="false">Dynamic Programming</div>
  <a role="treeitem" aria-selected="true" href="/...">Trapping Rain Water II</a>
</nav>
```

---

## Bug Reporting Template

When a test fails, report using this format:

```markdown
**Test**: [Test number and name]
**Browser**: [Browser name and version]
**Viewport**: [Desktop/Tablet/Mobile, dimensions]
**Steps to Reproduce**:
1. Step 1
2. Step 2

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Screenshots**: [Attach if applicable]
**Console Errors**: [Copy any errors from DevTools]
```

---

## Automation Readiness

These manual tests should be converted to automated E2E tests using:
- **Tool**: Playwright or Vitest browser mode
- **Test file**: `tests/integration/sidebar-navigation.test.ts`
- **Coverage**: All 17 tests above

Automation priority order:
1. Tests 1-7 (core functionality)
2. Test 10 (deep linking)
3. Tests 8-9 (responsive)
4. Tests 13-14 (performance)
5. Tests 15-17 (accessibility)

---

## Quick Validation Checklist

Before marking feature as complete, verify:

- [ ] All 17 tests pass in Chrome
- [ ] Tests 1-10 pass in Firefox and Safari
- [ ] Mobile drawer works on real iOS/Android device
- [ ] No console errors or warnings
- [ ] Performance profiling shows <16ms frames
- [ ] localStorage persists correctly across sessions
- [ ] Deep linking works for all algorithm URLs
- [ ] Playback controller still works (no regressions)
- [ ] ARIA attributes present and correct
- [ ] Code review passed
- [ ] Unit tests pass (NavigationState logic)
- [ ] E2E tests implemented and passing

---

## Troubleshooting

**Problem**: Tree state not persisting
- Check: `localStorage.getItem('algovis_expanded_nodes')` in console
- Fix: Ensure NavigationState.persist() called on toggle

**Problem**: Active algorithm not highlighted
- Check: URL params match algorithm node ID
- Fix: Verify `activeAlgorithmId` derived from route correctly

**Problem**: Mobile drawer not dismissing
- Check: Backdrop click handler attached
- Fix: Ensure overlay z-index above sidebar

**Problem**: Deep linking not expanding path
- Check: NavigationState.expandPath() called in +page.ts load function
- Fix: Verify ancestor ID calculation logic

**Problem**: Animation laggy
- Check: DevTools Performance tab for layout thrashing
- Fix: Use CSS transforms (not left/top), avoid forced reflows

---

## References

- **Feature Spec**: `specs/003-move-the-navigation/spec.md`
- **Research**: `specs/003-move-the-navigation/research.md`
- **Data Model**: `specs/003-move-the-navigation/data-model.md`
- **Contracts**: `specs/003-move-the-navigation/contracts/navigation-tree-schema.ts`
