# Data Model: Tree-Based Sidebar Navigation

**Feature**: 003-move-the-navigation | **Date**: 2025-10-06

## Overview

This document defines the core data entities and their relationships for the hierarchical navigation tree system. The model supports unlimited nesting depth, type-safe tree traversal, and immutable state management using Svelte 5 runes.

## Entity Diagram

```
NavigationTree
├── rootNodes: NavigationNode[]
└── state: NavigationState

NavigationNode (discriminated union)
├── CategoryNode
│   ├── id: string
│   ├── label: string
│   ├── children: NavigationNode[]
│   └── type: 'category'
└── AlgorithmNode
    ├── id: string
    ├── label: string
    ├── pluginId: string
    ├── path: string
    └── type: 'algorithm'

NavigationState
├── expandedNodes: Set<string>
├── activeAlgorithmId: string | null
└── sidebarOpen: boolean
```

## Core Entities

### NavigationNode

**Type**: Discriminated union type (TypeScript)

**Purpose**: Represents any node in the navigation tree, either a category branch or an algorithm leaf.

**Variants**:
- `CategoryNode`: Branch node containing child nodes
- `AlgorithmNode`: Leaf node representing an individual algorithm

**Discriminator**: `type` field ('category' | 'algorithm')

**Relationships**:
- Parent-child: Implicit through `children` array in CategoryNode
- No explicit parent references (prevents circular dependencies)

---

### CategoryNode

**Purpose**: Branch node in the navigation tree that can contain subcategories or algorithms.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `'category'` | Yes | Discriminator for union type |
| `id` | `string` | Yes | Unique identifier (e.g., 'graphs', 'graphs-shortest-path') |
| `label` | `string` | Yes | Display name shown in UI (e.g., 'Graphs', 'Shortest Path') |
| `children` | `NavigationNode[]` | Yes | Ordered collection of child nodes (can be empty) |

**Constraints**:
- `id` must be unique across entire tree
- `id` should be kebab-case for URL compatibility
- `children` array can mix CategoryNode and AlgorithmNode types
- Empty `children` array is valid but node should be hidden in UI (per research.md)

**Invariants**:
- Expansion state stored externally in NavigationState (not on node)
- Immutable structure (use spread operators for updates)

**Example**:
```typescript
const graphsCategory: CategoryNode = {
  type: 'category',
  id: 'graphs',
  label: 'Graphs',
  children: [
    {
      type: 'category',
      id: 'graphs-shortest-path',
      label: 'Shortest Path',
      children: [
        {
          type: 'algorithm',
          id: 'dijkstra',
          label: "Dijkstra's Algorithm",
          pluginId: 'dijkstra',
          path: '/graphs/dijkstra'
        }
      ]
    }
  ]
};
```

---

### AlgorithmNode

**Purpose**: Leaf node representing an individual algorithm problem that can be visualized.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `'algorithm'` | Yes | Discriminator for union type |
| `id` | `string` | Yes | Unique identifier (e.g., 'dijkstra', 'trapping-rain-water-2') |
| `label` | `string` | Yes | Display name shown in UI (e.g., "Dijkstra's Algorithm") |
| `pluginId` | `string` | Yes | Reference to AlgorithmPlugin.id for loading visualization |
| `path` | `string` | Yes | URL path for SvelteKit routing (e.g., '/graphs/dijkstra') |

**Constraints**:
- `id` must be unique across entire tree
- `pluginId` must match an existing AlgorithmPlugin.id
- `path` must start with `/` and be URL-safe
- `path` typically follows format `/{category}/{algorithm}`

**Invariants**:
- Selection state stored externally in NavigationState (not on node)
- Cannot have children (enforced by type system)

**Example**:
```typescript
const trappingRainWater: AlgorithmNode = {
  type: 'algorithm',
  id: 'trapping-rain-water-2',
  label: 'Trapping Rain Water II',
  pluginId: 'trapping-rain-water-2',
  path: '/dynamic-programming/trapping-rain-water-2'
};
```

---

### NavigationState

**Purpose**: Manages runtime state for tree expansion, algorithm selection, and sidebar visibility using Svelte 5 runes.

**Implementation**: Svelte 5 class with `$state()` runes

**Fields**:

| Field | Type | Reactive | Description |
|-------|------|----------|-------------|
| `expandedNodes` | `Set<string>` | Yes | Set of category node IDs that are currently expanded |
| `activeAlgorithmId` | `string \| null` | Yes | ID of currently selected algorithm (null if none) |
| `sidebarOpen` | `boolean` | Yes | Whether sidebar is visible (mobile/tablet) |

**Methods**:

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `toggle` | `nodeId: string` | `void` | Toggle expansion state of a category node |
| `expand` | `nodeId: string` | `void` | Expand a category node (idempotent) |
| `collapse` | `nodeId: string` | `void` | Collapse a category node (idempotent) |
| `expandPath` | `nodeIds: string[]` | `void` | Expand all categories in path (for deep linking FR-013) |
| `setActive` | `algorithmId: string` | `void` | Set the active algorithm |
| `clearActive` | - | `void` | Clear active algorithm selection |
| `toggleSidebar` | - | `void` | Toggle sidebar visibility |
| `isExpanded` | `nodeId: string` | `boolean` | Check if category is expanded |
| `isActive` | `algorithmId: string` | `boolean` | Check if algorithm is active |

**State Persistence**:
- `expandedNodes`: Stored in `localStorage['algovis_expanded_nodes']` as JSON array
- `sidebarOpen`: Stored in `sessionStorage['algovis_sidebar_open']` as boolean
- `activeAlgorithmId`: Derived from URL, not persisted directly

**Constraints**:
- Only category nodes can be in `expandedNodes` (algorithm nodes cannot expand)
- `activeAlgorithmId` must reference valid AlgorithmNode.id or be null
- State mutations trigger Svelte reactivity automatically via runes

**Example Implementation**:
```typescript
class NavigationState {
  expandedNodes = $state(new Set<string>());
  activeAlgorithmId = $state<string | null>(null);
  sidebarOpen = $state(true);

  constructor() {
    // Load from storage in $effect
    $effect(() => {
      const stored = localStorage.getItem('algovis_expanded_nodes');
      if (stored) {
        this.expandedNodes = new Set(JSON.parse(stored));
      }
    });
  }

  toggle(nodeId: string): void {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
    this.persist();
  }

  expandPath(nodeIds: string[]): void {
    nodeIds.forEach(id => this.expand(id));
  }

  private persist(): void {
    localStorage.setItem(
      'algovis_expanded_nodes',
      JSON.stringify([...this.expandedNodes])
    );
  }
}
```

---

## Data Structures

### NavigationTree Structure

**Purpose**: Root container for the entire navigation hierarchy.

**Structure**:
```typescript
interface NavigationTree {
  rootNodes: NavigationNode[];
}
```

**Example** (initial implementation with 2 algorithms):
```typescript
export const navigationTree: NavigationTree = {
  rootNodes: [
    {
      type: 'category',
      id: 'dynamic-programming',
      label: 'Dynamic Programming',
      children: [
        {
          type: 'category',
          id: 'dp-2d-array',
          label: '2D Array',
          children: [
            {
              type: 'algorithm',
              id: 'trapping-rain-water-2',
              label: 'Trapping Rain Water II',
              pluginId: 'trapping-rain-water-2',
              path: '/dynamic-programming/trapping-rain-water-2'
            }
          ]
        }
      ]
    },
    {
      type: 'category',
      id: 'graphs',
      label: 'Graphs',
      children: [
        {
          type: 'category',
          id: 'graphs-path-finding',
          label: 'Path Finding',
          children: [
            {
              type: 'algorithm',
              id: 'unique-paths-obstacles',
              label: 'Unique Paths with Obstacles',
              pluginId: 'unique-paths-with-obstacles',
              path: '/graphs/unique-paths-obstacles'
            }
          ]
        }
      ]
    }
  ]
};
```

---

## Type Definitions

### TypeScript Interfaces

```typescript
// Discriminated union for type-safe tree traversal
export type NavigationNode = CategoryNode | AlgorithmNode;

export interface CategoryNode {
  type: 'category';
  id: string;
  label: string;
  children: NavigationNode[];
}

export interface AlgorithmNode {
  type: 'algorithm';
  id: string;
  label: string;
  pluginId: string;
  path: string;
}

export interface NavigationTree {
  rootNodes: NavigationNode[];
}
```

### Type Guards

```typescript
export function isCategoryNode(node: NavigationNode): node is CategoryNode {
  return node.type === 'category';
}

export function isAlgorithmNode(node: NavigationNode): node is AlgorithmNode {
  return node.type === 'algorithm';
}
```

---

## Data Flow

### User Interaction Flow

```
1. User clicks category node
   → UI calls NavigationState.toggle(nodeId)
   → expandedNodes Set updated
   → Svelte reactivity triggers TreeNode re-render
   → Children become visible/hidden

2. User clicks algorithm node
   → UI calls NavigationState.setActive(algorithmId)
   → SvelteKit navigates to node.path
   → +page.svelte loads algorithm via pluginId
   → activeAlgorithmId updated from URL
   → TreeNode highlights active algorithm

3. Direct URL navigation (FR-013)
   → SvelteKit loads route /[category]/[algorithm]
   → +page.ts extracts algorithmId from params
   → Sidebar component calls NavigationState.expandPath(ancestorIds)
   → Tree expands to show active algorithm
```

### State Persistence Flow

```
1. Tree expansion change
   → NavigationState.toggle() called
   → expandedNodes Set mutated
   → NavigationState.persist() writes to localStorage
   → Page reload → constructor reads localStorage → state restored

2. Sidebar visibility change
   → NavigationState.toggleSidebar() called
   → sidebarOpen boolean toggled
   → sessionStorage updated
   → Tab close → state lost (by design)
```

---

## Validation Rules

### Node ID Constraints

- **Format**: kebab-case (lowercase, hyphens)
- **Uniqueness**: Must be unique across entire tree (all categories and algorithms)
- **Reserved**: Cannot use 'root', 'home', or SvelteKit reserved routes

**Validation**:
```typescript
const nodeIdSchema = z.string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Must be kebab-case')
  .min(1)
  .max(100);
```

### Path Constraints

- **Format**: `/category/algorithm` or `/category/subcategory/algorithm`
- **Uniqueness**: Must be unique across all algorithms
- **Validity**: Must match SvelteKit route pattern

**Validation**:
```typescript
const pathSchema = z.string()
  .regex(/^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/, 'Must be valid URL path')
  .startsWith('/');
```

### Tree Structure Constraints

- **Cycles**: Not possible (tree is acyclic by construction)
- **Depth**: Unlimited (per FR-010)
- **Empty categories**: Allowed but hidden in UI
- **Mixed children**: Category can contain both categories and algorithms

---

## Query Operations

### Common Traversal Functions

```typescript
// Find node by ID (depth-first search)
export function findNodeById(
  tree: NavigationTree,
  nodeId: string
): NavigationNode | null {
  function search(nodes: NavigationNode[]): NavigationNode | null {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      if (isCategoryNode(node)) {
        const found = search(node.children);
        if (found) return found;
      }
    }
    return null;
  }
  return search(tree.rootNodes);
}

// Get ancestor path for deep linking (FR-013)
export function getAncestorIds(
  tree: NavigationTree,
  targetId: string
): string[] {
  function search(
    nodes: NavigationNode[],
    path: string[]
  ): string[] | null {
    for (const node of nodes) {
      if (node.id === targetId) return path;
      if (isCategoryNode(node)) {
        const found = search(node.children, [...path, node.id]);
        if (found) return found;
      }
    }
    return null;
  }
  return search(tree.rootNodes, []) ?? [];
}

// Get all algorithm nodes (for plugin loading)
export function getAllAlgorithms(tree: NavigationTree): AlgorithmNode[] {
  function collect(nodes: NavigationNode[]): AlgorithmNode[] {
    return nodes.flatMap(node =>
      isAlgorithmNode(node)
        ? [node]
        : collect(node.children)
    );
  }
  return collect(tree.rootNodes);
}
```

---

## Migration Path

### Adding New Algorithms

1. Define AlgorithmNode in `src/lib/data/navigation-tree.ts`
2. Insert into appropriate category's `children` array
3. Ensure `pluginId` matches existing plugin
4. No migration needed (tree is data, not schema)

### Restructuring Categories

1. Move nodes between parents in navigation-tree.ts
2. Update `path` fields if category structure changes
3. localStorage will auto-adapt (stores IDs, not paths)
4. No database migration (client-side only)

---

## Performance Considerations

### Memory

- **Tree size**: ~100 nodes * 200 bytes = 20KB (negligible)
- **State size**: expandedNodes Set with ~10 entries * 50 bytes = 500 bytes
- **localStorage**: Serialized state ~1KB (well under 5MB limit)

### Rendering

- **Initial render**: O(n) where n = number of visible nodes
- **Toggle category**: O(m) where m = number of children (typically <10)
- **Active algorithm update**: O(1) reactivity with Svelte runes

### Optimization Strategies

- Lazy rendering: Only mount visible nodes (implemented via `{#if isExpanded}`)
- Virtual scrolling: Deferred until tree exceeds 500 nodes
- Memoization: Not needed (Svelte reactivity is fine-grained)

---

## References

- **Feature Spec**: `specs/003-move-the-navigation/spec.md`
- **Research**: `specs/003-move-the-navigation/research.md`
- **Contracts**: `specs/003-move-the-navigation/contracts/navigation-tree-schema.ts`
- **Type System**: TypeScript discriminated unions pattern
- **State Management**: Svelte 5 runes documentation
