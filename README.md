# Kotomi

> A personal project hub for AI tools, utilities, dashboards, experiments, and creative projects.

Kotomi is a self-hosted personal workspace designed to bring different applications together under one unified platform.

The goal is to create a cozy, extensible environment where tools and experiments can share:

- authentication
- storage
- UI components
- themes
- common services

Kotomi is both a personal tool platform and a portfolio project exploring modern application architecture.

---

# Current Applications

## 🖼️ AI Image Generator

Kotomi's first application is an AI image generation workspace.

Pipeline:

User prompt → optional AI enhancement → ComfyUI generation → saved image history

Features:

- Natural language prompt input
- AI-assisted prompt enhancement using Ollama
- ComfyUI workflow integration
- Real-time generation progress
- Local model selection
- Configurable generation settings:
    - Resolution
    - Generation steps
- Final prompt preview
- Persistent image history
- User-specific image ownership
- Image detail viewer
- Download images
- Delete images
- Regenerate previous generations

---

## 🎲 Dice Game

Kotomi's second application is a progression-based dice game.

Players roll dice, earn money, buy upgrades, collect items, and improve their setup over time.

Features:

- Configurable dice system
- Variable dice count
- Variable dice weights
- Roll cooldown system
- Score calculation
- Persistent player profiles
- Money system
- Shop
- Permanent upgrades
- Inventory
- Equippable items
- Item effects
- Generated loot drops
- Item rarity system
- Achievements
- Roll history

Future development will focus on:

- More items
- More achievements
- Balancing progression
- More dice mechanics
- Additional polish

---

# Platform Features

Kotomi provides shared functionality for all applications.

Current platform systems:

- Application launcher
- Shared application shell
- Shared theme system
- User accounts
- Authentication
- Session management
- SQLite persistence
- Reusable frontend components

Future applications can use these shared systems instead of rebuilding common functionality.

---

# Architecture

Kotomi is built as a modular Node.js application.

Major components:

## Core Server

- Node.js
- Express
- Socket.IO

## Applications

Each application is built as a module that can use shared Kotomi functionality.

Current applications:

- Image Generator
- Dice Game

## Authentication

Includes:

- User accounts
- Password hashing
- Session-based authentication
- User-owned application data

## Persistence

Uses SQLite for local storage.

Currently stores:

- Users
- Sessions
- Generated images
- Player data
- Game progress

## AI Services

Uses local AI tools:

- Ollama
- ComfyUI
- Z-Image Turbo

---

# Design Philosophy

Kotomi is designed as a personal digital workspace.

The design goal is:

"Comfortable evening workspace"

The interface uses a warm dark theme inspired by:

- creative studios
- personal workspaces
- cozy environments

The goal is to create something that feels personal rather than like an enterprise dashboard.

---

# Tech Stack

## Backend

- Node.js
- Express
- Socket.IO
- Axios
- SQLite (better-sqlite3)

## Frontend

- HTML
- CSS
- JavaScript
- ES Modules

## Database

- SQLite

## AI

- Ollama
- Local language models
- ComfyUI
- Z-Image Turbo

---

# Installation

Requirements:

- Node.js
- npm
- Ollama
- ComfyUI

Install dependencies:

    npm install

Start Kotomi:

    npm start

The application runs locally at:

    http://localhost:3000

---

# Configuration

Kotomi currently assumes local AI services.

Default services:

Ollama:

    http://127.0.0.1:11434

ComfyUI:

    http://127.0.0.1:8188

These settings can be expanded as the project develops.

---

# Roadmap

## Image Generator

Future improvements:

- Image thumbnails
- Tags
- Favorites
- Search
- Image-to-image workflows
- Additional ComfyUI workflows
- Generation queue improvements

## Dice Game

Future improvements:

- More items
- More achievements
- Better statistics
- Live feed
- More dice mechanics
- Better balancing
- More visual polish

## Platform

Future improvements:

- Application categories
- Application metadata
- Shared settings
- Notifications/status system
- More reusable components
- Additional applications

---

# License

MIT License

---

# About

Kotomi is a personal software environment built to explore:

- AI tools
- automation
- game development
- application architecture
- creative software projects

The goal is not just to create individual tools, but to create a place where projects can grow together through:

- shared identity
- shared design
- shared services
- shared data systems

Kotomi is a personal digital workspace where projects can live.
