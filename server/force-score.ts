import dotenv from 'dotenv';
dotenv.config();
import { ArxivService } from './src/services/arxiv.service';

async function main() {
  const service = new ArxivService();
  await service.processUnscoredPapers();
  console.log("Forced AI Scoring run complete.");
}

main().catch(console.error);
