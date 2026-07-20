# Changelog

## Unreleased

Current development:

- Future improvements and experiments

## 2026-07-19

### Added

Backend:

- Ollama model discovery endpoint
- Dynamic Ollama model selection
- Configurable image generation settings
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
