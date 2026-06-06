# Design Document: Topic Tracking Workflow

## 1. Problem Statement
Users need a way to filter and track research areas. They should not be creating global topics from scratch; instead, they need a system to manage their personal list of "Followed Topics". They need the ability to add a topic to their list, modify it (e.g., attach specific search keywords to it), and remove it.

## 2. Proposed Solution
1. **Master Topics:** The system has a predefined list of core topics (e.g., "AI", "Machine Learning").
2. **User Tracking (Followed Topics):** Users select a Master Topic to follow. 
3. **Customization (Edit):** When a user follows a topic, they can attach *personal keywords* to that specific subscription. For example, they follow the "AI" topic, but add the keyword "Agents". 
4. **Fetching:** The background job uses the Master Topic's arXiv category (e.g., `cs.AI`) AND the user's specific keywords to find papers tailored to them.

## 3. Architecture & Technical Details

### Database Changes (Requires Migration)
- **`MasterTopic`**:
  - `id`: Int
  - `name`: String (e.g., "Artificial Intelligence")
  - `arxivCategory`: String (e.g., "cs.AI")
- **`FollowedTopic` (Replaces old `Topic` table)**:
  - `id`: Int
  - `fkUserId`: String (UUID)
  - `fkMasterTopicId`: Int
  - `keywords`: String (User's personal keywords for this specific topic)

### Backend Changes (`server/src/routes/topics.ts`)
- `GET /api/master-topics`: List available topics to follow.
- `GET /api/topics`: List the user's currently followed topics.
- `POST /api/topics`: Follow a new topic. Body: `{ masterTopicId, keywords }`.
- `PUT /api/topics/:id`: Update personal keywords for a followed topic.
- `DELETE /api/topics/:id`: Unfollow a topic.

### Frontend Changes
- **Dashboard**:
  - Displays "Followed Topics".
  - Button: "Follow New Topic" opens a modal.
  - Modal has a dropdown of `MasterTopics` and a text input for optional personal `keywords`.
  - Tracked topics have "Edit Keywords" and "Unfollow" buttons.

## 4. External Dependencies
- arXiv API for fetching based on category and keywords.

## 5. Testing Plan
- TDD: Write integration tests for the new `FollowedTopic` CRUD operations.
- Verify user A cannot edit user B's followed topics.

## 6. Risks & Alternatives
- **Risk**: Complex fetching logic if many users track the same Master Topic but with different keywords.
- **Alternative**: Fetch all papers for the Master Topic hourly, store them, and then filter them for the user at view-time. (For MVP, we will fetch based on the user's specific query to save storage).
