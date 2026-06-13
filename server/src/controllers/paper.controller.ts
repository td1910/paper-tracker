import { Request, Response } from 'express';
import { ArxivService } from '../services/arxiv.service';
import { PaperRepository } from '../repositories/paper.repository';
import { AiService } from '../services/ai.service';

export class PaperController {
  private arxivService: ArxivService;
  private paperRepository: PaperRepository;
  private aiService: AiService;

  constructor() {
    this.arxivService = new ArxivService();
    this.paperRepository = new PaperRepository();
    this.aiService = new AiService();
  }

  fetchNow = async (req: Request, res: Response) => {
    try {
      // Fetch papers for ALL topics in the catalog
      await this.arxivService.fetchAllTopics();
      
      // Trigger AI scoring for newly fetched papers
      this.aiService.processUnscoredPapers().catch(console.error);

      res.json({ message: 'Fetch triggered successfully for all topics' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch papers' });
    }
  };

  getAllPapers = async (req: Request, res: Response) => {
    try {
      const papers = await this.paperRepository.getAllPapersSortedByDate();
      res.json(papers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve papers' });
    }
  };
}
