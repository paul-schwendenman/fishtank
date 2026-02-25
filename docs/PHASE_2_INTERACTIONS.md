# Phase 2: Interactions

Animals become aware of each other and their environment. Movement is no longer independent — fish react to nearby fish and to objects in the scene.

Build on top of Phase 1 steering behaviors by adding social and environmental forces.

---

## Goals

- Fish form natural-looking groups (schooling species school, solitary species keep distance)
- Fish respond to environmental features (plants, rocks, caves)
- The tank feels like an ecosystem, not a collection of independent actors
- All interactions are subtle and emergent — no scripted sequences

---

## Social Behaviors

### Schooling (Boids)

Applies to schooling species: neon tetras, corydoras, guppies.

Three classic boids forces, applied only to fish of the same species within a perception radius:

#### Separation
- Steer away from nearby fish that are too close
- Prevents overlap and clumping
- Short range (body-length scale)
- Strong force — highest priority

#### Alignment
- Steer to match the average heading of nearby school members
- Creates coordinated swimming direction
- Medium range
- Medium force

#### Cohesion
- Steer toward the average position of nearby school members
- Keeps the school together
- Longest range of the three
- Gentle force

**Tuning per species:**

| Species | School size | Perception radius | Separation | Alignment | Cohesion | Result |
|---------|------------|-------------------|------------|-----------|----------|--------|
| Neon tetra | 6-10 | 80px | High | High | Medium | Tight, coordinated school |
| Corydoras | 3-4 | 60px | Medium | Low | Medium | Loose bottom cluster |
| Guppy | 3-5 | 70px | Medium | Medium | Low | Casual grouping |

### Solitary Spacing

Applies to non-schooling species: angelfish, betta, dwarf gourami.

- Steer away from all other fish within a personal space radius
- Larger radius than schooling separation — these fish want more room
- Exception: mating pairs (angelfish) maintain moderate proximity

### Passive Avoidance

All fish, regardless of species:

- Avoid swimming directly into another fish
- If two fish are on a collision course, both steer slightly to one side
- No "bouncing" — smooth, subtle avoidance that looks like polite yielding

---

## Environmental Interactions

### Plant Awareness

- Fish steer around large plant clusters rather than swimming through them
- Small fish may swim between plant leaves (partial avoidance)
- Bettas drift near plants and occasionally idle beside them (affinity behavior)

### Decoration Interaction

- Fish treat decorations as obstacles — steer around rocks, driftwood
- Caves and arches: fish occasionally swim through the opening
- Pleco: positions itself on decoration surfaces (suction behavior)
  - Picks a spot on a rock or glass wall
  - Slowly moves to it
  - Stays latched for long periods
  - Occasionally repositions

### Substrate Awareness

- Corydoras stay in the bottom 20% and occasionally "scoot" along the gravel
  - Nose-down posture
  - Short bursts of movement along the substrate
  - Pause to "sift" (idle with slight body wiggle)
- Other bottom-feeders respect a floor boundary

### Surface Awareness

- Guppies and gouramis occasionally rise to the surface
- Brief visit — swim up, idle at the top for a moment, then descend
- Subtle surface ripple effect when a fish is near the top

---

## Perception System

Each fish has a perception radius — a circle around it that defines what it can "see."

- Only fish and objects within the perception radius influence steering
- Perception is directional — fish see better in front than behind (wedge-shaped perception zone)
- Forward arc: ~270 degrees (small blind spot directly behind)

```
        ╱ perception zone ╲
       ╱                   ╲
      ╱                     ╲
     ╱                       ╲
    ◀━━━━━━━ FISH ━━━━━━━━━━━▶
     ╲                       ╱
      ╲                     ╱
       ╲                   ╱
        ╲_________________╱
              blind spot
```

---

## Force Composition

Phase 2 adds new forces to the steering calculation. All forces are weighted and summed:

```
total_force =
    wander_force * wander_weight
  + boundary_force * boundary_weight
  + separation_force * separation_weight      // NEW
  + alignment_force * alignment_weight         // NEW
  + cohesion_force * cohesion_weight           // NEW
  + obstacle_avoidance * obstacle_weight       // NEW
  + surface_seek * surface_weight              // NEW (species-specific)
```

Weights are species-dependent. Schooling species have high boids weights. Solitary species have high separation weight and zero alignment/cohesion.

### Priority System

When forces conflict, some take priority:

1. **Boundary avoidance** — Never leave the tank (highest)
2. **Obstacle avoidance** — Don't swim into rocks
3. **Separation** — Don't overlap with other fish
4. **Alignment / Cohesion** — School together
5. **Wander** — Explore (lowest, fills in when nothing else is active)

Implementation: process forces in priority order and reduce the remaining "force budget" as each is applied.

---

## Spatial Optimization

With many fish checking distances to each other, naive O(n²) gets expensive.

- Use a **spatial hash grid** to partition the tank into cells
- Each frame, assign fish to cells based on position
- When querying neighbors, only check the current cell and adjacent cells
- Cell size should roughly match the largest perception radius
- For MVP fish counts (15-25 fish) this is optional but good to build early

---

## What This Phase Does NOT Include

- No internal states or drives (hunger, energy)
- No predator/prey dynamics
- No breeding or lifecycle
- No user-triggered interactions

These are addressed in Phase 3 and Future Interactions.
