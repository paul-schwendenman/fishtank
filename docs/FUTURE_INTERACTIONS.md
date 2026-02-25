# Future Interactions

The app is primarily passive — a screensaver you watch. But optional, non-intrusive interactions could add delight without breaking the relaxing vibe.

These are documented for future consideration. None are in scope for the initial build.

---

## Design Principles for Interactions

- **Never required.** The app must be fully enjoyable without any interaction.
- **Non-intrusive.** No buttons, no HUD, no prompts. Interactions happen through direct manipulation (click/tap on the scene).
- **Gentle responses.** Animals react naturally, not cartoonishly. No speech bubbles, no score popups.
- **No gamification.** No points, no unlocks, no achievements. The reward is the reaction itself.

---

## Fish Tank Interactions

### Tap to Feed

- Click/tap the water surface to drop a few food flakes
- Flakes drift down slowly, swaying side to side
- Nearby fish notice and swim toward the food (hunger need spikes or override)
- Fish "eat" flakes on contact (flake disappears)
- Bottom feeders wait for flakes to reach the substrate
- Overfeeding: if too many flakes are dropped, water gets slightly cloudy (visual feedback, clears over time)

### Tap the Glass

- Click/tap the glass (edges of the tank)
- Nearby fish startle and dart away from the tap point
- Fish that are further away are less affected
- Fish gradually calm down and return to normal behavior
- Pleco is unaffected (they don't care)

### Flashlight / Spotlight

- Hold click to create a soft spotlight on the tank
- Fish react to the light — some are drawn to it, some avoid it
- Light-attracted fish gather near the beam
- Shy fish move away
- Release to remove the light; fish return to normal

### Cursor Follow

- When the mouse moves slowly across the tank, nearby fish track it with their eyes (subtle)
- Some curious fish (gourami, guppy) follow the cursor briefly
- Timid fish (corydoras) move away from the cursor

---

## Bird Feeder Interactions

### Refill the Feeder

- Click the bird feeder to refill it with seeds
- When the feeder empties over time, fewer birds visit
- Refilling triggers a gradual increase in bird arrivals

### Scatter

- Click/tap near birds to startle them
- Birds take flight in a burst, circle, and cautiously return over 30-60 seconds
- Different species have different scare distances and return times

### Place Food on Ground

- Click the ground to scatter seeds
- Ground-feeding species (sparrows, juncos) come to eat from the ground
- Different from feeder — attracts different species

---

## Flock of Birds Interactions

### Wind Gust

- Click and drag to create a wind gust in a direction
- The flock reacts by shifting in that direction
- Creates dramatic murmuration ripples through the flock
- Flock reforms after the gust passes

### Predator

- Click to spawn a hawk silhouette that dives through the flock
- Flock explodes outward, splits, reforms
- Hawk circles once and leaves
- Dramatic and satisfying but use sparingly (cooldown)

---

## Ant Farm Interactions

### Drop Food

- Click the surface to place a food crumb
- Scout ants discover it and lay pheromone trails back to the colony
- Worker ants follow the trail to the food and carry pieces back
- Watch the trail form and strengthen as more ants use it

### Dig Assist

- Click in the soil to create a small cavity
- Ants discover the new space and connect it to the tunnel network
- They may convert it to a storage or nursery chamber

### Block a Tunnel

- Click a tunnel to place a temporary blockage
- Ants reroute around the obstruction
- Eventually "dig through" the blockage to restore the path

---

## Global Interactions (All Scenes)

### Time of Day

- Keyboard shortcut or slider to change time of day
- Lighting shifts from dawn → day → dusk → night
- Animal behavior changes: nocturnal species become active, diurnal species rest

### Screenshot Mode

- Keyboard shortcut to hide any UI elements and take a clean screenshot
- Optional: frame the scene with a subtle border

### Zen Mode

- Double-click or keyboard shortcut to enter a stripped-down mode
- Removes any remaining UI (settings gear, scene picker)
- Pure, uninterrupted viewing
- ESC to exit

---

## Implementation Priority

If interactions are ever added, suggested order:

1. **Tap to Feed** (fish tank) — Most intuitive, most satisfying
2. **Tap the Glass** — Simple to implement, fun reaction
3. **Cursor Follow** — Subtle and delightful
4. **Zen Mode** — Quality of life
5. **Scene-specific interactions** — Based on which scenes exist

---

## Technical Considerations

- All interactions use standard mouse/touch events on the canvas
- No additional UI elements needed — the canvas IS the interface
- Interactions dispatch events into the simulation (e.g., "food dropped at x,y" or "startle at x,y with radius r")
- The simulation handles the response through existing steering/needs systems
- Mobile: touch events map naturally to click events
