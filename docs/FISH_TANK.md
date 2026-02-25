# Fish Tank — Scene Spec (MVP)

The first scene to build. A tropical freshwater aquarium viewed from the front.

---

## Visual Composition

```
┌──────────────────────────────────────────────────┐
│  ░░░░░░░░░░░ light rays from above ░░░░░░░░░░░  │
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│                                                  │
│    🐠          🐟                                │
│                        🐠                        │
│  🌿     🐟                    🌿    🐠          │
│                   🐟                             │
│  🌿  🪨                  🏰         🌿          │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│░░░░░░░░░░░░░░ gravel / sand ░░░░░░░░░░░░░░░░░░░░│
└──────────────────────────────────────────────────┘
```

### Layers (back to front)

1. **Background** — Solid dark blue-green gradient. Faint, out-of-focus plants for depth.
2. **Light rays** — Soft, diagonal shafts of pale light from the top, slowly swaying.
3. **Back plants** — Tall plants rooted in the substrate, gently swaying. Slightly desaturated to push them back.
4. **Fish (back)** — Smaller or more distant fish, slightly smaller scale and muted color.
5. **Mid decorations** — Rocks, driftwood, a castle or cave.
6. **Fish (main)** — Primary fish at full size and color.
7. **Front plants** — Large foreground plants, slightly blurred or darker to create depth.
8. **Bubbles** — Rising from an aerator stone, varying size and speed.
9. **Ambient particles** — Tiny floating debris drifting slowly (adds life to the water).

### Color Palette

- Deep blue-greens for water and background
- Warm amber/gold for light rays
- Rich greens for plants (varied — dark emerald to bright lime)
- Sandy tan/brown for substrate
- Fish are the color pop — bright oranges, blues, reds, yellows against the muted environment

---

## Fish Species

A mix of species with different shapes, sizes, colors, and swimming styles.

| Species | Size | Color | Swimming Style | Notes |
|---------|------|-------|----------------|-------|
| Neon Tetra | Tiny | Iridescent blue/red stripe | Fast, darty, schools tightly | Always in a group of 6-10 |
| Angelfish | Large | Silver with black stripes | Slow, gliding, vertical body | Solitary or paired |
| Guppy | Small | Bright orange/blue tail | Quick, fluttery | 3-5, mixed colors |
| Betta | Medium | Deep red/blue flowing fins | Slow, dramatic, flowing | Solitary. Fins trail beautifully |
| Corydoras | Small | Spotted brown | Bottom-dwelling, scooting | 3-4, stay near substrate |
| Pleco | Large | Dark brown/black | Barely moves, suctions to glass or decor | 1, mostly stationary |
| Dwarf Gourami | Medium | Orange and blue stripes | Slow, curious, mid-level | 1-2 |

### Fish Anatomy (Rendering)

Each fish is composed of simple 2D shapes:

- **Body** — An ellipse or custom bezier shape, species-specific
- **Tail fin** — Attached at rear, animates with a sine wave for swimming motion
- **Dorsal fin** — On top, slight wave animation
- **Pectoral fins** — Small, on sides, subtle flutter
- **Eye** — Simple circle with highlight dot
- **Color** — Flat fill with subtle gradient, species-specific markings as overlays

Fish face the direction they're swimming. When turning, the body smoothly flips (or arcs through the turn for larger fish).

---

## Environment Elements

### Plants

- 4-6 plant clusters placed along the substrate
- Types: tall grass-like (Vallisneria), bushy (Java fern), carpet (foreground), floating (surface)
- All plants sway gently with a slow sine wave, slightly offset per plant for natural feel
- Plants are decorative — fish don't interact with them in Phase 1

### Substrate

- Sandy/gravel bottom spanning the full width
- Slight texture variation (not flat color)
- Small pebbles scattered for detail

### Decorations

- 2-3 placed decorations from: rocks, driftwood, small cave/arch, classic castle
- These serve as landmarks and (in later phases) resting spots for fish

### Bubbles

- Stream of bubbles rising from a point on the substrate (aerator stone)
- Bubbles vary in size (2-6px)
- Slight horizontal drift as they rise
- Accelerate slightly and wobble
- Pop/fade at the surface

### Light Rays

- 3-5 soft diagonal light shafts from the top
- Very slow horizontal sway (period: 10-20 seconds)
- Low opacity (10-20%) — subtle, not overpowering
- Warm amber/white color

### Ambient Particles

- Tiny specks (1-2px) floating in the water
- Very slow, random drift
- Low count (20-30) — just enough to make the water feel alive

---

## Animation Details

### Fish Swimming

- Each fish has a base speed (species-dependent)
- The tail fin oscillates with a sine wave — frequency increases with speed
- Body has a very subtle S-curve wave during swimming (more pronounced in eels or bettas)
- When idle/slow, fins flutter gently

### Fish Turning

- Small fish: can turn sharply (almost instant direction change)
- Large fish: wide arcing turns over 0.5-1 second
- During a turn, the fish body rotates smoothly to face the new direction

### Plant Swaying

- Rooted at base, tip sways left/right
- Sine wave with period of 3-6 seconds
- Each plant has a slightly different phase and amplitude
- Taller plants sway more at the tip

### Bubble Rising

- Spawned at aerator position with random horizontal offset
- Rise speed: 30-60px/second with slight acceleration
- Horizontal wobble: small sine wave (±5px, period 1-2s)
- Opacity fades to 0 in the top 10% of the tank

---

## Presets

Minimal customization. 2-3 presets that change the overall vibe:

| Preset | Description |
|--------|-------------|
| **Tropical Community** | Default. Bright, varied species, lush plants, warm lighting. |
| **Peaceful Betta** | Single betta with flowing fins, minimal tankmates, dim lighting, more plants. |
| **Schooling Tank** | Large school of neon tetras (15-20), few other fish, open swimming space. |

---

## Audio

- **Bubble sounds** — Soft, intermittent bubble pops. Not constant — occasional clusters.
- **Water ambience** — Very low, deep hum/rumble of a filter. Almost felt more than heard.
- **Muted by default.** User can toggle audio on.

---

## Technical Notes

### Canvas Setup

- Full viewport canvas (`window.innerWidth × window.innerHeight`)
- Resize listener to handle window changes
- `requestAnimationFrame` loop with delta-time for frame-independent animation
- Target 60fps

### Entity Structure

Each fish is an entity with:
- Position (x, y)
- Velocity (vx, vy)
- Species config (size, color, speed, turn rate)
- Animation state (tail phase, fin phase)
- Rendering method

### Coordinate System

- Origin at top-left of canvas
- Tank boundaries inset from canvas edges (to show tank frame/glass effect)
- Fish stay within boundaries with soft avoidance (not hard clipping)

### Draw Order

Render back-to-front following the layer list above. Fish are sorted by their "depth" value — fish with lower depth render first (behind) and appear slightly smaller/muted.
