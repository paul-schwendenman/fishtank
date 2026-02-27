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

## Fall Tree

A single majestic tree in autumn, viewed from a distance. Its canopy is ablaze with reds, oranges, and golds. Leaves detach one by one and drift slowly to the ground, tumbling and spinning in the air. A carpet of fallen leaves builds up beneath the tree over time.

**Mood:** Quiet, nostalgic, contemplative. The stillness of a crisp autumn day.

**Key behaviors:**
- Leaves detach from random points in the canopy at a slow, steady rate
- Each leaf tumbles and sways as it falls — gentle side-to-side rocking, spinning on its axis
- Wind gusts occasionally sweep through, shaking the tree and releasing a flurry of leaves
- Leaves slow down and settle as they reach the ground, coming to rest naturally
- The canopy gradually thins over time, revealing more branches beneath
- Occasional breeze stirs leaves already on the ground, lifting a few back into the air

**Environment elements:**
- A large deciduous tree (oak or maple silhouette) with detailed branching structure
- Canopy of warm autumn colors — a mix of red, orange, gold, and a few lingering greens
- Grass beneath the tree, partly visible beneath the growing leaf pile
- Soft sky gradient — pale blue to warm white, maybe hints of distant clouds
- Gentle rolling ground or a slight hill the tree sits on
- Optional: a wooden fence, a park bench, or a distant treeline to set the scene
- Subtle shadow from the tree shifts slowly as if time is passing

**Leaf types:**
| Type | Shape | Colors | Fall style |
|------|-------|--------|------------|
| Maple | Star-shaped, pointed lobes | Bright red, orange, crimson | Slow helicopter spin |
| Oak | Rounded lobes, elongated | Brown, rust, dark gold | Gentle rocking sway |
| Birch | Small, rounded | Bright yellow, gold | Quick flutter |
| Misc | Simple oval | Orange, amber | Lazy tumble |

**Rendering notes:**
- Leaves should feel hand-drawn — simple shapes with slight irregularity
- Each leaf has a subtle rotation and foreshortening as it tumbles (2D approximation of 3D spin)
- Depth layering: some leaves fall in front of the trunk, some behind
- Fallen leaves on the ground pile up with slight overlap and random angles
- The canopy is rendered as clusters of colored shapes; as leaves detach, gaps appear
- Wind gusts visualized by a slight lean of branches and acceleration of falling leaves
- Light filtering through thinning canopy creates dappled ground shadows

**Animation phases:**
| Phase | Duration | Description |
|-------|----------|-------------|
| Full canopy | 0–30s | Tree starts lush, only a few leaves fall |
| Steady fall | 30s–3min | Leaves drop at a comfortable pace, ground cover builds |
| Wind gust | Random | Brief burst of many leaves, tree sways |
| Thinning | 3–5min | Canopy noticeably sparse, branches showing |
| Bare | 5min+ | Mostly bare branches, few remaining leaves, thick ground cover |
| Reset | Fade | Gentle fade transition back to full canopy to loop |

---

## Cat Cafe

A cozy cat cafe viewed from a seated perspective. Cats of various breeds lounge, play, and wander around a warm interior filled with cushions, cat trees, shelves, and sunbeams. Some cats nap, some groom, some bat at dangling toys, and occasionally one knocks something off a table.

**Mood:** Warm, playful, relaxing. Like spending a lazy afternoon in a cat cafe with a cup of coffee.

**Key behaviors:**
- Cats nap in curled-up or stretched-out poses, breathing gently visible
- Cats groom themselves — licking paws, washing faces
- A cat slowly stalks and then pounces on a dangling toy or another cat's tail
- Cats stretch and yawn when waking up from a nap
- A cat hops up onto a shelf or windowsill, surveys the room, then settles
- Cats rub against furniture legs or each other as they walk past
- One cat bats an object off a table edge — it falls to the floor
- Tail flicking and ear swiveling while idle
- A cat kneads a cushion before lying down
- Occasional zoomies — one cat sprints across the room for no reason

**Environment elements:**
- Warm-toned interior — wooden floors, soft lighting, earth tones
- Cat tree with multiple platforms, scratching posts, and a dangling toy
- Windowsill with a sunbeam that shifts slowly, cats migrate to follow it
- Cushions and cat beds scattered around the floor
- A low table with a coffee cup (that one cat keeps eyeing)
- Wall-mounted shelves at different heights for cats to perch on
- A small bookshelf or plant shelf for visual depth
- Optional: a human hand occasionally reaching in to pet a nearby cat

**Cat types:**
| Type | Build | Colors | Personality |
|------|-------|--------|-------------|
| Orange tabby | Stocky, round | Orange with darker stripes | Lazy, always napping in the sunbeam |
| Tuxedo | Medium, sleek | Black and white | Curious, the one who knocks things off tables |
| Calico | Small, compact | Patches of orange, black, white | Social, rubs against everything |
| Grey longhair | Fluffy, large | Solid grey, bushy tail | Regal, prefers high shelves |
| Siamese | Slender, angular | Cream with dark points | Playful, initiates zoomies |

**Rendering notes:**
- Cats rendered as simple but expressive shapes — oval body, round head, triangular ears, long tail
- Tail animation is key to personality — slow sway (relaxed), quick flick (alert), puffed (startled)
- Sleeping cats: gentle rhythmic body expansion (breathing)
- Eyes: slow blinks for contentment, wide for alert/hunting, half-closed for sleepy
- Depth layering: cats on floor vs. on shelves vs. on cat tree at different z-levels
- Sunbeam rendered as a soft warm gradient that shifts position over time
- Furniture provides natural obstacles for pathfinding

**Cat states:**
| State | Duration | Transitions to |
|-------|----------|----------------|
| Sleeping | 30s–2min | Waking (stretch + yawn) |
| Lounging | 15s–1min | Sleeping, Walking, Grooming |
| Grooming | 10–30s | Lounging, Walking |
| Walking | 5–20s | Lounging, Jumping, Stalking |
| Jumping | 1–3s | Lounging (on new surface) |
| Stalking | 5–15s | Pouncing |
| Pouncing | 1–2s | Walking, Lounging |
| Zoomies | 3–8s | Walking (stops abruptly, looks around) |
| Kneading | 5–15s | Sleeping |
| Knocking | 2–5s | Walking (saunters away indifferently) |

---

## Farm Field

**Full spec:** [FARM_FIELD.md](./FARM_FIELD.md)

A pastoral dairy farm viewed from the side. Cows graze, rest, and wander across a gently rolling green field under a wide open sky. Butterflies drift between wildflowers, birds perch on fence posts, and clouds drift slowly overhead.

**Mood:** Warm, spacious, peaceful. Like sitting on a hillside watching the world slow down.

**Key behaviors:**
- Cows graze with heads lowered, occasionally lifting to look around
- Cows walk in a slow amble, loosely clustering together
- Cows lie down to rest, then rise with that characteristic awkward heave
- Butterflies flutter between wildflowers, birds hop along the fence

**Environment elements:**
- Gently rolling green pasture with wildflowers
- Wooden post-and-rail fence across the mid-ground
- Broad trees providing shade, distant treeline on the horizon
- Wide open sky with soft cumulus clouds drifting past
- Foreground grass swaying in a gentle breeze

**Cow varieties:**
| Variety | Color | Notes |
|---------|-------|-------|
| Holstein | White with black patches | Classic dairy cow |
| Jersey | Warm tan/fawn | Gentle, compact build |
| Brown Swiss | Solid grey-brown | Calm, sturdy |
| Guernsey | Golden-red and white | Warm distinctive markings |
| Belted Galloway | Black with white belt | The "Oreo cow" — visually striking |

---

## Future Scene Ideas (Not Planned)

These are brainstorm-level ideas, not committed:

- **Coral Reef** — colorful coral formations, clownfish darting into anemones, tangs and wrasses cruising past, maybe a moray eel peeking from a crevice. Bright, warm, tropical lighting with shafts of sun from above.
- **Deep Sea** — near-black water, bioluminescent creatures glowing and pulsing, an anglerfish lure dangling in the dark, particles drifting upward. Eerie and beautiful.
- **Tide Pool** — top-down rocky pool at the shore, crabs scuttling sideways, starfish creeping along, sea urchins, small trapped fish, anemones waving. Waves occasionally wash over the edge.
- **River** — side view of a flowing freshwater river with visible current, salmon swimming upstream, smooth river rocks, fallen leaves drifting on the surface, maybe a bear paw swiping in.
- **Jellyfish Tank** — dark cylindrical aquarium, glowing jellyfish drifting and pulsing with translucent bells, ambient particles, color-shifting lighting. Hypnotic and minimal.
- **Fireflies** — a dark meadow at dusk with fireflies blinking in patterns, grass swaying, distant treeline silhouette
- **Butterfly Garden** — flowers and butterflies with fluttering, landing, feeding
- **Beehive** — cross-section of a hive with worker bees, honeycomb building
- **Savanna Watering Hole** — animals arriving at and drinking from a watering hole
