# Design Document: Favorite (Heart) Feature

## 1. Problem Statement
Users need the ability to bookmark or "Favorite" specific papers they want to read later. The backend currently has routes to POST/DELETE a favorite, but the frontend has no UI for it. Additionally, there is no way for the frontend to quickly know *which* papers are currently favorited by the logged-in user to render the Heart icon correctly.

## 2. Proposed Solution
1. **The Heart Icon:** Add a Heart button (outline for unfavorited, solid red for favorited) to the top-right corner of the `PaperCard` component.
2. **State Management:** When a user clicks the heart, it instantly toggles the local state (Optimistic UI) and makes a background API call to `POST` or `DELETE` the favorite.
3. **My Favorites Filter:** Add a "My Favorites" toggle to the left sidebar on the Dashboard. When clicked, the feed only shows papers the user has favorited.

## 3. Architecture & Technical Details

### Backend Changes
- The `POST /api/papers/:id/favorite` and `DELETE /api/papers/:id/favorite` routes already exist.
- **New Endpoint Required:** We need to add `GET /api/papers/my-favorites` (protected by auth). This endpoint will query the `Favorite` table and return an array of `fkPaperId`s that belong to the current user.

### Frontend Changes
- **Dashboard (`page.tsx`):**
  - Add state: `const [favoritedPaperIds, setFavoritedPaperIds] = useState<Set<number>>(new Set())`.
  - Add state: `const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)`.
  - In `useEffect`, if `token` exists, fetch `/api/papers/my-favorites` and populate the `Set`.
  - Pass `favoritedPaperIds.has(paper.id)` to each `PaperCard`.
  - Update `filteredPapers` logic to handle the `showFavoritesOnly` condition.
- **PaperCard (`PaperCard.tsx`):**
  - Add `isFavorited` and `onToggleFavorite` props.
  - Render a SVG Heart icon button. Clicking it fires `onToggleFavorite(paper.id, !isFavorited)`.

## 4. Testing Plan
- Ensure a logged-out user cannot see the Heart icon (or clicking it prompts login).
- Click the heart -> verify it turns red and sends `POST`.
- Reload page -> verify the heart stays red.
- Click "My Favorites" filter in the sidebar -> verify only red-heart papers show up.
