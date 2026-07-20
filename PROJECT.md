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

The first application is an AI image generator.

---

# Current Stack

Backend:

- Node.js
- Express
- Socket.IO
- Axios

AI:

- Ollama for local language models
- ComfyUI for image generation
- Z-Image Turbo workflow

Frontend:

- HTML/CSS/JavaScript
- Shared Kotomi theme system

---

# Current Architecture

kotomi/

├── server.js

├── src/
│ ├── routes/
│ │ └── image.js
│ │
│ └── services/
│ ├── ollama.js
│ ├── comfyui.js
│ └── socket.js

├── modules/
│ └── image-generation/
│ ├── generator.js
│ ├── prompts.js
│ └── img_gen_z-image_turbo.json

├── public/
│
│ ├── css/
│ │ ├── theme.css
│ │ ├── base.css
│ │ ├── layout.css
│ │ └── components.css
│
│ ├── index.html
│
│ └── apps/
│ └── image-generator/
│ ├── index.html
│ ├── app.js
│ └── style.css

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
#211c18

Surface:
#302923

Accent:
#e3a35c

Shared CSS:

theme.css

- colors

base.css

- global styles

layout.css

- headers
- containers

components.css

- cards
- buttons
- inputs
- progress bars

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

---

# Current Development Direction

Kotomi is moving toward a modular application platform.

Future applications should be added as modules that use shared:

- services
- UI components
- themes
- navigation
- job/status handling

---

# Next Possible Tasks

## Image Generator

- Add image download button
- Add generation history
- Save generated image metadata
- Add image generation presets
- Add image-to-image support
- Add ComfyUI cancellation button

## Kotomi Platform

- Create homepage app launcher
- Create app registry
- Add application categories
- Add shared navigation

## Future Applications

Ideas:

- Dashboard
- Utility tools
- Automation tools
- Games
- AI assistants

---

# Development Status

Current milestone:

Milestone 1:
AI Image Generator

Status:

Core functionality complete.

Next milestone:

Milestone 2:
Kotomi launcher/dashboard

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

# Running Kotomi

Start server:

npm start

Required services:

Ollama:
http://127.0.0.1:11434

ComfyUI:
http://127.0.0.1:8188

Development:

npm run dev
