# Kotomi Project Notes

## Overview

Kotomi is a personal project hub built with Node.js and Express.

The goal is to create a central home for:

- AI tools
- utilities
- dashboards
- games
- experiments

Kotomi is intended to be both:

- a personal tool server that runs on the user's machine
- a portfolio project demonstrating modern software development practices

Applications are built as modules that share:

- authentication
- UI components
- themes
- navigation
- common services

The first application is an AI image generator.

---

# Current Stack

Backend:

- Node.js
- Express
- Socket.IO
- Axios
- SQLite (better-sqlite3)

Database:

- SQLite
- Local application database
- Stores:
    - user accounts
    - sessions
    - application data
    - image generation history

Authentication:

- Username/password accounts
- Password hashing with salts
- Cookie-based sessions

AI:

- Ollama for local language models
- ComfyUI for image generation
- Z-Image Turbo workflow

Frontend:

- HTML/CSS/JavaScript
- ES modules
- Shared Kotomi theme system
- Shared application shell

---

# Current Architecture

kotomi/

├── server.js

├── src/
│
│ ├── routes/
│ │ ├── image.js
│ │ └── auth.js
│ │
│ ├── services/
│ │ ├── ollama.js
│ │ ├── comfyui.js
│ │ ├── socket.js
│ │ └── auth.js
│ │
│ ├── middleware/
│ │ └── auth.js
│ │
│ ├── database/
│ │ ├── db.js
│ │ └── schema.sql
│ │
│ └── repositories/
│ ├── imageRepository.js
│ ├── userRepository.js
│ └── sessionRepository.js
│
├── modules/
│ └── image-generation/
│ ├── generator.js
│ ├── prompts.js
│ └── img_gen_z-image_turbo.json
│
├── public/
│
│ ├── css/
│ │ ├── theme.css
│ │ ├── base.css
│ │ ├── layout.css
│ │ ├── components.css
│ │ ├── app-shell.css
│ │ └── kotomi.css
│
│ ├── js/
│ │ ├── kotomi.js
│ │ ├── appShell.js
│ │ └── appRegistry.js
│
│ ├── index.html
│
│ ├── login/
│ │ ├── index.html
│ │ └── app.js
│
│ ├── register/
│ │ ├── index.html
│ │ └── app.js
│
│ └── apps/
│ └── image-generator/
│ ├── index.html
│ ├── app.js
│ └── style.css

Database files:

- SQLite database file is generated locally
- Database contents are excluded from git
- Schema is stored separately in schema.sql

---

# Database

Kotomi uses SQLite for local persistence.

Purpose:

- Store generated image history
- Preserve generation metadata
- Store user accounts
- Store login sessions
- Enable future features such as:
    - search
    - favorites
    - tags
    - analytics
    - user statistics

Current schema:

## Users

Stores application accounts.

Fields:

- UserID
- Username
- PasswordHash
- PasswordSalt
- CreatedDate

Users authenticate using username/password.

Passwords are never stored directly.

---

## Sessions

Stores active login sessions.

Fields:

- SessionID
- UserID
- CreatedDate
- ExpiresDate

Sessions are stored server-side and linked through cookies.

---

## Images

Stores one row per generated image.

Fields:

- ImageID
- UserID
- Filename
- Prompt
- EnhancedPrompt
- Width
- Height
- Steps
- Seed
- Model
- CreatedDate

Images belong to users.

Repository:

src/repositories/imageRepository.js

Current operations:

- save()
- getById()
- getRecent()
- deleteById()

Operations require UserID so users only access their own images.

---

# Authentication System

Kotomi currently supports:

## Registration

Users provide:

- username
- password
- password confirmation

Requirements:

- Username must be unique
- Password length: 8-64 characters

---

## Login

Users authenticate with:

- username
- password

Successful login creates a session cookie.

---

## Current authentication flow

Browser:

```
Login page
    |
    v
POST /api/auth/login
    |
    v
Validate password
    |
    v
Create session
    |
    v
Set cookie
```

Application pages:

```
Page loads

    |
    v

GET /api/auth/me

    |
    v

Current user available
```

---

# Working Features

## Image Generator

Flow:

User enters prompt and settings

↓

Prompt sent to Ollama (optional enhancement)

↓

Enhanced prompt displayed in frontend

↓

Prompt sent to ComfyUI

↓

ComfyUI generates image

↓

Image returned to browser

↓

Metadata saved to SQLite

Current working:

- Prompt enhancement
- Ollama model selection
- Ollama model discovery through API
- Configurable generation settings:
    - Resolution
    - Steps

- Random seed generation
- ComfyUI workflow execution
- Image retrieval
- WebSocket progress updates
- Display of final prompt sent to image model
- Image generation history
- SQLite storage of generation metadata
- User-specific image history
- History gallery
- Image details modal
- Download generated images
- Delete images from history
- Regenerate images from previous generations
- Authentication requirement

---

# AI Prompt Generation

Kotomi uses Ollama as a prompt enhancement layer.

Current behavior:

User prompt:

"A cute green frog jumping onto a tree"

↓

Language model transforms it into a detailed image prompt.

Prompt generation is tuned using:

- Custom prompt template
- Temperature setting

Current temperature:

0.42

Goal:

Generate consistent, visually useful prompts while preserving the user's original intent.

---

# UI Theme

Kotomi uses a warm dark theme.

Design goal:

"Comfortable evening workspace"

Colors:

Background:

```
#211c18
```

Surface:

```
#302923
```

Accent:

```
#e3a35c
```

Shared CSS:

## theme.css

- colors

## base.css

- global styles

## layout.css

- headers
- containers

## components.css

- cards
- buttons
- inputs
- progress bars
- modal components

## app-shell.css

- shared application layout

---

# Shared Application Shell

All Kotomi applications use:

- shared header
- Kotomi branding
- authentication awareness
- common styling
- shared JavaScript utilities

The shell provides:

- Kotomi logo
- application title/subtitle
- login/register links when logged out
- username display when logged in
- logout action

---

# Current State

Working:

✅ Express server
✅ Image generation pipeline
✅ Ollama integration
✅ Dynamic model selection
✅ ComfyUI integration
✅ Socket.IO progress updates
✅ Prompt preview
✅ Shared UI theme
✅ Shared application shell
✅ SQLite database integration
✅ User accounts
✅ Password hashing
✅ Sessions
✅ Login/logout
✅ User-specific image ownership
✅ Image history persistence
✅ Image management UI

---

# Current Development Direction

Kotomi is moving toward a modular application platform.

Future applications should be added as modules that use shared:

- services
- UI components
- themes
- navigation
- authentication
- job/status handling

Applications should avoid rebuilding platform functionality.

---

# Next Possible Tasks

## Image Generator

- Improve image organization:
    - Tags
    - Favorites
    - Search

- Add image thumbnails
- Add image generation presets
- Add image-to-image support
- Add reference image upload
- Add denoise control
- Add seed control
- Add batch generation support
- Support multiple ComfyUI workflows
- Improve generation queue handling

---

## Authentication

Future improvements:

- Session cleanup
- Password change
- Account deletion
- Database migrations
- Improved security for public deployment

---

## Kotomi Platform

- Improve launcher
- Expand app registry
- Add application categories
- Add shared settings system
- Add notifications/status system
- Add reusable application layouts

---

## Future Applications

Ideas:

- Dice Game
- Dashboard
- Utility tools
- Automation tools
- Games
- AI assistants

---

# Development Status

Completed milestones:

## Milestone 1:

AI Image Generator

Status:

Complete.

---

## Milestone 2:

Kotomi Launcher / Platform

Status:

Complete.

Includes:

- homepage launcher
- app registry foundation
- shared shell
- shared theme system

---

## Milestone 3:

Authentication and User System

Status:

Complete.

Includes:

- user accounts
- sessions
- login/register pages
- authentication-aware UI
- user-owned application data

---

Next milestone:

## Milestone 4:

Additional Kotomi Applications

Candidate:

Dice Game

---

# Recent Changes

## 2026-07-19

Implemented:

- Ollama model discovery and selection
- Configurable image resolution and steps
- Prompt preview through Socket.IO
- Improved AI prompt generation template
- Ollama temperature tuning
- Refactored AI service handling

Explored:

- ComfyUI cancellation support
- Future job management architecture

---

## 2026-07-21

Implemented:

- Added SQLite database support
- Created database initialization and schema system
- Added image repository layer
- Stored generated image metadata
- Added image history API
- Added history gallery UI
- Added image detail modal
- Added image download support
- Added image deletion
- Added image regeneration from history

Improved:

- Smoothed generation progress display
- Added persistent image generation workflow

---

## 2026-07-22

Implemented:

### Kotomi Platform

- Added homepage launcher
- Added shared application shell
- Added shared header rendering
- Added centralized CSS loading
- Converted frontend JavaScript to ES modules
- Added shared Kotomi frontend utilities

### Authentication

- Added Users table
- Added Sessions table
- Added password hashing and salting
- Added registration endpoint
- Added login endpoint
- Added session creation
- Added logout support
- Added current user endpoint
- Added login/register pages
- Added authentication-aware header UI

### Image Generator

- Added UserID ownership to images
- Restricted image history to logged-in users
- Added authentication checks
- Updated frontend initialization for login state

Improved:

- Kotomi branding consistency
- Header account controls
- Shared component styling

---

# Running Kotomi

Start server:

```
npm start
```

Required services:

Ollama:

```
http://127.0.0.1:11434
```

ComfyUI:

```
http://127.0.0.1:8188
```

Development:

```
npm run dev
```
