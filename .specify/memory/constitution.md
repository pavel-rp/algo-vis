<!--
Sync Impact Report:
- Version change: (new document) → 1.0.0
- New constitution created for Algorithm Visualization Framework
- Core principles established:
  1. Visualization-First Design
  2. Framework Reusability
  3. Step-by-Step Traceability
  4. Interactive Learning
  5. Performance & Scalability
- Templates requiring updates:
  ✅ spec-template.md - reviewed, compatible
  ✅ plan-template.md - reviewed, compatible
  ✅ tasks-template.md - reviewed, compatible
- Follow-up TODOs: None - all placeholders filled
-->

# Algorithm Visualization Framework Constitution

## Core Principles

### I. Visualization-First Design

Every algorithm implementation MUST produce visual output that shows:
- The current state of data structures at each step
- Active elements being processed (focus highlighting)
- Relationships between elements (neighbor highlighting, connections)
- Accumulated results (e.g., water fill levels, sorted portions)

**Rationale**: The framework exists to make algorithms understandable through visualization. Code without visualization capability does not fulfill the project's purpose. Ad-hoc visualizations (like the trapping rain water example) demonstrate the value, but the framework must make this systematic and reusable.

### II. Framework Reusability (NON-NEGOTIABLE)

Every visualization feature MUST be:
- Algorithm-agnostic: Separate visual components from algorithm logic
- Composable: Mix and match grid displays, graphs, trees, arrays, heaps
- Configurable: Support different data types, dimensions, styling
- Standalone: Each component works independently

**Rationale**: The project transitions from one-off HTML files to a universal system. Reusability is the core differentiator. If a component cannot be reused across multiple algorithms, it belongs in an example, not the framework core.

### III. Step-by-Step Traceability

Algorithm execution MUST support:
- Frame-by-frame playback with play/pause controls
- Step forward AND step backward navigation
- Complete execution history preservation
- Status logging for each step with human-readable explanations

**Rationale**: Understanding complex algorithms requires the ability to move backward and review previous states, not just forward execution. The trapping rain water example demonstrates this with `buildTrace()` capturing all frames. This must be a framework primitive, not per-algorithm boilerplate.

### IV. Interactive Learning

Visualizations MUST provide:
- Adjustable execution speed (pause, step, play with configurable delays)
- Input modification capabilities (change data, see new results)
- Clear status indicators (current step, algorithm state, metrics)
- Legend and documentation of visual encodings

**Rationale**: Passive animations are insufficient for learning. Users must control pacing, experiment with inputs, and understand what colors/highlights mean. The framework must enforce these interaction patterns as defaults.

### V. Performance & Scalability

Visualizations MUST:
- Render grids up to 20×20 (400 cells) without lag
- Support trees/graphs up to 100 nodes smoothly
- Use CSS transforms and requestAnimationFrame for animations
- Avoid full DOM reconstruction between frames

**Rationale**: Educational value is lost if visualization slows down understanding. The framework targets algorithm complexity learning, not rendering optimization learning. Performance standards ensure visualizations enhance rather than hinder comprehension.

## Design Standards

### Visual Component Architecture

- **Separation of Concerns**: Algorithm logic (trace generation) separate from rendering (DOM updates)
- **State Management**: All visual state derives from immutable frame snapshots
- **Declarative Updates**: Components declare what to render for a given state, framework handles transitions
- **Modular Styling**: CSS variables for themes, component-scoped styles, no global conflicts

**Rationale**: The trapping rain water example mixes algorithm logic with rendering. The framework must separate `buildTrace(algorithm)` (pure logic) from `renderFrame(frame, cells, heightMap)` (pure rendering) to enable algorithm swapping without rewriting UI code.

### Algorithm Integration Contract

Every algorithm adapter MUST provide:
- `trace(input)` function returning array of immutable frames
- Frame schema: `{ step, state, focus?, neighbors?, metrics, description }`
- Input validation with clear error messages
- Example inputs (tiny, classic, complex cases)

**Rationale**: Standardizing the algorithm-to-framework interface allows the framework to provide controls, status display, step navigation, and rendering without knowing algorithm details. This contract is the reusability boundary.

## Development Workflow

### Test-Driven Visualization Development

1. **Component Contract Tests**: Write tests for component interfaces (props in, DOM out) BEFORE implementation
2. **Visual Regression Tests**: Capture reference screenshots for key algorithm states
3. **Integration Tests**: Test full algorithm → trace → render → DOM pipeline
4. **Manual Testing**: Verify step controls, speed adjustments, input modifications work

**Rationale**: Visualization bugs are often silent (wrong colors, missing highlights). Automated tests catch contract violations; visual regression tests catch rendering bugs; manual testing ensures interaction quality.

### Example-Driven Design

- Each new framework feature introduced via a complete algorithm example
- Examples progress from simple (bubble sort on array) to complex (graph algorithms)
- Examples live in `/examples` with explanatory comments
- Framework components extracted from proven example patterns

**Rationale**: The trapping rain water example proves what works. New features should emerge from real algorithm needs, not speculative abstractions. Examples serve as documentation, test cases, and feature proofs.

## Governance

### Amendment Process

1. Propose change with rationale and affected principles
2. Demonstrate with example algorithm implementation
3. Update templates, scripts, and this constitution
4. Increment version according to semantic versioning

### Constitutional Compliance

- All pull requests must verify alignment with visualization and reusability principles
- New framework components require at least two algorithm examples demonstrating reuse
- Violations of non-negotiable principles (Framework Reusability, Step-by-Step Traceability) are rejected
- Complexity additions must justify why simpler approaches (e.g., single-file examples) are insufficient

### Version Control

- **MAJOR**: Backward-incompatible changes to algorithm integration contract or component APIs
- **MINOR**: New component types (e.g., add tree visualizer to existing grid/graph), new framework features
- **PATCH**: Bug fixes, style improvements, documentation, performance optimizations

**Version**: 1.0.0 | **Ratified**: 2025-10-05 | **Last Amended**: 2025-10-05
