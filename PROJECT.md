# Kotomi Project Notes

## Overview

Kotomi is a personal project hub built with Node.js and Express.

The goal is a modular platform for:

- AI tools
- utilities
- dashboards
- games
- experiments

Applications share:

- authentication
- UI theme
- application shell
- common services

Current applications:

- AI Image Generator
- Dice Game

---

# Stack

Backend:

- Node.js
- Express
- Socket.IO
- Axios
- SQLite (better-sqlite3)

Frontend:

- HTML/CSS/JavaScript
- ES modules
- Shared Kotomi UI components

AI:

- Ollama
- ComfyUI

Database:

- SQLite

Architecture:

- Routes handle HTTP endpoints and response formatting
- Services orchestrate application/game operations
- Core contains pure game logic
- Repositories handle database access and map database rows to application objects
- Configuration and constants contain static game configuration
- Frontend applications live under public/apps

---

# Current Architecture

Important directories:

```
src/
├── apps/
│   └── dice-game/
│       ├── config/
│       ├── constants/
│       ├── core/
│       ├── repositories/
│       ├── routes/
│       └── services/
├── middleware/
└── database/

public/
├── css/
├── js/
└── apps/
```

Database:

- SQLite database created locally
- Schema stored in schema.sql
- Database files excluded from git

---

# Authentication

Implemented:

- Username/password accounts
- Password hashing with salts
- Cookie-based sessions
- Login/register/logout
- Authentication middleware

Users are the root ownership entity for application data.

---

# Image Generator

Status: Complete foundation.

Features:

- Ollama prompt enhancement
- ComfyUI generation
- Configurable resolution
- Configurable steps
- Seed support
- Socket.IO progress updates
- Image history
- User-owned images
- Regeneration
- Delete/download support

Future ideas:

- Tags
- Favorites
- Search
- More workflows
- Batch generation

---

# Dice Game

Status: Functional prototype.

The Dice Game is a progression-based game where players roll dice, earn money, buy upgrades, equip items, and occasionally find loot.

Current systems:

## Rolling

Implemented:

- Server-side roll generation
- Server-side cooldown enforcement
- Configurable dice count
- Configurable dice weights
- Score calculation
- Money calculation

Player configuration is generated from:

- base dice configuration
- player settings
- equipped item effects

---

## Economy

Money uses fixed-point storage.

Database stores:

```
MoneyCents INTEGER
```

Current money formula:

```
moneyCents = round(0.0030137 * log10(score)^8.38 * moneyMultiplier)
```

Scores below 100 award no money.

Scores are affected by the player's score multiplier.
Money is affected by the player's money multiplier.

---

## Items

Implemented:

- Item definitions
- Shop items
- Player inventory
- Equip/unequip system
- Maximum equipped item limit
- Item effects
- Generated items
- Item rarity system foundation

Important design decisions:

Shop items:

- Fixed and predictable
- No rarity
- Purchased once

Generated items:

- Dropped from rolls
- Have rarity
- Have generated effects
- Stored as independent PlayerItems

---

## Item Database

Main tables:

### ItemDefinitions

Stores item templates.

Important fields:

- Name
- Description
- Icon
- CostCents
- CanGenerate

Shop items have:

```
CanGenerate = 0
```

Generated loot has:

```
CanGenerate = 1
```

---

### ItemDefinitionEffects

Stores base effects for definitions.

Example:

```
EffectType: weight

EffectData:
{
"face": 5,
"amount": 5
}
```

---

### PlayerItems

Stores owned items.

Important fields:

- UserID
- DefinitionID
- GeneratedName
- Rarity
- IsEquipped

Shop items:

- Rarity = NULL

Generated items:

- Rarity = Common/Uncommon/Rare/Epic/Legendary

---

### PlayerItemEffects

Stores actual effects on owned items.

Generated items copy and modify definition effects.

This means existing loot does not change when item balance changes.

---

# Generated loot:

- Random generated item definitions
- Random rarity selection
- Rarity-based effect scaling
- Generated PlayerItems
- Roll drops

Current rarity levels:

- Common
- Uncommon
- Rare
- Epic
- Legendary

Rarity affects generated item effects through rarity-specific multipliers.

---

# Achievements

Implemented:

- Achievement definitions
- Requirement-based unlock checking
- Roll, score, dice, inventory, item rarity, and configuration achievements
- Persistent unlocks
- Progress/statistics display
- Unlock notifications

---

# Current UI

Implemented:

- Shared Kotomi theme
- Application shell
- Dice game UI
- Profile page
- Inventory display
- Shop UI
- Achievement display

Needs improvement:

- Profile layout
- Better inventory presentation
- Loot popup polish
- Icons/art

---

# Current Game Loop

Current loop:

```
Roll dice
|
Earn money
|
Buy upgrades/items
|
Equip items
|
Improve dice configuration
|
Roll more
|
Find loot
```

The goal is to keep the game simple while allowing interesting builds.

---

# Future Work

High priority:

1. Improve loot popup
2. Add more items
3. Add more generated item types
4. Balance economy and progression
5. Add more achievements
6. Create item/achievement icons
7. Improve profile page
8. Create statistics page

Later:

- Live feed
- More advanced item effects
- More dice values (7s, 8s, etc.)
- More game mechanics
- Large refactor after systems stabilize

---

# Current Development Status

Completed:

- Milestone 1: AI Image Generator
- Milestone 2: Kotomi launcher/platform foundation
- Milestone 3: Authentication system
- Milestone 4: Dice Game foundation

Current focus:

Dice Game testing, expansion, and balancing.

The game is considered functionally playable. Future work is mostly content, polish, balancing, and additional mechanics.

---

# Development Notes

Important architecture preferences:

- Keep business logic out of routes.
- Database access belongs in repositories.
- Services should operate on objects, repositories handle serialization.
- Avoid overengineering before gameplay requirements exist.
- Keep the Dice Game understandable and simple.
