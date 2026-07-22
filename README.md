# Kotomi

> A personal project hub for AI tools, utilities, dashboards, experiments, and creative projects.

Kotomi is a self-hosted personal workspace designed to bring together various projects into one unified interface, with shared services, persistent storage, authentication, and a consistent user experience.

The goal is to create a cozy, extensible environment where tools, experiments, and applications can live together under one consistent platform.

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
- User-specific image history
- Image metadata storage
- History gallery
- Image detail viewer
- Download generated images
- Delete generated images
- Regenerate images from previous generations

---

### 👤 User Accounts

Kotomi includes a local account system for personal and multi-user deployments.

Features:

- Username/password accounts
- Password hashing with salts
- Cookie-based sessions
- User-specific application data
- Authentication-aware applications

The system is designed for personal hosting and can be expanded for public deployments in the future.

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
├── Authentication
│ ├── Users
│ └── Sessions
│
├── AI Services
│ ├── Ollama
│ ├── ComfyUI
│ └── Socket.IO
│
├── Persistence
│ └── SQLite Database
│
└── Shared Platform
    ├── Theme
    ├── Components
    ├── Layout
    └── Application Shell
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

Stores:

- User accounts
- Sessions
- Application data
- Image generation history

### Frontend

- HTML
- CSS
- JavaScript
- ES Modules

### AI

- Ollama
- Local language models
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

The server will start at:

```
http://localhost:3000
```

---

## ⚙️ Configuration

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

---

## 📌 Roadmap

Planned:

### Image Generator

- Image thumbnails
- Image organization:
    - Tags
    - Favorites
    - Search

- Image-to-image workflows
- Multiple ComfyUI workflows
- Generation queue improvements

### Platform

- Application categories
- Application metadata
- Shared settings system
- Notifications/status system
- Additional reusable components

### Applications

- Dice Game
- Dashboard applications
- Utility tools
- Automation tools
- More AI-powered tools

---

## 📜 License

MIT License

---

## 💡 About

Kotomi is a personal software environment built to explore AI, automation, and creative tools while creating a unified home for future projects.

The goal is not just to build individual tools, but to create a place where tools can grow together:

- shared identity
- shared design
- shared services
- shared data systems

Kotomi is a personal digital workspace where projects can live.
