# Design Document: In-App Notifications

## 1. Problem Statement
To fulfill the advanced requirement "Gửi thông báo khi có paper mới", we need a way to alert users when the background automated system has successfully discovered and downloaded new papers related to the topics they follow. 

## 2. Proposed Solution
Implement a simple but effective in-app notification system. When the background job fetches new papers, it will insert a "Notification" record for relevant users. When users log in, the Navigation Bar will display a Bell icon with a red notification badge if they have unread alerts.

## 3. Architecture & Technical Details

### Database (`server/prisma/schema.prisma`)
Create a new `Notification` model:
```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  message   String
  isRead    Boolean  @default(false)
  fkUserId  Int
  user      User     @relation(fields: [fkUserId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}
```
*Note: Also add `notifications Notification[]` to the `User` model.*

### Backend Logic
1. **Triggering Notifications:**
   Inside `arxiv.service.ts` (`fetchAllTopics`), after papers are fetched, if the `savedCount` for a topic is greater than 0:
   - Find all users who are following that topic (via `UserTopic`).
   - Create a new `Notification` for them: *"We found X new papers for [Topic Name]!"*.
2. **API Endpoints (`server/src/routes/notifications.ts`):**
   - `GET /api/notifications`: Retrieves the user's unread notifications.
   - `PUT /api/notifications/mark-read`: Marks all unread notifications as `isRead = true`.

### Frontend UI (`client/src/app/page.tsx`)
1. **The Bell Icon:** Add a Bell SVG icon to the top right of the navigation bar (next to the user's email).
2. **The Red Badge:** Create a React `useEffect` that calls `GET /api/notifications` on load. If the returned array has items, display a red dot/number over the bell.
3. **Interaction:** Clicking the bell opens a small dropdown showing the messages, and simultaneously calls `PUT /api/notifications/mark-read` so the red badge disappears.

## 4. Testing Plan
1. Apply database changes.
2. Manually click "Fetch New Papers" on the dashboard.
3. Refresh the page and verify the bell icon in the top right shows a red badge.
4. Click the bell to view the message and ensure the badge clears.
