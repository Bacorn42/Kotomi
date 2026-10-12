# Kotomi

> A personal project hub for AI tools, utilities, games, and creative experiments.

Kotomi is a self-hosted personal workspace that brings independent applications together under one platform. It provides shared authentication, persistence, UI components, theming, and common services so individual projects can grow without having to rebuild the same foundations.

Part personal toolset and part software engineering playground, Kotomi explores modular application architecture while providing a cozy environment for practical tools and experiments.

## Current Applications

### 🖼️ AI Image Generator

A local AI image generation workspace built around Ollama and ComfyUI.

Features:

- Natural-language prompt input and AI-assisted prompt enhancement
- ComfyUI workflow integration
- Real-time generation progress
- Configurable resolution, steps, and seed
- Generated image history with user-specific ownership
- Image previews and detail viewer
- Download, delete, and regenerate actions

### 🎲 Dice Game

A progression-based game built around rolling dice, earning money, purchasing upgrades, and collecting items.

Features:

- Configurable dice counts and weights
- Roll cooldowns and score calculation
- Persistent player progress and money
- Shop, permanent upgrades, and inventory
- Equippable items with gameplay effects
- Generated loot with rarity-scaled effects
- Achievements, roll history, and player statistics

Development focuses on gameplay balance, additional content, testing, and polish.

### 💬 Chat

A conversational interface for locally hosted language models through Ollama.

Features:

- Streaming model responses
- Persistent conversations and messages
- Conversation creation, selection, deletion, and renaming
- Configurable model and generation settings
- Adjustable context window and temperature
- Context-usage meter with usage information preserved between sessions

## Platform Features

Kotomi provides shared infrastructure for its applications:

- Application launcher and shared application shell
- User accounts and authentication
- Cookie-based session management
- SQLite persistence
- Shared theme and reusable frontend components
- Modular backend services and application-specific logic

Applications can build on these systems instead of implementing common functionality independently.

## Design Philosophy

Kotomi is designed as a **comfortable evening workspace**: a personal digital environment with a warm, dark theme inspired by cozy workspaces and creative studios.

The goal is to make the platform feel personal and inviting rather than like an enterprise dashboard. Applications should remain modular, understandable, and useful without accumulating unnecessary complexity.

## Tech Stack

- **Backend:** Node.js, Express, Socket.IO
- **Frontend:** HTML, CSS, JavaScript ES modules
- **Database:** SQLite via `better-sqlite3`
- **HTTP client:** Axios
- **Language models:** Ollama
- **Image generation:** ComfyUI and a Z-Image Turbo workflow

## Installation

### Requirements

- Node.js and npm
- Ollama, with a compatible model downloaded
- ComfyUI configured with the required image-generation workflow and dependencies, if using the Image Generator

### Setup

Install dependencies:

    npm install

Start Kotomi:

    npm start

Open the application at [http://localhost:3000](http://localhost:3000).

### Local Services

The default local service endpoints are:

- Ollama: `http://127.0.0.1:11434`
- ComfyUI: `http://127.0.0.1:8188`

Ensure the relevant services and models are running and configured before using their associated applications.

## Project Structure

The project separates shared platform infrastructure from individual applications.

- `src/apps/` — application-specific backend modules
- `src/database/` — database connection and schema
- `src/middleware/` — shared middleware
- `src/services/` — shared services
- `public/apps/` — frontend applications
- `public/css/` and `public/js/` — shared frontend assets

Applications use routes, services, and repositories to separate HTTP handling, business logic, and database access. The Dice Game also separates its core game logic from its supporting systems.

## Roadmap

Kotomi will evolve based on practical use and experimentation.

Potential areas of development include:

- Improving existing applications through testing and real-world use
- Expanding the Dice Game's content and mechanics
- Adding utilities, dashboards, and creative tools
- Improving shared platform components where useful
- Exploring new application ideas

Features are added as needs emerge rather than to satisfy a predetermined checklist.

## License

MIT License.

## About

Kotomi is a personal software environment for exploring AI tools, game development, application architecture, and creative software projects.

The broader goal is to create a place where independent projects can share a common identity, design, and infrastructure while remaining free to evolve on their own.
