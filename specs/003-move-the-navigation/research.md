# Research: Tree-Based Sidebar Navigation

**Feature**: 003-move-the-navigation
**Date**: 2025-10-06

## Technology Decisions

### 1. State Management: Svelte 5 Runes

**Decision**: Use `$state()` and `$derived()` runes for tree expansion state

**Rationale**:
- Native reactivity without external dependencies
- Aligns with existing `PlaybackController.svelte.ts` pattern
- Class-based state management with fine-grained reactivity
- Better performance than stores for frequently updated UI state

**Alternatives Considered**:
- **Svelte Stores**: Rejected - additional boilerplate, less ergonomic for class-based patterns
- **Context API**: Rejected - overkill for component-local state, adds complexity

**Implementation Pattern**:
```typescript
class NavigationState {
  expandedNodes = $state(new Set<string>());
  activeAlgorithmId = $state<string | null>(null);

  toggle(nodeId: string) {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
  }
}
```

### 2. Routing: SvelteKit File-Based

**Decision**: Dynamic routes `/[category]/[algorithm]` with optional catch-all

**Rationale**:
- Enables deep linking (FR-013) without query param pollution
- SEO-friendly URLs
- Natural integration with SvelteKit's prerendering
- Supports future static site generation

**Alternatives Considered**:
- **Query Parameters** (`?alg=dijkstra`): Rejected - less semantic, breaks back button expectations
- **Hash Routing** (`#/graphs/dijkstra`): Rejected - no SSR, poor SEO
- **Single Route with State**: Rejected - loses URL sharability

**Route Structure**:
```
/                                    → Home (default algorithm)
/[category]/[algorithm]              → Algorithm detail page
/[category]/[algorithm]/[...rest]    → Future: algorithm variants
```

### 3. Tree Rendering: Recursive Components

**Decision**: `TreeNode.svelte` recursively renders itself for children

**Rationale**:
- Unlimited nesting support (FR-010) out of the box
- Clean declarative syntax
- Minimal code complexity
- Standard pattern in tree UIs

**Alternatives Considered**:
- **Flat List with Indentation**: Rejected - requires manual parent tracking, complex visible node calculation
- **Virtual Scrolling Library**: Rejected - premature optimization (tree unlikely to exceed 100 nodes)

**Component Structure**:
```svelte
<!-- TreeNode.svelte -->
{#if node.type === 'category'}
  <button onclick={() => onToggle(node.id)}>
    {node.label}
  </button>
  {#if isExpanded}
    {#each node.children as child}
      <svelte:self node={child} level={level + 1} {onToggle} {onSelect} />
    {/each}
  {/if}
{:else}
  <a href="/{node.path}" class:active={isActive}>
    {node.label}
  </a>
{/if}
```

### 4. Mobile UI: CSS Transform Drawer

**Decision**: Fixed positioning + `translateX()` transform for slide animation

**Rationale**:
- 60fps animations (GPU-accelerated)
- No JavaScript animation libraries
- Full control over timing/easing
- Works across all modern browsers

**Alternatives Considered**:
- **`<dialog>` Element**: Rejected - less control over slide direction, accessibility overkill for sidebar
- **JS Animation Library** (e.g., Motion One): Rejected - unnecessary dependency for simple slide
- **View Transitions API**: Rejected - limited browser support (2024)

**CSS Implementation**:
```css
.sidebar {
  position: fixed;
  transform: translateX(-100%);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.open {
  transform: translateX(0);
}

@media (min-width: 768px) {
  .sidebar {
    transform: none; /* Always visible on tablet+ */
  }
}
```

### 5. State Persistence: Web Storage API

**Decision**: `localStorage` for tree expansion, `sessionStorage` for sidebar visibility

**Rationale**:
- Survives page reloads (FR-008)
- Simple JSON serialization
- No backend required
- Scoped to origin (no cross-site leakage)

**Alternatives Considered**:
- **URL State**: Rejected - clutters URLs with UI state
- **Cookies**: Rejected - unnecessary HTTP overhead
- **IndexedDB**: Rejected - overkill for small key-value data

**Storage Schema**:
```typescript
// localStorage.algov

is_expanded_nodes
{
  "graphs": true,
  "graphs-shortest-path": true,
  "dp": false
}

// sessionStorage.algovis_sidebar_open
true | false
```

## Best Practices

### Svelte 5 Component Patterns

**Source**: [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)

- Use `$state()` for reactive class properties
- Use `$derived()` for computed values
- Use `$effect()` sparingly (only for side effects like localStorage sync)
- Avoid `$bindable()` for tree state (one-way data flow cleaner)

### SvelteKit Routing

**Source**: [SvelteKit Documentation - Routing](https://kit.svelte.dev/docs/routing)

- Use `+page.ts` for load functions (fetch algorithm plugin metadata)
- Use `+layout.svelte` for shared sidebar (appears on all routes)
- Use `goto()` for programmatic navigation (keyboard shortcuts)
- Use `$page.url.pathname` for active route detection

### Accessibility

**Source**: [W3C ARIA Authoring Practices - Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)

- `role="tree"` on container, `role="treeitem"` on nodes
- `aria-expanded="true|false"` on category nodes
- `aria-selected="true"` on active algorithm
- Arrow key navigation (up/down/left/right)
- Enter/Space to select

### Performance

**Source**: [web.dev - Rendering Performance](https://web.dev/articles/rendering-performance)

- Use CSS `transform` (not `left/right`) for animations
- Avoid layout thrashing (batch DOM reads/writes)
- Use `requestAnimationFrame` for scroll position calculations
- Debounce localStorage writes (avoid blocking main thread)

## Integration Points

### Existing Codebase

**PlaybackController.svelte.ts**:
- No changes required
- Navigation selects algorithm → controller loads trace

**Plugin System**:
- Add metadata: `category: string, subcategory?: string`
- Example:
  ```typescript
  export const trappingRainWater2Plugin: AlgorithmPlugin = {
    id: 'trapping-rain-water-2',
    name: 'Trapping Rain Water II',
    category: 'Dynamic Programming',
    subcategory: '2D Array',
    // ...existing fields
  }
  ```

**+page.svelte**:
- Remove inline algorithm/preset selectors
- Keep visualization area + playback controls
- Algorithm loaded from route params

### New Dependencies

**None** - All features implementable with existing dependencies:
- Svelte 5: Already in use
- SvelteKit: Routing built-in
- Tailwind CSS: Styling framework
- Zod: Schema validation (already in use for plugin validation)

## Risk Mitigation

### Svelte 5 Runes Stability

**Risk**: Runes API is new (Svelte 5.0 released Oct 2024)

**Mitigation**:
- Keep state management simple (Set/Map primitives)
- Avoid complex `$derived` chains
- Fallback: Can refactor to stores if runes prove unstable

### Mobile Performance

**Risk**: Tree with 50+ nodes may lag on low-end devices

**Mitigation**:
- Lazy render: Only mount visible nodes
- Virtual scrolling: Implement if performance issues arise
- Benchmark: Test on iPhone SE 2020 (baseline device)

### Deep Linking Edge Cases

**Risk**: Invalid URLs (`/invalid/path`) cause errors

**Mitigation**:
- 404 handling in `+page.ts` load function
- Redirect to home if algorithm not found
- Preserve category expansion state even on 404

## Open Questions

**Resolved in Clarification Session**:
1. ✅ Mobile behavior: Drawer on phones, narrower width on tablets
2. ✅ URL navigation: Auto-expand parent categories
3. ✅ Nesting depth: Unlimited (future-proof)

**Deferred** (low impact, default to sensible behavior):
1. Empty categories: Default to **hidden** (don't render empty `<ul>`)
2. Category structure: Define during implementation based on algorithm taxonomy

## References

- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Routing](https://kit.svelte.dev/docs/routing)
- [ARIA Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Web Storage API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
