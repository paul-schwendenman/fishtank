# Farm Field — Scene Spec

A pastoral dairy farm viewed from the side. Cows graze, rest, and wander across a gently rolling green field under a wide open sky. Butterflies drift between wildflowers, birds perch on fence posts, and clouds drift slowly overhead.

---

## Visual Composition

```
┌──────────────────────────────────────────────────────┐
│                  ☁          ☁                         │
│    ☁                              ☁                  │
│                                                      │
│                                          🌳          │
│   🐄        🐄                    🐄        🌳      │
│         🐄          🐄                               │
│  ──┬────┬────┬────┬────┬────┬────┬────┬────┬────┬──  │
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└──────────────────────────────────────────────────────┘
```

### Layers (back to front)

1. **Sky** — Soft gradient from pale blue at top to warm white near the horizon. Subtle warm tint near the bottom suggesting haze.
2. **Clouds** — Soft, flat cumulus shapes drifting slowly left to right at different speeds and depths.
3. **Distant hills** — Rolling silhouettes in muted blue-green, layered for parallax depth.
4. **Far trees** — Small cluster of trees on the horizon, slightly desaturated.
5. **Field (back)** — Gently rolling green pasture, lighter/more muted to suggest distance.
6. **Cows (back)** — Distant cows rendered smaller and more muted.
7. **Field (mid)** — Main pasture area, richer green with subtle grass texture.
8. **Cows (main)** — Primary cows at full size and detail.
9. **Fence** — Simple wooden post-and-rail fence running across the middle ground.
10. **Field (fore)** — Foreground grass, slightly darker, with wildflowers scattered throughout.
11. **Butterflies & birds** — Small creatures fluttering and hopping in the foreground.

### Color Palette

- Soft sky blues and whites
- Rich pastoral greens (varied — deep emerald to bright spring green)
- Warm earth tones for fence posts and dirt patches
- Cows are the focal point — bold black-and-white patterns, warm browns, soft creams
- Wildflowers add pops of yellow, purple, and white

---

## Cow Varieties

| Variety | Color | Build | Notes |
|---------|-------|-------|-------|
| Holstein | White with large black patches | Large, angular | Classic dairy cow, most recognizable |
| Jersey | Warm tan/fawn, darker face | Medium, compact | Soft brown eyes, gentle look |
| Brown Swiss | Solid grey-brown | Large, sturdy | Even coloring, calm demeanor |
| Guernsey | Golden-red and white patches | Medium | Warm tones, distinctive markings |
| Belted Galloway | Black with white belt around middle | Stocky, shaggy | The "Oreo cow" — visually striking |

### Cow Anatomy (Rendering)

Each cow is composed of simple 2D shapes:

- **Body** — Large rounded rectangle or ellipse, breed-specific proportions
- **Head** — Smaller oval at front, slight downward angle when grazing
- **Legs** — Simple rectangles, subtle bend at knee, gentle sway when walking
- **Tail** — Thin line with tuft at end, slow swish animation
- **Ears** — Small ovals on sides of head, occasional flick
- **Udder** — Subtle rounded shape underneath (for dairy breeds)
- **Markings** — Breed-specific patches rendered as overlays on the base color

Cows face the direction they're walking. When turning, the body pivots slowly — cows never turn sharply.

---

## Cow Behaviors

### States

| State | Duration | Transitions to |
|-------|----------|----------------|
| Grazing | 20s–1min | Walking, Resting, Head-up |
| Walking | 5–20s | Grazing, Resting |
| Resting | 30s–2min | Standing (gets up slowly) |
| Standing | 10–30s | Grazing, Walking |
| Head-up | 3–8s | Grazing (looks around, ears flick, then returns to eating) |

### Behavior Details

- **Grazing** — Head lowered to the ground, slight side-to-side movement as they eat. Tail swishes occasionally. Most common state.
- **Walking** — Slow, ambling pace. Legs move in a gentle walk cycle. Cows drift in loose groups, roughly maintaining spacing but not rigidly.
- **Resting** — Cow lies down on the grass. Legs tucked underneath, head up or occasionally resting on the ground. Gentle breathing visible. Tail still swishes.
- **Standing** — Idle, head at mid-level. Occasional ear flick or tail swish. May turn head to look at nearby cow.
- **Head-up** — Pauses grazing, lifts head to look around. A moment of alertness before returning to calm.

### Group Dynamics

- Cows loosely cluster — they prefer being near each other but don't school tightly
- They drift in the same general direction when walking
- A resting cow may prompt nearby cows to also lie down
- They maintain comfortable spacing — gentle separation when too close

---

## Environment Elements

### Field

- Gently rolling terrain — not flat, with subtle hills creating visual interest
- Rich green grass with slight color variation (darker in hollows, lighter on ridges)
- Bare dirt patches near the fence and water trough
- Wildflowers scattered in clusters — daisies, buttercups, clover

### Fence

- Simple wooden post-and-rail fence across the mid-ground
- Weathered wood tones — grey-brown, slightly uneven
- Posts spaced evenly, two horizontal rails
- A gate section slightly ajar on one side

### Trees

- 2–3 trees in the mid-ground (oak or similar broad canopy)
- One large tree provides shade — cows may rest near it
- Leaves have a very gentle sway in the breeze
- Distant treeline along the horizon

### Sky & Clouds

- Wide open sky — this scene is about spaciousness
- 4–6 soft cumulus clouds at varying depths, drifting slowly
- Subtle color shift over time — warm golden light suggesting late afternoon
- No harsh sun — diffuse, gentle lighting throughout

### Wildflowers & Grass Detail

- Foreground grass blades sway gently in the breeze
- Small clusters of wildflowers with subtle color — yellow, purple, white
- Dandelion puffs that occasionally release seeds drifting on the wind

---

## Secondary Creatures

| Creature | Count | Behavior |
|----------|-------|----------|
| Butterflies | 2–4 | Flutter between wildflowers, erratic but gentle flight paths |
| Birds | 2–3 | Perch on fence posts, hop along the rail, occasionally fly to a new post |
| Swallows | 1–2 | Sweep across the sky in wide arcs, fast and graceful |

---

## Animation Details

### Cow Walking

- Slow, steady four-beat gait — legs move in sequence
- Body has a very subtle vertical bob with each step
- Head sways slightly side to side
- Tail swishes independently with a slow, irregular rhythm

### Cow Grazing

- Head lowered, slight lateral movement
- Occasional pause — head lifts briefly, jaw moves (chewing cud), then lowers again
- Tail swishes at a relaxed pace

### Cow Lying Down / Getting Up

- Lying down: front legs fold first, then hindquarters lower — a slow, deliberate motion over 2–3 seconds
- Getting up: hindquarters rise first, then front — slightly awkward, as real cows do
- These transitions are infrequent and serve as moments of gentle interest

### Grass & Wind

- Grass sways in a sine wave, propagating across the field like a breeze
- Wind gusts cause a faster ripple — subtle, not dramatic
- Wildflowers bob independently with slightly different timing

### Cloud Drift

- Clouds move left to right at 2–5px/second depending on depth
- Distant clouds move slower (parallax)
- Clouds fade out at screen edge and new ones fade in from the opposite side

---

## Audio

- **Ambient meadow** — Layered birdsong, gentle breeze through grass, distant insects buzzing
- **Cow sounds** — Occasional low moo, very infrequent (every 30–60s). Soft and distant, not jarring.
- **Wind** — Soft gusts that rise and fall, matching the grass animation
- **Muted by default.** User can toggle audio on.

---

## Rendering Notes

- Side-view perspective with gentle depth layering
- Cows are the largest elements — they should feel solid and grounded
- Soft, diffuse lighting — no harsh shadows, gentle ambient occlusion under cows
- The overall feel should be a warm pastoral painting, slightly impressionistic
- Grass texture is suggested, not individually rendered (performance)
- Distant elements use reduced saturation and lighter values for atmospheric perspective
- Foreground elements slightly darker to frame the scene

---

## Technical Notes

### Entity Structure

Each cow is an entity with:
- Position (x, y) on the field
- Velocity (vx, vy) — very slow, max ~20px/s
- Variety config (size, colors, markings)
- State machine (grazing, walking, resting, standing, head-up)
- Animation state (leg phase, tail phase, head angle)

### Spatial Considerations

- Cows are large entities — fewer on screen (5–8) compared to fish
- Collision avoidance needs wider radii
- Resting cows become obstacles for walking cows
- Field boundaries are soft — cows wander within the pasture area defined by the fence
