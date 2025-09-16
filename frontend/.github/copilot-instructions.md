# GitHub Copilot Instructions

## Project structure
- `src/` contains all app code
- `src/components/` holds reusable UI components
- `src/pages/` contains page-level components
- `tests/` mirrors the `src/` structure

## General Practices
- Use functional components only (no class components)
- Prefer async/await over promises
- Always add JSDoc comments for exported functions
- Write unit tests for all utility functions and components using Jest and React Testing Library
- Use ESLint and Prettier for code formatting and linting
- Always write code in a way that avoids SSR (Server-Side Rendering) errors.
- When styling React components, **use `@emotion/react`** instead of inline styles or other libraries.
- Never directly access `window` or `localStorage` during SSR. Use safe checks (e.g., `typeof window !== "undefined"`).
- Prefer client-side hooks or conditional imports when dealing with browser-only APIs.

## Project Conventions
- Use functional components with hooks (no class components).
- Keep all reusable UI elements in `src/components/`.
- Page-level components go in `src/pages/`.

## Styling
- Import Emotion as:
  ```js
  /** @jsxImportSource @emotion/react */
  import { css } from '@emotion/react';
