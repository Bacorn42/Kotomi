# Changelog

## Unreleased

Current development:

- Building additional Kotomi applications
- Expanding shared platform features
- Future improvements and experiments

---

## 2026-07-22

### Added

Authentication System:

Backend:

- Added user account system
- Added Users database table
- Added Sessions database table
- Added password hashing and salting
- Added registration endpoint
- Added login endpoint
- Added logout endpoint
- Added current user endpoint
- Added authentication middleware
- Added session-based authentication

Frontend:

- Added registration page
- Added login page
- Added authentication-aware application shell
- Added logged-in user display
- Added logout controls
- Added login/register navigation

Image Generator:

- Added user ownership for generated images
- Restricted image history to authenticated users
- Updated image operations to use UserID

---

### Improved

Kotomi Platform:

- Added shared application shell
- Improved consistent Kotomi branding across applications
- Added centralized frontend utilities
- Converted frontend JavaScript to ES modules
- Improved shared CSS organization

Image Generator:

- Added authentication-aware initialization
- Improved handling of logged-out users

---

### Refactored

Frontend:

- Consolidated shared Kotomi JavaScript functionality
- Reduced repeated application setup code
- Standardized application loading process

Backend:

- Integrated user identity into application workflows
- Connected image data with user accounts

---

## 2026-07-21

### Added

Backend:

- SQLite database integration
- Database initialization and schema system
- Image repository layer for database operations
- Image generation history API
- Persistent storage of generated image metadata
- Image deletion endpoint

Frontend:

- Image history gallery
- Image details modal
- Generated image download support
- Regenerate image from previous generation

Database:

- Added Images table for generated image records
- Stored:
    - Prompt
    - Enhanced prompt
    - Resolution
    - Steps
    - Seed
    - Model
    - Creation date

### Improved

Image Generator:

- Generation history is now persisted between sessions
- Improved image management workflow
- Improved progress bar smoothness during generation

### Refactored

Backend:

- Added repository layer for database access
- Separated image persistence logic from generation logic

---

## 2026-07-19

### Added

Backend:

- Ollama model discovery endpoint
- Dynamic Ollama model selection
- Configurable image generation settings:
    - Image resolution
    - Generation steps

- Prompt generation temperature configuration
- Real-time prompt events through Socket.IO

Frontend:

- Ollama model selection dropdown
- Image generation settings controls
- Display of the final prompt sent to the image model
- Improved image generator UI components

### Improved

AI Image Generation:

- Improved prompt enhancement template for better diffusion prompts
- Added better preservation of user intent during prompt expansion
- Tuned prompt generation consistency

### Refactored

Backend:

- Improved Ollama service organization
- Separated reusable image generation logic into modules

---

## 2026-07-18

### Added

Backend:

- Express server
- Ollama integration
- ComfyUI integration
- Socket.IO progress updates

Frontend:

- Image generator interface
- Warm Kotomi theme
- Shared UI components
