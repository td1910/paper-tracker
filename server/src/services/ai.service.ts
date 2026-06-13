import { GoogleGenAI, Type } from '@google/genai';
import prisma from '../lib/prisma';

export class AiService {
  async processUnscoredPapers() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('No GEMINI_API_KEY found, skipping AI scoring.');
      return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let hasMore = true;
    while (hasMore) {
      // get papers that have not been scored yet (batch of 20)
      const unscoredPapers = await prisma.paper.findMany({
        where: { aiStatus: 'PENDING' },
        take: 20
      });

      if (unscoredPapers.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`[AI] Scoring batch of ${unscoredPapers.length} papers in ONE Gemini API request...`);

      const paperIds = unscoredPapers.map(p => p.id);

      try {
        const inputData = unscoredPapers.map(p => ({
          id: p.id,
          abstract: p.abstract
        }));

        const prompt = `Analyze the following academic abstracts provided as a JSON array. For each abstract, provide a readability score from 1 to 10 for a general tech audience (where 10 means extremely interesting and easy to understand) and a concise 2-sentence summary in English.
        Return the results as a JSON array of objects, keeping the original "id".
        
        Input Data:
        ${JSON.stringify(inputData)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  aiSummary: { type: Type.STRING },
                  readabilityScore: { type: Type.INTEGER }
                },
                required: ['id', 'aiSummary', 'readabilityScore']
              }
            }
          }
        });

        if (response.text) {
          const parsedArray = JSON.parse(response.text);
          
          let successCount = 0;
          for (const result of parsedArray) {
            await prisma.paper.update({
              where: { id: result.id },
              data: {
                aiSummary: "✨ " + result.aiSummary,
                summary: "✨ " + result.aiSummary, // fallback field
                readabilityScore: result.readabilityScore,
                aiStatus: 'COMPLETED'
              }
            });
            successCount++;
          }
          console.log(`[AI] Successfully scored ${successCount} papers!`);
        }
      } catch (err) {
        console.error(`[AI] Failed batch scoring:`, err);
        // Mark as FAILED so we don't infinite loop on these specific papers
        await prisma.paper.updateMany({
          where: { id: { in: paperIds } },
          data: { aiStatus: 'FAILED' }
        });
        console.log(`[AI] Marked ${paperIds.length} papers as FAILED.`);
      }

      // Add a 5-second delay between batches to respect the 15 Requests Per Minute limit
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log('[AI] All pending papers have been processed.');
  }
}
