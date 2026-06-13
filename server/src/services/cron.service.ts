import cron from 'node-cron';
import { ArxivService } from './arxiv.service';
import { AiService } from './ai.service';
import prisma from '../lib/prisma';

export function startCronJobs() {
  console.log('[Cron] Initializing background jobs...');

  // Schedule a cron job to fetch new papers every 12 hours (at minute 0 past every 12th hour)
  cron.schedule('0 */12 * * *', async () => {
    console.log('[Cron] Triggering automatic paper fetch for all topics...');
    const arxivService = new ArxivService();
    const aiService = new AiService();
    try {
      // We can fetch up to 10 papers per topic for the automated job
      await arxivService.fetchAllTopics(10);
      console.log('[Cron] Automatic paper fetch completed successfully.');
      
      // Trigger AI scoring job
      aiService.processUnscoredPapers().catch(console.error);
    } catch (error) {
      console.error('[Cron] Error during automatic paper fetch:', error);
    }
  });

  // Schedule a daily job at midnight to retry FAILED papers
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Resetting FAILED AI tasks to PENDING...');
    try {
      await prisma.paper.updateMany({
        where: { aiStatus: 'FAILED' },
        data: { aiStatus: 'PENDING' }
      });
      const aiService = new AiService();
      aiService.processUnscoredPapers().catch(console.error);
    } catch (error) {
      console.error('[Cron] Error during daily AI retry:', error);
    }
  });
}
