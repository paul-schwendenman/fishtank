# Scenes Overview

Each scene is a self-contained environment module. Scenes do not mix — the user selects one to display at a time.

---

## Fish Tank (MVP)

**Full spec:** [FISH_TANK.md](./FISH_TANK.md)

A home aquarium viewed from the front. Tropical fish of varied species swim among plants, rocks, and decorations. Bubbles rise from an aerator. Subtle light rays filter down from above.

**Mood:** Warm, cozy, intimate. Like having a nice tank in your living room.

---

## Flock of Birds

A wide open sky with a flock of birds performing murmuration — hundreds of small birds wheeling and turning in coordinated patterns. Clouds drift slowly. The sun sets or rises over a distant horizon.

**Mood:** Expansive, awe-inspiring, meditative.

**Key behaviors:**
- Classic boids flocking (separation, alignment, cohesion)
- Murmuration patterns — dense, swirling formations
- Occasional splits and rejoins of the flock
- Birds on the edges peel off and loop back

**Environment elements:**
- Gradient sky with slow color shifts (golden hour)
- Drifting clouds at different layers
- Distant treeline or hillside silhouette
- Optional: power lines or a lone tree the flock avoids

---

## Bird Feeder / Backyard

A cozy backyard scene viewed from a window. A bird feeder hangs from a tree branch. Birds arrive, land, eat, hop around, and fly off. Different species come and go.

**Mood:** Homey, gentle, familiar. Like watching birds from your kitchen.

**Key behaviors:**
- Birds approach from off-screen, circle, and land on the feeder or nearby branches
- Feeding behavior — pecking, looking around, pecking again
- Hopping along branches and on the ground
- Startling and flying away, then cautiously returning
- Territorial behavior — one bird chasing another off

**Environment elements:**
- Backyard with fence, grass, maybe a garden
- Tree with branches at different depths
- Bird feeder (tube, platform, or suet style)
- Seasonal variations (spring blossoms, fall leaves, snow)
- Squirrel that occasionally tries to raid the feeder

---

## School of Fish (Open Ocean)

A vast open-water scene. A large school of fish (hundreds) moves as one organism through deep blue water. Shafts of sunlight pierce from above. Occasionally a larger predator fish passes through, causing the school to split and reform.

**Mood:** Deep, oceanic, hypnotic. Scale and movement.

**Key behaviors:**
- Large-scale schooling with tight coordination
- Reactive splitting when a predator approaches
- Reforming after threat passes
- Subtle individual variation within the school
- Current drift — the whole school shifts with water movement

**Environment elements:**
- Deep blue gradient background
- Volumetric light shafts from above
- Distant reef or rock formations (parallax)
- Floating particles (plankton, sediment)
- Occasional jellyfish or sea turtle passing through

---

## Ant Farm

A cross-section view of an underground ant colony. Tunnels branch through layered soil. Ants move purposefully — carrying food, digging new tunnels, tending larvae, following pheromone trails.

**Mood:** Busy, organized, fascinating. Watching hidden infrastructure.

**Key behaviors:**
- Path-following along established tunnels
- Digging — ants at tunnel endpoints slowly extending them
- Food carrying — ants moving from surface entrance to storage chambers
- Pheromone trails — ants prefer paths other ants have taken
- Chamber-specific behavior (nursery, food storage, queen's chamber)

**Environment elements:**
- Cross-section of soil with visible layers (topsoil, clay, rock)
- Surface level with grass, a small rock, maybe a dropped crumb
- Tunnel network that slowly grows over time
- Different chamber types with distinct looks
- Roots from surface plants poking through

---

## Koi Pond (Top-Down)

A tranquil koi pond viewed from directly above. Large, colorful koi glide through dark water, their shapes rippling beneath the surface. Lily pads dot the water, frogs sit and occasionally leap, and dragonflies skim across the surface. Leaves and petals drift slowly on the water.

**Mood:** Zen, contemplative, serene. Like sitting on a wooden bridge looking down into a Japanese garden pond.

**Key behaviors:**
- Koi swim in slow, graceful arcs — wide turns, never rushed
- Koi occasionally drift to the surface, mouths open (feeding behavior)
- Koi loosely follow each other, sometimes clustering, sometimes spreading out
- Frogs sit motionless on lily pads, then suddenly leap to another pad or into the water
- Frogs croak occasionally (subtle visual: throat puff animation)
- Dragonflies hover, dart, hover again — fast bursts between pauses
- A turtle slowly crosses the pond, pausing to bask on a rock

**Environment elements:**
- Dark, slightly murky water with subtle caustic light patterns on the pond floor
- Lily pads of varying sizes, some with flowers (white or pink lotus/water lilies)
- Rocks visible at the bottom through the water, some breaking the surface
- Fallen leaves and flower petals drifting on the surface
- Subtle ripples trailing behind koi near the surface
- Pond edge visible at the margins — mossy stones, ferns, overhanging grass
- Optional: a stone lantern or bamboo water feature (shishi-odoshi) at the edge

**Koi varieties:**
| Variety | Color | Notes |
|---------|-------|-------|
| Kohaku | White with red patches | Classic, most recognizable |
| Taisho Sanke | White with red and black | Elegant tricolor |
| Showa | Black with red and white | Bold, dramatic |
| Ogon | Solid metallic gold | Shimmers in the light |
| Asagi | Blue-grey back, red belly | Subtle, beautiful from above |

**Rendering notes (top-down perspective):**
- Fish are seen from above — body is a tapered oval, tail fans out behind
- Koi patterns (patches of color) are key to their identity from this angle
- Fish below the surface have a slight wavering/refraction effect
- Depth is conveyed by opacity and blur — deeper fish are more muted and diffused
- Ripples radiate outward from surface-level fish and from frog jumps
- Lily pads cast subtle shadows on the pond floor

**Creatures:**
| Creature | Count | Behavior |
|----------|-------|----------|
| Koi | 6-10 | Slow gliding, surface feeding, loose grouping |
| Frogs | 2-4 | Sit on lily pads, occasional leaps, throat puffs |
| Dragonflies | 1-3 | Hover and dart above the water surface |
| Turtle | 0-1 | Slow crossing, basking on rocks |
| Water striders | 3-5 | Skate across the surface with tiny ripples |

---

## Future Scene Ideas (Not Planned)

These are brainstorm-level ideas, not committed:

- **Coral Reef** — underwater reef teeming with varied marine life
- **Fireflies** — a dark meadow with fireflies blinking in patterns
- **Butterfly Garden** — flowers and butterflies with fluttering, landing, feeding
- **Tide Pool** — small-scale marine life in a rocky pool
- **Beehive** — cross-section of a hive with worker bees, honeycomb building
- **Savanna Watering Hole** — animals arriving at and drinking from a watering hole
