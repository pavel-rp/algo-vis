# Feature Specification: Minimum Time to Brew Potions Visualization

**Feature Branch**: `005-new-algorithm-visualization`
**Created**: 2025-10-10
**Status**: Draft (implementation in progress)
**Input**: Add visualization for LeetCode 3494 "Find the Minimum Amount of Time to Brew Potions"

## Execution Flow (main)
```
1. Capture user ask → Visualize LeetCode 3494 brewing pipeline ✓
2. Identify core concepts → Wizard line, potion batches, synchronized hand-offs ✓
3. Clarify requirements → Timeline grid, waiting time explanations, constitution alignment ✓
4. Define user stories & acceptance tests ✓
5. Enumerate functional requirements ✓
6. List primary entities & data contracts ✓
7. Review for completeness ✓
8. Return spec → READY FOR BUILD ✓
```

---

## ⚡ Quick Guidelines
- ✅ Emphasize learning goals over raw code
- ✅ Keep requirements technology-agnostic
- ❌ No implementation details (components, files, frameworks)
- 👥 Target: product & curriculum stakeholders

---

## Clarifications

### Session 2025-10-10
- **Navigation placement?** Dynamic Programming ▸ Scheduling & Pipelines
- **Visualization form factor?** 2D grid (wizards × potions) with timeline overlays, highlight wait states per Visual Encoding spec
- **What insights must be surfaced?** Start/finish timestamps, blocking resource (wizard busy vs potion arrival), running total makespan
- **How many presets?** Minimum three: problem example, balanced lab (3×3), bottleneck case highlighting idle time chains
- **Custom input bounds?** ≤ 12 wizards, ≤ 12 potions (≤ 144 cells) to keep traces performant and legible per constitution §V
- **Legend needs?** Reuse existing roles (`start`, `current`, `path-active`, `visited`, `goal`) with clear descriptions in copy; no new tokens required

---

## User Scenarios & Testing

### Primary Story
A learner exploring production scheduling wants to see how potion batches flow through wizards with varying skills. They open the visualization, pick the LeetCode sample preset, and observe the exact wait times that force the optimal 110-minute makespan. They step through each wizard hand-off to understand how blocking propagates down the line.

### Acceptance Scenarios
1. **Given** the learner loads the page, **When** they start playback, **Then** each wizard/potion cell highlights sequentially with start/finish timestamps in the status copy.
2. **Given** a potion is delayed by a busy wizard, **When** that step renders, **Then** the description explains the wait reason (wizard occupied vs potion still in transit) and the wait duration.
3. **Given** all wizards finish a potion, **When** the next potion begins, **Then** the timeline respects synchronous hand-off (no overlapping work) and the learner can verify this by inspecting the timestamps.
4. **Given** playback reaches the final cell, **When** it completes, **Then** the visualization surfaces the total brewing time and marks the pipeline goal state.
5. **Given** the learner inputs custom skills/mana (within bounds), **When** they submit, **Then** the system validates lengths, numeric ranges (≥1), and cell limit, producing a new trace or human-readable errors.

### Edge Cases
- Single wizard or single potion (degenerates to simple sum) — ensure timeline still renders sequentially.
- Equal skills/mana arrays (uniform throughput) — confirm zero waiting except initial alignment.
- Highly imbalanced wizard skill (slow wizard bottleneck) — ensure idle time preceding the bottleneck is explained.
- Max supported grid (12×12) — trace generation must remain <100 ms (constitution §V) and keep frames readable.

---

## Requirements

### Functional Requirements
- **FR-001**: Provide a visualization for LeetCode 3494 "Find the Minimum Amount of Time to Brew Potions" within the Dynamic Programming ▸ Scheduling & Pipelines category.
- **FR-002**: Render a wizard × potion grid where each cell represents one processing task with immutable timeline data (start, finish, duration).
- **FR-003**: Highlight the active cell (`current`) and its dependencies (`path-active`) following the global visual-encoding specification.
- **FR-004**: Annotate each frame with descriptive text explaining the timing decision, including wait causes (wizard busy vs potion transit).
- **FR-005**: Track cumulative makespan and surface it in both frame metrics and the final completion message.
- **FR-006**: Mark the first cell as `start` and the final cell as `goal` throughout playback so learners can orient themselves quickly.
- **FR-007**: Offer at least three presets (problem sample, balanced 3×3, bottleneck) and allow custom input within validated bounds (≤12×12, skills/mana ≥1 integers).
- **FR-008**: Reject inputs exceeding the visualization bounds or containing non-positive / non-integer values with actionable error messages.
- **FR-009**: Generate traces that support bidirectional playback without mutating prior frames (immutable frame snapshots).
- **FR-010**: Ensure legend entries align with existing highlight roles; if additional roles are required, document and extend shared legend assets simultaneously.

### Key Entities
- **Wizard**: Worker with fixed `skill` multiplier determining processing duration per potion.
- **Potion Batch**: Sequenced tasks defined by `mana` capacity; flows through wizards in order.
- **Timeline Cell**: Combination of wizard + potion with immutable start, finish, duration, wait metadata.
- **Availability Vector**: Captures when each wizard becomes free for the next potion; drives synchronization logic.
- **Execution Trace**: Ordered frames showing timeline updates, highlights, descriptions, and metrics.
- **Preset Configuration**: Named scenario bundling `skill`, `mana`, and legend-ready descriptions.

---

## Review & Acceptance Checklist
- [x] Requirements map back to learner outcomes and constitutional principles.
- [x] Visual encoding references follow master spec color/token language.
- [x] Edge cases documented with explicit success criteria.
- [x] Input bounds justified against performance requirements.
- [x] No pending clarifications; stakeholders can sign off.

---

## Execution Status
- [x] User intent captured
- [x] Concept clarification complete
- [x] Requirements enumerated
- [x] User stories defined
- [x] Checklist satisfied
- [x] Ready for implementation
