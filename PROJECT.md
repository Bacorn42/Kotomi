# Kotomi Project Notes

## Overview

Kotomi is a personal project hub built with Node.js and Express.

The goal is to create a central home for:

- AI tools
- utilities
- dashboards
- games
- experiments

The first application is an AI image generator.

---

# Current Stack

Backend:

- Node.js
- Express
- Socket.IO

AI:

- Ollama running Gemma 2B
- ComfyUI running Z-Image Turbo workflow

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
│ └── prompts.js

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

User enters prompt

↓

Prompt sent to Ollama/Gemma

↓

Gemma expands prompt for Z-Image Turbo

↓

Prompt sent to ComfyUI

↓

ComfyUI generates image

↓

Image returned to browser

Current working:

- Prompt enhancement
- ComfyUI workflow execution
- Image retrieval
- WebSocket progress updates

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
✅ Image generation
✅ Ollama integration
✅ ComfyUI integration
✅ WebSocket progress
✅ Shared theme

---

# Next Possible Tasks

- Improve image generator UI
- Add generation history
- Add image download button
- Add enhanced prompt display
- Create Kotomi homepage launcher
- Add app registry
- Add dashboards/utilities

# Development Status

Last session:

Implemented:

- Initial Express server
- AI image generation pipeline
- Ollama prompt enhancement
- ComfyUI integration
- Socket.IO progress tracking
- Shared Kotomi UI theme

Current milestone:

Milestone 1:
AI Image Generator

Next milestone:

Milestone 2:
Kotomi launcher/dashboard

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
