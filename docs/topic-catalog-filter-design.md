# Design Document: Topic Catalog & Paper Feed Filter

## 1. Problem Statement

Currently, the paper feed only fetches from a single hardcoded arXiv category (`cs.AI`),
and the UI has no way to filter papers by topic. Users have no way to browse or narrow
the feed to their areas of interest.

## 2. Proposed Solution

1. **Shared Topic Catalog** — A system-seeded list of topics (e.g. "Machine Learning",
   "Computer Vision"), each with generic `keywords` used to search any data source.
2. **User Follows** — Authenticated users can follow topics they care about.
3. **Multi-topic Fetcher** — On "Fetch New Papers", the server fetches papers for
   *every topic* in the catalog and tags each paper with its matching topic(s).
4. **Sidebar Filter** — The dashboard shows a topic sidebar; clicking checkboxes
   filters the paper feed instantly (client-side).

---

## 3. Architecture & Technical Details

### Database Changes (Migration required)

**Repurpose `Topic` → shared catalog:**

| Field | Type | Notes |
|---|---|---|
| `id` | Int PK | auto-increment |
| `name` | String unique | e.g. "Machine Learning" |
| `keywords` | String | Comma-separated, source-agnostic |
| `description` | String? | Short UI label |
| `createdAt` | DateTime | |

**Add `UserTopic` — user follow relationship:**

| Field | Type | Notes |
|---|---|---|
| `id` | Int PK | auto-increment |
| `fkUserId` | String | FK -> User |
| `fkTopicId` | Int | FK -> Topic |
| `keywords` | String? | Extra personal keywords |
| `createdAt` | DateTime | |
| *(unique)* | | [fkUserId, fkTopicId] — can't follow twice |

> The old `Topic` table had `fkUserId` (user-owned). That field is dropped.
> Existing topic rows in `dev.db` will be cleared by `prisma db push`.

**`PaperTopic` stays the same** — links papers to topics after fetch.

---

### Seeded Topics

| Name | Keywords |
|---|---|
| Artificial Intelligence | `artificial intelligence, AI agents, reasoning, planning` |
| Machine Learning | `machine learning, deep learning, neural networks, optimization` |
| Natural Language Processing | `natural language processing, large language models, transformers` |
| Computer Vision | `computer vision, image recognition, object detection` |
| Reinforcement Learning | `reinforcement learning, reward learning, policy optimization` |
| Quantum Computing | `quantum computing, quantum algorithms, qubits` |
| Robotics | `robotics, robot learning, manipulation, locomotion` |
| Multimodal AI | `multimodal, vision language model, image text, VLM` |

---

### Backend Changes

**New / updated routes:**

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/topics` | Public | List all topics in catalog |
| `GET` | `/api/user-topics` | Yes | User's followed topics |
| `POST` | `/api/user-topics` | Yes | Follow a topic { topicId, keywords? } |
| `PUT` | `/api/user-topics/:id` | Yes | Update personal keywords |
| `DELETE` | `/api/user-topics/:id` | Yes | Unfollow a topic |
| `GET` | `/api/papers` | Public | All papers, now includes topic tags |
| `GET` | `/api/papers/fetch-now` | Public | Fetch for all topics |

**ArXiv fetcher update (`arxiv.service.ts`):**
- New method: `fetchAndSaveForTopic(topic)` — builds arXiv query from topic `keywords`
  using `all:{keyword}+OR+all:{keyword}` format
- New method: `fetchAllTopics()` — loops all topics with a 1s delay between requests
- After saving each paper -> inserts into `PaperTopic` (skipDuplicates: true)

**Paper repository update:**
- `getAllPapersSortedByDate()` now includes `topics -> topic` so the API response
  carries topic metadata per paper.

---

### Frontend Changes

**Layout:** Split into sidebar + feed

```
+-----------------------------------------+
|  Navbar (Paper Tracker)         [Login] |
+--------------+--------------------------+
|              |  Latest Papers           |
|  Topics      |  +------------------+   |
|  [ ] All     |  | PaperCard        |   |
|  [ ] AI      |  +------------------+   |
|  [ ] ML      |  +------------------+   |
|  [ ] NLP     |  | PaperCard        |   |
|  [ ] CV      |  +------------------+   |
|  [ ] RL      |                         |
|  ...         |                         |
+--------------+--------------------------+
```

**State changes in `page.tsx`:**
- Fetch `GET /api/topics` on mount -> populate sidebar
- `selectedTopicIds: Set<number>` — which checkboxes are checked
- Filter logic: if nothing selected -> show all; else show papers where
  `paper.topics.some(pt => selectedTopicIds.has(pt.fkTopicId))`
- Filtering is **client-side** (instant, no loading spinner)

---

## 4. External Dependencies

- No new libraries needed.
- arXiv API (already in use) — now called once per topic (~8 calls on fetch).

---

## 5. Testing Plan

- Manual: Click "Fetch New Papers" -> verify papers appear per topic in sidebar filter.
- API smoke test: `curl /api/topics` returns 8 topics; `curl /api/papers` returns
  papers with `topics` array populated.
- Existing tests: `topics.test.ts` needs updating to reflect new schema.

---

## 6. Risks & Alternatives

| Risk | Mitigation |
|---|---|
| `prisma db push` drops existing paper data | Acceptable in dev — just re-fetch after migration |
| arXiv rate limiting across 8 topics | 1s delay between topic fetches |
| Paper duplication across topics | PaperTopic.skipDuplicates + Paper.upsert on arxivId |
| Keywords too generic -> noisy results | Can tune per-topic keywords later without schema change |

**Why client-side filtering?** Instant UX, no loading state. Can switch to server-side
`?topicId=` filter later without UI changes.
