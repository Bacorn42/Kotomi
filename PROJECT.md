# Kotomi Project Notes

## Overview

Kotomi is a self-hosted personal project hub built with Node.js and Express. It brings together AI tools, utilities, games, dashboards, and experiments under a shared platform.

Applications share authentication, theming, the application shell, and common services.

Current applications:

- AI Image Generator
- Dice Game
- Chat

## Tech Stack

- **Backend:** Node.js, Express, Socket.IO
- **Frontend:** HTML, CSS, JavaScript ES modules
- **Database:** SQLite via `better-sqlite3`
- **HTTP:** Axios
- **AI:** Ollama, ComfyUI
- **Image generation:** ComfyUI with Z-Image Turbo workflow

## Architecture

Important directories:

- `src/apps/` — application-specific backend code
- `src/database/` — database connection and schema
- `src/middleware/` — shared middleware
- `src/services/` — shared services
- `public/apps/` — frontend applications
- `public/css/`, `public/js/` — shared frontend assets

Architecture principles:

- Routes handle HTTP requests and response formatting.
- Services coordinate business logic and application operations.
- Repositories handle database access.
- Pure game logic belongs in the Dice Game's core layer.
- Keep applications modular and avoid premature abstraction.

SQLite schema is maintained in `schema.sql`; local database files are excluded from Git.

## Authentication

Implemented:

- Username/password accounts with salted password hashing
- Cookie-based sessions
- Registration, login, and logout
- Authentication middleware

Users are the ownership boundary for application data. Queries involving user-owned data must enforce ownership.

## AI Image Generator

**Status:** Functional foundation complete.

Features:

- Ollama-based prompt enhancement
- ComfyUI image generation
- Configurable resolution, steps, and seed
- Socket.IO progress updates
- Persistent, user-owned image history
- Image regeneration, deletion, and downloads

Potential future improvements include tags, favorites, search, batch generation, and additional workflows.

## Dice Game

**Status:** Functionally playable; ongoing development is primarily testing, content, balancing, and polish.

A progression game built around rolling dice, earning money, buying upgrades, equipping items, and finding loot.

Implemented:

- Server-side rolls and cooldown enforcement
- Configurable dice and score/money multipliers
- Fixed-point money storage using `MoneyCents`
- Shop, inventory, and equip/unequip systems
- Generated loot with Common, Uncommon, Rare, Epic, and Legendary rarities
- Rarity-scaled item effects
- Persistent achievements, progress tracking, and unlock notifications
- Game UI for inventory, shop, achievements, and player configuration

### Item Design

- `ItemDefinitions` stores item templates.
- `ItemDefinitionEffects` stores template effects.
- `PlayerItems` stores individual owned items.
- `PlayerItemEffects` stores the effects attached to owned items.

Shop items are fixed purchases without rarity. Generated loot has rarity and independent effects, so balance changes to templates do not retroactively alter existing items.

Money is stored as integer cents. The current payout formula is:

`moneyCents = round(0.0030137 * log10(score)^8.38 * moneyMultiplier)`

Scores below 100 award no money.

Future work may include more items, achievements, statistics, improved UI, and additional mechanics. Keep the game simple and its progression understandable.

## Chat

**Status:** Feature-complete for current needs.

A conversational interface backed by Ollama.

Implemented:

- Streaming model responses
- Persistent conversations and messages
- Conversation creation, selection, deletion, and renaming
- Per-user conversation ownership
- Configurable model and generation settings
- Configurable context window and temperature
- Context-usage meter
- Persistent prompt and response token counts per conversation

Context usage is recorded from Ollama's prompt and response token counts and restored when a conversation is reopened.

The current feature set is sufficient for everyday use. Avoid adding features without a demonstrated need; future improvements should be driven by actual usage.

## Development Priorities

Prioritize:

1. Fixing bugs and addressing issues discovered through use
2. Testing and balancing the Dice Game
3. Improving existing applications where there is a clear need
4. Adding features based on actual requirements

Avoid implementing features merely because other applications commonly have them.

## Development Principles

- Keep business logic out of routes.
- Keep database access in repositories.
- Keep application services responsible for orchestration.
- Enforce user ownership on all relevant data operations.
- Prefer straightforward, modular implementations over premature abstraction.
- Preserve working functionality when extending existing systems.
- Keep documentation concise and focused on current architecture, behavior, and decisions.

Git history serves as the development record; documentation should describe the current state rather than duplicate the commit history.
