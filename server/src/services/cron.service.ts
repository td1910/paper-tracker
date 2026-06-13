import cron from 'node-cron';
import { ArxivService } from './arxiv.service';

export function startCronJobs() {
  console.log('[Cron] Initializing background jobs...');

  // Schedule a cron job to fetch new papers every 12 hours (at minute 0 past every 12th hour)
  cron.schedule('0 */12 * * *', async () => {
    console.log('[Cron] Triggering automatic paper fetch for all topics...');
    const arxivService = new ArxivService();
    try {
      // We can fetch up to 10 papers per topic for the automated job
      await arxivService.fetchAllTopics(10);
      console.log('[Cron] Automatic paper fetch completed successfully.');
    } catch (error) {
      console.error('[Cron] Error during automatic paper fetch:', error);
    }
  });
}
