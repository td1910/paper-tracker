# Design Document: Manage Topics UI

## 1. Problem Statement
Users need a way to add, edit, and remove topics they follow. While the backend API exists, there was no standardized UX for how a user interacts with their subscriptions.

## 2. Industry Standards (How others do it)
Looking at similar platforms (Medium, Feedly, Flipboard, X/Twitter):
1. **Medium / Twitter:** Uses a dedicated `/settings/interests` page with a grid of topic "pills" or cards. Users click a plus/minus icon to toggle them.
2. **Feedly:** Has a left sidebar for navigation, and an "Organize" page to manage feeds, but allows adding feeds via a universal search bar.
3. **Common UX Pattern:** 
   - A dedicated page is best for complex configurations (like adding custom keywords).
   - The main feed sidebar should have a "gear" icon ⚙️ or an "Edit" button next to the section header to route the user there.

## 3. Proposed Solution
We will implement a hybrid approach inspired by Medium:
- **Sidebar Integration:** A small "gear" ⚙️ icon or "Manage" link next to "Topics" in the left sidebar of the dashboard.
- **Dedicated Settings Page (`/settings/topics`):** 
  - **Section A: Your Topics:** Shows currently followed topics as list items. Crucially, it allows users to expand an item to add *custom keywords* (a power-user feature unique to our app).
  - **Section B: Discover Topics:** A grid of remaining available topics from the global catalog with a clear "Follow" button.

## 4. Architecture & Technical Details

### Frontend Changes
- **New Page (`client/src/app/settings/topics/page.tsx`):**
  - Fetch `GET /api/topics` and `GET /api/user-topics` in parallel.
  - Compute `availableTopics` by filtering out IDs present in `userTopics`.
  - Provide `handleFollow`, `handleUnfollow`, and `handleSaveKeywords` functions that call the backend APIs and mutate local state to avoid full page reloads.
- **Dashboard (`client/src/app/page.tsx`):**
  - Add `next/link` integration in the sidebar.

### Backend Changes
- *None required.* The `/api/user-topics` endpoints (POST, PUT, DELETE) are already built and tested.

## 5. External Dependencies
- No new packages.

## 6. Testing Plan
- **Manual Flow:** 
  1. Go to dashboard -> click Manage.
  2. Click "Follow" on a topic -> verify it moves to "Your Topics".
  3. Click "Edit" on a followed topic -> add a keyword -> verify it saves.
  4. Click "Unfollow" -> verify it moves back to "Available Topics".

## 7. Risks & Alternatives
- **Alternative (Modal):** We could put this entire UI in a popup Modal on the dashboard. 
  - *Why rejected:* Modals get cramped when you start typing custom keywords and dealing with long lists of topics. A dedicated settings page provides a cleaner, distraction-free environment.
