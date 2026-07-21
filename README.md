# Kotomi

> A personal project hub for AI tools, utilities, dashboards, experiments, and creative projects.

Kotomi is a self-hosted personal workspace designed to bring together my various projects into one unified interface, with shared services, persistent storage, and a consistent user experience.

The goal is to create a cozy, extensible environment where tools, experiments, and applications can live together under one consistent experience.

---

## ✨ Current Features

### 🖼️ AI Image Generator

Kotomi's first application is an AI image generation workspace.

Current pipeline:

```
User Prompt
|
v
Local Language Model (Ollama)
|
v
Enhanced Image Prompt
|
v
ComfyUI + Z-Image Turbo
|
v
Generated Image
|
v
SQLite History Storage
```

Features:

- Natural language prompt input
- AI-assisted prompt enhancement
- ComfyUI workflow integration
- Real-time generation progress
- Image preview in browser
- Dynamic local model selection through Ollama
- Configurable generation settings:
    - Resolution
    - Generation steps
- Preview of the final image prompt
- Persistent image generation history
- Image metadata storage
- History gallery
- Image detail viewer
- Download generated images
- Delete generated images
- Regenerate images from previous generations

---

## 🏗️ Architecture

Kotomi is built as a modular web application.

```
Kotomi
|
├── Core Server
│ └── Node.js + Express
│
├── Applications
│ └── Image Generator
│
├── AI Services
│ ├── Ollama
│ └── ComfyUI
│ └── Socket.IO
|
├── Persistence
| └── SQLite Database
│
└── Shared UI System
├── Theme
├── Components
└── Layout
```

The long-term goal is to support additional applications such as:

- Utilities
- Dashboards
- Games
- Automation tools
- Other personal projects

---

## 🎨 Design Philosophy

Kotomi is designed around the idea of a personal digital workspace.

The interface uses a warm dark theme inspired by:

- cozy evening environments
- creative studios
- personal workspaces

The goal is to feel less like an enterprise dashboard and more like a place where projects can grow.

---

## 🛠️ Tech Stack

### Backend

- Node.js
- Express
- Socket.IO
- Axios
- SQLite (better-sqlite3)

### Database

- SQLite
- Local application storage

### Frontend

- HTML
- CSS
- JavaScript

### AI

- Ollama
- Local language model
- ComfyUI
- Z-Image Turbo

---

## 🚀 Installation

### Requirements

You will need:

- Node.js
- npm
- Ollama
- ComfyUI
- SQLite support (included through the application)

---

### Clone the repository

```bash
git clone https://github.com/yourusername/kotomi.git

cd kotomi
```

### Install dependencies

```bash
npm install
```

### Start Kotomi

```bash
npm start
```

The server will start at

```
http://localhost:3000
```

### ⚙️ Configuration

Kotomi currently assumes local services:

Ollama:

```
http://127.0.0.1:11434
```

ComfyUI:

```
http://127.0.0.1:8188
```

These can be customized as the project develops.

## 📌 Roadmap

Planned:

- Image thumbnails
- Image organization
    - Tags
    - Favorites
    - Search
- Image-to-image workflows
- Kotomi application launcher
- App registry system
- User settings
- Additional utilities
- Dashboard applications
- More AI-powered tools
- Games

## 📜 License

MIT License

## 💡 About

Kotomi is a personal software environment built to explore AI, automation, and creative tools while creating a unified home for future projects.

---

A few reasons I like this style:

### It doesn't oversell

You're not pretending this is a polished commercial product. It clearly says "personal workspace."

### It leaves room to grow

If six months from now Kotomi has:

- a weather app
- a game launcher
- a finance dashboard
- a local AI assistant

the README still fits.

### It communicates the _idea_

The interesting thing about Kotomi isn't actually "it runs Z-Image Turbo." Lots of things can do that.

The interesting thing is:

> "A personal digital environment where all my tools live together."

That's the project identity.
