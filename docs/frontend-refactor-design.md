# Design Document: Frontend Refactoring & Testing

## 1. Problem Statement
Currently, the main Paper Feed is located at `/dashboard`, while the homepage (`/`) is just a static landing page. Additionally, the frontend lacks a testing framework (TDD) and could benefit from a more scalable, standard folder structure as the application grows.

## 2. Proposed Solution
1. **Move Feed to Homepage (`/`)**: Replace the static landing page with the dynamic Paper Feed. Unauthenticated users will be redirected to `/login`.
2. **Frontend Structure**: Adopt a feature-based or standard component architecture to separate UI elements from business logic.
3. **Frontend Testing**: Introduce `Jest` and `@testing-library/react` to enforce TDD on the frontend, ensuring UI components render correctly and handle logic properly.

## 3. Architecture & Technical Details

### Folder Structure (Best Practices)
We will restructure `client/src` to look like this:
- `src/app/`: Next.js App Router pages (`/`, `/login`, `/register`).
- `src/components/ui/`: Reusable, "dumb" components (e.g., `Button`, `Input`).
- `src/components/papers/`: Domain-specific components (e.g., `PaperCard`, `PaperFeed`).
- `src/lib/`: Utilities, API clients.
- `src/__tests__/`: Unit and integration tests for components.

### Routing Changes
- **`app/page.tsx`**: Will now contain the logic currently in `dashboard/page.tsx`. It will check for authentication; if the user is logged in, it shows the feed. If not, it redirects to `/login` (or shows a public preview, but strict redirect is easier for now).
- **`app/dashboard/`**: This route will be removed, as its purpose has moved to the root.

### Testing Setup
- Install: `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
- Configuration: Add `jest.config.js` and `jest.setup.ts` to the `client` directory.

## 4. External Dependencies
- React Testing Library & Jest for the client side.

## 5. Testing Plan
- **TDD approach**: Write a test for `PaperCard` (ensuring it displays title, authors, and truncates abstract) *before* moving it.
- Write a test for the `Home` feed page to ensure it fetches papers and renders cards.

## 6. Risks & Alternatives
- **Risk**: Redirecting unauthenticated users from `/` to `/login` means we no longer have a public marketing landing page.
- **Alternative**: We keep `/` as a landing page for logged-out users, but if a user *is* logged in, we render the Feed directly on `/` instead of redirecting them to `/dashboard`. **(Recommended Approach)**
