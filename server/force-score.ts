import dotenv from 'dotenv';
dotenv.config();
import { AiService } from './src/services/ai.service';

async function main() {
  const service = new AiService();
  console.log("Starting forced batch AI scoring...");
  
  for (let i = 0; i < 3; i++) {
    await service.processUnscoredPapers();
    await new Promise(r => setTimeout(r, 3000)); // wait 3s between batches
  }
  
  console.log("Forced AI Scoring run complete.");
}

main().catch(console.error);
