# Phase 3: Complex Behavior — Needs & States

Animals become individuals with internal drives. Their behavior emerges from needs (hunger, energy, curiosity) and a state machine that governs what they're doing at any moment.

This phase makes the tank feel like a living ecosystem where things happen over time — fish get hungry, rest, explore, and go about their day.

---

## Goals

- Each fish feels like an individual with its own rhythm and personality
- Behavior changes over time — the tank at minute 1 looks different than minute 30
- Emergent "stories" happen naturally (a fish searches for food, finds some, eats, rests by a plant)
- Nothing is scripted — all behavior emerges from the needs system
- The added complexity should be invisible — the viewer just sees more lifelike fish

---

## Needs System

Each fish tracks internal need values that change over time and drive behavior.

### Need Types

| Need | Range | Rises when... | Falls when... | Behavior when high |
|------|-------|--------------|--------------|-------------------|
| **Hunger** | 0-100 | Always (slowly over time) | Fish is near food / eating | Seek food, forage, scoot along substrate |
| **Energy** | 0-100 | Fish is resting/idle | Fish is swimming (faster = more drain) | Seek resting spot, slow down, drift near plants |
| **Curiosity** | 0-100 | Fish is idle for too long | Fish is exploring new areas | Swim to unexplored areas, investigate objects |
| **Social** | 0-100 | Fish is alone (schooling species only) | Fish is near school members | Seek out school, swim closer to group |
| **Comfort** | 0-100 | Fish is in open water (shy species) | Fish is near plants/cover | Move toward plants, decorations, hiding spots |

### Need Rates

Needs rise and fall at different rates per species:

| Species | Hunger rate | Energy drain | Curiosity | Social need | Comfort need |
|---------|-----------|-------------|-----------|-------------|-------------|
| Neon tetra | Medium | Low | Low | High | Medium |
| Angelfish | Low | Medium | Medium | None | Low |
| Guppy | High | Low | High | Medium | Low |
| Betta | Low | Low | Medium | None | Medium |
| Corydoras | High | Low | Low | Medium | High |
| Pleco | Very low | Very low | Very low | None | High |
| Dwarf gourami | Medium | Medium | High | None | Medium |

---

## State Machine

Each fish is always in exactly one behavioral state. States determine which steering behaviors are active and how the fish moves.

### States

```
                    ┌──────────┐
           ┌───────│ WANDERING │───────┐
           │       └──────────┘       │
           │            │              │
     hunger > 70    energy < 30    curiosity > 80
           │            │              │
           ▼            ▼              ▼
    ┌────────────┐ ┌──────────┐ ┌────────────┐
    │  FORAGING  │ │ RESTING  │ │ EXPLORING  │
    └────────────┘ └──────────┘ └────────────┘
           │            │              │
     hunger < 20    energy > 80    curiosity < 20
           │            │              │
           └────────────┴──────────────┘
                        │
                        ▼
                  ┌──────────┐
                  │ WANDERING │
                  └──────────┘
```

Additional states for schooling species:
```
    social > 70 ──▶ SCHOOLING (seek and join school)
    social < 20 ──▶ return to previous state
```

Additional states for shy species:
```
    comfort > 70 ──▶ HIDING (seek cover near plants/decorations)
    comfort < 20 ──▶ return to previous state
```

### State: Wandering (Default)

- Phase 1 wander behavior
- All needs tick up slowly
- Transition to other states based on need thresholds

### State: Foraging

- Triggered when hunger rises above threshold
- **Behavior:**
  - Corydoras: nose-down scooting along substrate, occasional pause to "sift"
  - Surface feeders (guppy, gourami): rise to surface, peck at top
  - Mid-level fish: swim in search pattern, occasionally "peck" at plants or decorations
  - Pleco: scrape along surfaces slowly
- **Movement:** More directed, slightly faster, with frequent direction changes (searching)
- **Exit:** Hunger falls below low threshold after "eating" (time spent foraging reduces hunger)

### State: Resting

- Triggered when energy is low
- **Behavior:**
  - Seek a calm spot (near plants, in a cave, behind a decoration)
  - Slow to near-stop
  - Slight hovering motion (gentle bob)
  - Fins still animate slowly
- **Movement:** Minimal. Drift slowly in place.
- **Exit:** Energy recharges above threshold

### State: Exploring

- Triggered when curiosity is high (fish has been idle/stationary too long)
- **Behavior:**
  - Pick a distant area of the tank the fish hasn't visited recently
  - Swim to it with purpose
  - Look around (small circling movements)
  - Move to another area
- **Movement:** Purposeful, moderate speed, covering ground
- **Exit:** Curiosity drops as new areas are visited
- **Memory:** Fish tracks "recently visited" zones using a simple grid. Cells decay over time so old areas become interesting again.

### State: Schooling

- Schooling species only. Triggered when social need is high.
- **Behavior:**
  - Locate nearest group of same species
  - Swim to them (seek behavior)
  - Once in range, engage Phase 2 boids behaviors at higher intensity
  - Social need drops while in the school
- **Transition:** Gradual blend — boids weights increase as social need rises, making the transition smooth rather than abrupt.

### State: Hiding

- Shy species (corydoras, pleco). Triggered when comfort need is high.
- **Behavior:**
  - Identify nearest cover (plant cluster, cave, decoration underside)
  - Swim to it
  - Tuck in close and become very still
  - Comfort need drops while in cover
- **Movement:** Quick swim to cover, then nearly motionless

---

## State Transitions

- Transitions are not instant — there's a brief blending period (~0.5s) where the old state's forces fade out and the new state's forces fade in
- Prevents jarring behavior switches
- Priority: some needs override others
  - Boundary avoidance always wins (Phase 1)
  - Hiding > everything except boundary (safety first)
  - Low energy > hunger (a tired fish rests before eating)
  - Hunger > curiosity (a hungry fish eats before exploring)

---

## Personality Variation

Each individual fish gets slight randomization of its need parameters:

- Need rates: ±20% variation from species baseline
- Thresholds: ±10 variation on trigger/exit thresholds
- This means fish of the same species won't all get hungry or tired at the same time
- Creates natural staggering of behaviors within a school

---

## Time Scale

The needs system operates on a compressed timescale. Real fish eat once a day — that would be boring to watch.

Suggested starting points (to be tuned):

| Event | Real time equivalent | In-app time |
|-------|---------------------|-------------|
| Get hungry | Hours | 2-5 minutes |
| Get tired | Hours | 3-8 minutes |
| Get curious | Minutes-hours | 1-3 minutes |
| Full hunger-eat-rest cycle | Full day | ~10 minutes |

The viewer should see a full "day in the life" cycle play out over roughly 10-15 minutes of watching.

---

## Food System

Hunger needs something to "eat." In Phase 3, food appears naturally:

- **Algae growth** — Slow visual buildup on glass and rocks over time. Pleco and corydoras "graze" on it, reducing it.
- **Surface debris** — Tiny particles on the water surface. Surface feeders peck at them.
- **Substrate foraging** — Corydoras "find" food in the gravel (no visible food item, just the behavior).
- No user-fed food in this phase (that's in Future Interactions).

---

## Implementation Notes

### Need Update (per fish, per frame)

```
hunger += hunger_rate * delta_time
energy -= energy_drain * speed_ratio * delta_time  // faster = more drain
energy += energy_regen * delta_time  // if resting
curiosity += curiosity_rate * delta_time * (1 - speed_ratio)  // builds when still
social += social_rate * delta_time * (1 - nearby_school_ratio)  // builds when alone
comfort += comfort_rate * delta_time * (1 - cover_proximity)  // builds in open
```

### State Selection (per fish, per frame)

```
1. Check highest-priority unmet need
2. If current state already addresses it, continue
3. If not, begin transition to new state
4. During transition: blend force weights from old state to new state over 0.5s
```

### Exploration Memory

- Divide tank into a coarse grid (e.g., 8x6 cells)
- Each cell has a "visited" timer
- When a fish is in a cell, reset its timer to max
- Timers decay over time
- When exploring, the fish steers toward the cell with the lowest (most decayed) timer
- Per-fish memory — each fish has its own grid

---

## What This Phase Does NOT Include

- No predator/prey dynamics (would require a different scene or special events)
- No breeding or lifecycle (fish don't reproduce or age)
- No weather or time-of-day changes to needs
- No user-triggered feeding (documented in Future Interactions)
