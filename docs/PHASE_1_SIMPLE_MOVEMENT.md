# Phase 1: Simple Movement

The foundation. Make animals move in a way that looks natural and alive using basic steering behaviors.

Phase 1 is the only behavior system needed for the MVP. Fish don't need to interact with each other or have internal states — they just need to swim convincingly.

---

## Goals

- Every animal moves smoothly with no jank, jitter, or robotic patterns
- Movement looks intentional — fish appear to be "going somewhere," not just bouncing around
- Each species has a distinct movement personality (darty tetras vs gliding angelfish)
- Fish stay within the tank boundaries naturally (not bouncing off invisible walls)

---

## Core Concepts

### Steering Behaviors

Based on Craig Reynolds' steering behaviors. Each fish has:

- **Position** — Where it is (x, y)
- **Velocity** — Where it's going and how fast (vx, vy)
- **Acceleration** — Accumulated steering forces each frame
- **Max speed** — Species-dependent speed cap
- **Max force** — How sharply it can steer (turn rate)

Each frame:
1. Calculate steering forces from active behaviors
2. Sum and clamp forces to `max_force`
3. Apply force to velocity
4. Clamp velocity to `max_speed`
5. Update position
6. Reset acceleration

### Active Behaviors

#### Wander

The primary behavior. Makes fish meander naturally without a specific target.

- Project a circle in front of the fish (wander distance)
- Pick a random point on that circle (wander angle), constrained by a jitter amount
- Steer toward that point
- The wander angle changes slowly over time (small random nudges each frame)
- Result: smooth, organic-looking exploration of the space

**Tuning by species:**
| Species | Wander radius | Jitter | Result |
|---------|--------------|--------|--------|
| Neon tetra | Small | High | Quick, darty changes |
| Angelfish | Large | Low | Long, sweeping glides |
| Guppy | Medium | Medium | Lively but smooth |
| Betta | Large | Very low | Slow, flowing, deliberate |
| Corydoras | Small | Medium | Short scoots along bottom |

#### Boundary Avoidance

Fish should stay in the tank without it looking like they're bouncing off walls.

- Define a soft boundary zone (e.g., 50-100px from tank edges)
- When a fish enters this zone, apply a steering force pushing it back toward the center
- Force strength increases the closer the fish gets to the edge (exponential falloff)
- This creates a natural "I don't want to go over there" effect
- Fish never actually touch the walls

**Special case:** Corydoras should stay near the bottom — their boundary zone is the lower 20% of the tank. Pleco stays near surfaces.

#### Idle / Pause

Fish don't swim constantly. They should occasionally pause.

- Random chance each frame to enter an "idle" state
- During idle: velocity decays toward zero, fins still flutter gently
- Duration: 1-5 seconds (species-dependent)
- After idle: resume wandering with a gentle acceleration
- Angelfish and bettas idle more. Tetras idle rarely and briefly.

---

## Speed & Scale Reference

All values are relative and will be tuned visually. Starting points:

| Species | Max speed (px/s) | Max force | Idle frequency | Idle duration |
|---------|-----------------|-----------|----------------|---------------|
| Neon tetra | 120 | 3.0 | Low | 0.5-1s |
| Angelfish | 60 | 1.0 | High | 2-5s |
| Guppy | 100 | 2.5 | Medium | 1-2s |
| Betta | 40 | 0.8 | High | 3-6s |
| Corydoras | 80 | 2.0 | Medium | 1-3s |
| Pleco | 10 | 0.3 | Very high | 10-30s |
| Dwarf gourami | 50 | 1.2 | Medium | 2-4s |

---

## Depth Simulation (Pseudo-3D)

Fish exist on different depth layers to create a sense of 3D in the 2D scene.

- Each fish has a `depth` value (0.0 = front glass, 1.0 = back wall)
- Depth affects:
  - **Scale** — Back fish are slightly smaller (0.7x - 1.0x)
  - **Color** — Back fish are slightly desaturated and bluer (water haze)
  - **Speed** — Back fish move slightly slower (perspective)
  - **Draw order** — Back fish render first (behind front fish)
- Fish can slowly drift between depth layers over time (very slow, maybe once every 30-60 seconds)
- Depth changes are smooth transitions, not instant jumps

---

## Spawning

When the scene loads:

1. Place fish at random positions within the tank boundaries
2. Assign random initial velocities (within species speed range)
3. Assign random depth values
4. Stagger spawn slightly (don't pop all fish in at once) — fade them in over 2-3 seconds

---

## Implementation Notes

### Update Loop (per fish, per frame)

```
1. Check if idle
   - If idle timer active, decay velocity, skip steering
   - If idle timer expired, exit idle state
   - Random chance to enter idle state

2. Calculate steering forces
   - wander_force = wander behavior
   - boundary_force = boundary avoidance
   - total_force = wander_force + boundary_force

3. Apply physics
   - acceleration = clamp(total_force, max_force)
   - velocity += acceleration * delta_time
   - velocity = clamp(velocity, max_speed)
   - position += velocity * delta_time

4. Update animation
   - tail_phase += tail_frequency * speed_ratio * delta_time
   - fin_phase += fin_frequency * delta_time
   - facing_angle = lerp(facing_angle, atan2(vy, vx), turn_smoothing)
```

### Wander Implementation

```
- wander_angle += random(-jitter, jitter) each frame
- wander_target = position + normalize(velocity) * wander_distance
                  + (cos(wander_angle), sin(wander_angle)) * wander_radius
- wander_force = steer_toward(wander_target)
```

### Boundary Avoidance Implementation

```
- For each edge (top, bottom, left, right):
  - distance = fish position to edge
  - if distance < boundary_threshold:
    - strength = 1.0 - (distance / boundary_threshold)  // 0 at threshold, 1 at edge
    - strength = strength * strength  // exponential
    - apply force away from edge, scaled by strength * max_boundary_force
```

---

## What This Phase Does NOT Include

- Fish don't react to each other (no schooling, no avoidance)
- Fish don't interact with decorations (no hiding, no resting on objects)
- Fish have no internal states (no hunger, no energy)
- No user interaction

These are all addressed in Phase 2 and Phase 3.
