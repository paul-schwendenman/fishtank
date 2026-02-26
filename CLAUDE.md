# Fishtank

Interactive canvas-based nature simulation with multiple scenes. TypeScript + Vite + HTML5 Canvas 2D. No framework.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build

## Architecture

```
src/
├── main.ts              # Entry point, scene registry, URL hash navigation
├── engine/GameLoop.ts   # rAF loop, Scene interface, dt capped at 33ms
├── entities/            # Entity classes (one per file)
├── behaviors/           # Steering functions (one file per scene) + ForceBudget
├── rendering/           # Entity renderers (pure functions) + environment renderers (classes)
├── scenes/              # Scene implementations (one per file)
├── spatial/SpatialHash  # 2D spatial hash for neighbor queries
├── ui/                  # SettingsUI (scene dropdown), fullscreen
└── utils/               # Vector (immutable 2D), math helpers
```

## Scene Interface

```typescript
interface Scene {
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  resize(width: number, height: number): void;
}
```

## Conventions

### Entities
- One class per file in `src/entities/`
- Own their `position: Vector`, `velocity: Vector`, `heading: number`
- Use `spawnOpacity` for fade-in (starts negative, increments at 0.5/s)
- State machines use string union types: `type FrogState = 'sitting' | 'leaping' | ...`
- Some use ForceBudget (Fish, Koi, Firefly); others manage velocity directly (WaterStrider, Dragonfly, Frog)
- Variety/species configs are plain objects in separate files (Species.ts, KoiVariety.ts, etc.)

### Entity Renderers
- **Pure exported functions**, not classes
- Signature: `export function renderEntity(ctx: CanvasRenderingContext2D, entity: Entity, time: number): void`
- Use `import type` for entity types
- Early-return if `spawnOpacity <= 0`
- Save/restore ctx, translate to position, rotate to heading, draw in local coords

### Environment Renderers
- **Classes** in `src/rendering/`
- Pre-generate static data (rocks, plants, pebbles) in constructor
- Regenerate on `resize()`
- Expose multiple render methods for different layers, called in order by the scene

### Steering Behaviors
- **Pure functions** in `src/behaviors/`, one file per scene
- Return `Vector` forces
- `composeForceBudget(forces: PrioritizedForce[], budget: number): Vector` for priority-based force composition
- Lower priority number = higher priority

### Scene Registration
Scenes are registered in `main.ts` as a `SceneEntry[]` array. SettingsUI reads this dynamically — no hardcoded scene list.

```typescript
{ id: 'scene-id', name: 'Scene Name', description: '...', icon: '\u{emoji}', create: (w, h) => new MyScene(w, h) }
```

URL hash navigation: `#fish-tank`, `#koi-pond`, etc.

## Design Principles

From `docs/PRODUCT_VISION.md` — these guide every scene:

- **Relaxing first.** No jarring movements, no sudden changes, no UI clutter.
- **Believable movement.** Animals move naturally. If movement doesn't feel right, nothing else matters.
- **Beautiful to look at.** Stylized 2D with rich colors, subtle depth, gentle lighting. Not photorealism.
- **Simple on the surface.** No visible configuration clutter. It just works.
- **Modular by design.** Each scene is self-contained. New scenes don't touch existing ones.

## Docs

| Doc | What it is |
|-----|------------|
| `docs/PRODUCT_VISION.md` | Core principles, visual style, performance targets — **read this first** |
| `docs/SCENES.md` | Detailed specs for future scene ideas (Flock of Birds, Bird Feeder, Ant Farm, Fall Tree, Cat Cafe) |
| `docs/FISH_TANK.md` | Original Fish Tank scene spec (implemented) |
| `docs/PHASE_1_SIMPLE_MOVEMENT.md` | Steering behaviors, wander, boundaries (implemented) |
| `docs/PHASE_2_INTERACTIONS.md` | Schooling, separation, force budget, spatial hash (implemented) |
| `docs/PHASE_3_COMPLEX_BEHAVIOR.md` | Needs system, hunger/energy/curiosity states (**not yet built**) |
| `docs/FUTURE_INTERACTIONS.md` | User interactions: tap to feed, tap glass, cursor follow (**not yet built**) |

## Adding a New Scene — Checklist

1. **Entities** — create classes in `src/entities/` (position, velocity, heading, spawnOpacity, state machine if needed)
2. **Entity renderers** — pure functions in `src/rendering/` (one per entity type)
3. **Environment renderer** — class in `src/rendering/` (pre-generated data, resize, layered render methods)
4. **Steering behaviors** — pure functions in `src/behaviors/` (boundary avoidance, wander, separation, etc.)
5. **Scene class** — in `src/scenes/`, implements `Scene` interface, owns entities + environment renderer, orchestrates update/render layers
6. **Register** — add entry to `scenes` array in `src/main.ts` with import
