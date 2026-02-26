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

## Adding a New Scene — Checklist

1. **Entities** — create classes in `src/entities/` (position, velocity, heading, spawnOpacity, state machine if needed)
2. **Entity renderers** — pure functions in `src/rendering/` (one per entity type)
3. **Environment renderer** — class in `src/rendering/` (pre-generated data, resize, layered render methods)
4. **Steering behaviors** — pure functions in `src/behaviors/` (boundary avoidance, wander, separation, etc.)
5. **Scene class** — in `src/scenes/`, implements `Scene` interface, owns entities + environment renderer, orchestrates update/render layers
6. **Register** — add entry to `scenes` array in `src/main.ts` with import
