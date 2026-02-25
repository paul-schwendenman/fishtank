# Product Vision

## Overview

A relaxing, passive screensaver-style web application that simulates realistic animal behavior across multiple natural environments. Inspired by the Roku screensaver aesthetic — stylized 2D illustrations with smooth, lifelike animation.

The app is designed to be opened fullscreen and left running. It's ambient, beautiful, and calming.

## Core Principles

- **Relaxing first.** Every design decision should serve the goal of creating a calming experience. No jarring movements, no sudden changes, no UI clutter.
- **Believable movement.** Animals should move in ways that feel natural and alive. This is the core of the product — if the movement doesn't feel right, nothing else matters.
- **Beautiful to look at.** Stylized 2D illustration style with rich colors, subtle depth, and gentle lighting. Think flat design with layered parallax, not photorealism.
- **Simple on the surface.** Looks effortless. No visible configuration, no menus cluttering the screen. It just works.
- **Modular by design.** Each scene (fish tank, bird flock, ant farm) is a self-contained module. New scenes can be added without touching existing ones.

## Tech Stack

- **Platform:** Web application (runs in any modern browser)
- **Rendering:** HTML5 Canvas (2D context) — may evaluate WebGL later if performance demands it
- **Language:** TypeScript
- **Build tool:** Vite
- **No framework** for the UI — this is a canvas app, not a DOM app. Minimal HTML wrapper.
- **Audio:** Web Audio API for ambient sounds

## Visual Style

Inspired by the Roku aquarium/nature screensavers:

- Stylized 2D illustration, not photorealistic
- Flat color shapes with subtle gradients and soft edges
- Layered backgrounds creating depth through parallax
- Gentle, ambient lighting effects (light rays, caustics, glow)
- Muted, harmonious color palettes per scene
- Smooth easing on all movement — nothing linear or robotic

## Scenes

Each scene is a standalone environment. The user picks one to display. Scenes are separate — no mixing of environments.

### Planned Scenes

| Scene | Description | Priority |
|-------|-------------|----------|
| **Fish Tank** | Tropical freshwater aquarium with varied fish, plants, bubbles, and decorations | MVP — build first |
| **Flock of Birds** | Birds in flight across an open sky, with flocking/murmuration behavior | Phase 2 |
| **Bird Feeder / Backyard** | A backyard scene with birds landing, feeding, hopping, flying off | Phase 2 |
| **School of Fish** | Open ocean school of fish — larger scale than the tank, with predator dynamics | Phase 3 |
| **Ant Farm** | Cross-section ant colony with tunnels, foraging, and coordinated work | Phase 3 |

See [SCENES.md](./SCENES.md) for detailed scene descriptions.

## Audio

- Each scene has its own ambient soundscape
- Subtle, looping, non-intrusive
- Examples: water bubbles for fish tank, birdsong for backyard, wind for flock
- Audio should be optional (mute by default, toggle on)

## Behavior Simulation — Phased Approach

Animal behavior is built in three phases, each adding realism:

| Phase | Name | Description |
|-------|------|-------------|
| 1 | Simple steering | Smooth, natural movement using steering behaviors (seek, wander, avoid walls). Looks alive. |
| 2 | Interactions | Animals respond to each other and the environment (schooling, hiding, resting near objects). |
| 3 | Needs & states | Animals have internal drives (hunger, energy, curiosity) that shape behavior over time. |

Each phase has its own detailed spec:
- [Phase 1: Simple Movement](./PHASE_1_SIMPLE_MOVEMENT.md)
- [Phase 2: Interactions](./PHASE_2_INTERACTIONS.md)
- [Phase 3: Complex Behavior](./PHASE_3_COMPLEX_BEHAVIOR.md)

## User Interaction

The app is **primarily passive** — a screensaver you watch, not a game you play.

Potential future interactions are documented in [FUTURE_INTERACTIONS.md](./FUTURE_INTERACTIONS.md) but are out of scope for the initial build.

## Customization

Minimal. The app should look great out of the box.

- Choose which scene to display
- A small number of presets per scene (e.g., "tropical tank" vs "goldfish bowl")
- Settings accessible via a subtle gear icon or keyboard shortcut, hidden after a few seconds of inactivity

## Performance Targets

- **60fps** on modern hardware at 1080p
- Graceful degradation — reduce particle count / fish count on lower-end devices
- No visible jank or stutter. Smooth animation is non-negotiable for a relaxation app.
- Minimal memory footprint — this runs in a background tab or fullscreen for hours

## Non-Goals

- Not a game. No scores, no objectives, no progression.
- Not a simulation tool. Scientific accuracy is nice but secondary to visual appeal.
- Not social. No sharing, no multiplayer, no accounts.
- Not mobile-first. Desktop browser is the primary target. Mobile is a nice-to-have.
