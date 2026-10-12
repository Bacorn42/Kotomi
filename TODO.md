# Kotomi TODO

## Current Priorities

- [ ] Test existing applications through regular use and fix discovered bugs
- [ ] Expand and balance the Dice Game where needed
- [ ] Add automated tests for important game logic
- [ ] Improve shared infrastructure when a concrete need arises

Avoid adding features without a demonstrated use case.

---

## Chat

**Status:** Feature-complete for current needs.

- [x] Ollama-powered chat with streaming responses
- [x] Persistent conversations and messages
- [x] Conversation creation, selection, deletion, and renaming
- [x] Configurable model and generation settings
- [x] Context-usage meter
- [x] Persist context usage between conversation sessions

Future improvements should be driven by actual usage.

---

## Dice Game

**Status:** Playable; ongoing testing, balancing, content, and polish.

### Testing

- [ ] Set up Jest
- [ ] Add core game logic unit tests
- [ ] Add service tests
- [ ] Add repository/database tests
- [ ] Add route/API tests where valuable

### Content

- [ ] Add more shop items
- [ ] Add more generated item definitions
- [ ] Add more item effect types
- [ ] Add more achievements
- [ ] Create item icons
- [ ] Create achievement icons
- [ ] Add more dice skins

### Balance

- [ ] Balance money progression
- [ ] Balance item prices and upgrade costs
- [ ] Balance item effects and rarity scaling
- [ ] Simulate economy and progression
- [ ] Tune early-game progression

### Systems and Mechanics

- [ ] Explore more complex item effects
- [ ] Improve negative-effect balancing
- [ ] Consider item families and set bonuses
- [ ] Explore additional dice modifiers
- [ ] Consider higher dice values (7, 8, 9, etc.)
- [ ] Consider additional item categories

### UI and Quality of Life

- [ ] Improve profile page
- [ ] Add a dedicated statistics page
- [ ] Improve inventory and item details
- [ ] Polish loot notifications
- [ ] Improve mobile layout
- [ ] Consider a live feed

---

## AI Image Generator

### Quality of Life

- [ ] Add image thumbnails
- [ ] Add generation presets
- [ ] Add tags and favorites
- [ ] Add image search
- [ ] Improve image viewing
- [ ] Improve download naming and metadata

### Advanced Generation

- [ ] Add image-to-image support
- [ ] Add reference image upload
- [ ] Add denoise control
- [ ] Add batch generation
- [ ] Support additional ComfyUI workflows

### Generation Management

- [ ] Improve generation cancellation
- [ ] Add generation job/status tracking
- [ ] Add job management and queuing
- [ ] Store workflow configurations

---

## Authentication and Security

- [ ] Add session cleanup
- [ ] Add password change
- [ ] Add account deletion
- [ ] Review security requirements before public deployment

---

## Kotomi Platform

### Launcher

- [ ] Add application categories
- [ ] Improve application discovery
- [ ] Add application descriptions and metadata
- [ ] Add application icons

### Shared Systems

- [ ] Add shared settings where useful
- [ ] Add notification/status handling where needed
- [ ] Expand reusable frontend components
- [ ] Consolidate common API utilities

### Database and Maintenance

- [ ] Add database migrations
- [ ] Add database backup/export support
- [ ] Add cleanup tools for unused generated files

---

## Refactoring

Address these as concrete needs arise rather than undertaking a large refactor prematurely.

- [ ] Review service/repository boundaries
- [ ] Reduce duplicated frontend code
- [ ] Improve error handling
- [ ] Standardize validation where appropriate
- [ ] Improve configuration management

---

## Future Applications

Ideas, not commitments:

- Dashboard
- Utility tools
- Automation tools
- Additional games
- AI assistants

---

## Long-Term Ideas

- [ ] Explore public deployment support
- [ ] Improve multi-user support where needed
- [ ] Consider application permissions
- [ ] Consider a plugin/module system
- [ ] Explore additional AI-powered applications
