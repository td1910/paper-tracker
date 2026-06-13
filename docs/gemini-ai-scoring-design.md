# Design Document: AI Readability Scoring (Gemini API)

## 1. Problem Statement
To fulfill the advanced requirement (+2 points) of "Chấm điểm paper đáng đọc" (Score paper readability) and replace the current "dummy" AI summary, we need to integrate the real Google Gemini API. When a new paper is fetched from arXiv, Gemini should read the abstract and generate both a concise summary and a readability score.

## 2. Proposed Solution
1. **Database Update:** Add a `readabilityScore` (Int) field to the `Paper` schema so the score is persisted.
2. **AI Processing:** Use the official `@google/genai` SDK in the backend `ArxivService`. When processing a new paper, prompt `gemini-2.5-flash` to return a JSON object containing `aiSummary` and `score`.
3. **Frontend Display:** Update `PaperCard.tsx` to prominently display the Readability Score (e.g. out of 10) next to the AI Summary.

## 3. Architecture & Technical Details

### Database (`server/prisma/schema.prisma`)
- Add `readabilityScore Int?` to `model Paper`.
- Run `npx prisma db push` to apply changes.

### Backend (`server/src/services/arxiv.service.ts`)
- Install `@google/genai`.
- Import and initialize `GoogleGenAI` using `process.env.GEMINI_API_KEY`.
- In `fetchPapersForTopic()`, after extracting the XML metadata:
  - Create a batch or iterate through papers.
  - Call Gemini:
    ```javascript
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this academic abstract. Give a readability/interest score from 1 to 10 for a general tech audience, and a 2-sentence summary in Vietnamese.\nAbstract: ${abstract}`,
      config: { responseMimeType: "application/json" }
    });
    ```
  - Parse the JSON and save `aiSummary` and `readabilityScore` via Prisma.

### Frontend (`client/src/components/papers/PaperCard.tsx`)
- Render the `readabilityScore` if it exists. We can use a sleek color-coded badge (e.g., Green for >8, Yellow for >5, Red for <5).

## 4. Testing Plan
1. Ensure `.env` has a valid `GEMINI_API_KEY`.
2. Click "Fetch New Papers" on the dashboard.
3. Wait for the server to call Gemini.
4. Verify the new papers appear in the UI with authentic AI summaries and a score badge (e.g., "AI Score: 8/10").
