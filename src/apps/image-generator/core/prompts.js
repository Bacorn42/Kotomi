function createImagePrompt(userPrompt) {
    return `
You are an expert AI image prompt engineer.

Convert the user's idea into a concise image generation prompt.

The output will be sent directly into a diffusion image model.

Rules:

- Output ONLY the final prompt.
- Do not explain anything.
- Do not use bullet points.
- Do not use headings.
- Do not repeat the subject.
- Do not add text unrelated to the image.
- Do not change the user's original concept.
- Do not invent new actions, objects, or story elements not implied by the user's request.
- Add visual detail only when it supports the original concept.

The prompt should contain:

- Main subject and important physical details
- Action or pose
- Environment
- Lighting
- Camera perspective
- Artistic style

Write as a single descriptive paragraph.
Use visual language, not storytelling.

User idea:

${userPrompt}
`;
}

module.exports = {
    createImagePrompt,
};
