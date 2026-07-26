# Changelog

## Unreleased

Current development:

- Expanding Dice Game content and progression
- Adding more items, achievements, and balancing
- Improving Kotomi applications and shared platform features

---

# 2026-07-25

## Added

### Dice Game

Implemented a complete item and progression system:

- Added item definitions
- Added player inventory
- Added item effects
- Added item equip/unequip system
- Added active item limits
- Added shop system
- Added permanent upgrades
- Added generated loot items
- Added item rarity system foundation
- Added random item drops from rolls

Added generated item support:

- Generated items have rarity
- Generated items have scaled effects
- Generated items are stored independently from definitions

Added additional progression systems:

- Configurable dice count
- Configurable dice weights
- Roll cooldown upgrades
- Score and money modifiers
- Maximum equipped item upgrades

---

## Improved

### Dice Game

- Improved profile page
- Added inventory display improvements
- Added shop interface
- Added item detail displays
- Added loot notifications

### Architecture

- Separated item definitions from owned player items
- Kept repository layer responsible for database operations
- Improved reusable item UI components

---

# 2026-07-24

## Added

### Dice Game Foundation

Added core progression systems:

- Player profiles
- Persistent dice configuration
- Server-side cooldown enforcement
- Money system
- Fixed-point currency storage

Implemented:

- Configurable dice count
- Configurable dice weights
- Score calculation
- Roll cooldown validation
- Money calculation and storage

---

# 2026-07-23

## Added

### Dice Game

Created achievement system:

- Achievement definitions
- Achievement checking
- Achievement unlocking
- Achievement progress display
- Achievement notifications

Expanded player profile:

- Roll history
- Top rolls
- Player statistics display

---

# 2026-07-22

## Added

### Dice Game

Created initial Dice Game application:

- Dice rolling backend
- Roll API
- Dice result display
- Roll history persistence
- Basic dice visuals

---

# 2026-07-22

## Added

### Authentication System

Implemented user accounts:

- User registration
- Login/logout
- Password hashing
- Session management
- Authentication middleware

Integrated authentication into applications:

- User-aware application shell
- User-specific image history

---

# 2026-07-21

## Added

### Kotomi Platform

Implemented platform foundations:

- Application launcher
- Application registry
- Shared application shell
- Shared frontend utilities
- Shared styling system

### Image Generator

Added persistence:

- SQLite database integration
- Image history storage
- Image management
- Image deletion
- Image regeneration

---

# 2026-07-19

## Improved

### Image Generator

Added:

- Ollama model discovery
- Configurable generation settings
- Prompt preview
- Improved prompt enhancement
- Better UI components

---

# 2026-07-18

## Added

### Kotomi Foundation

Created initial project:

- Express server
- Frontend application structure
- Kotomi theme
- AI Image Generator
- Ollama integration
- ComfyUI integration
- Socket.IO progress updates
