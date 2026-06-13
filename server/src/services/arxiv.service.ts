import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { PaperRepository } from '../repositories/paper.repository';
import { validateArxivEntry } from '../validators/arxiv.validator';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

export class ArxivService {
  private paperRepository: PaperRepository;

  constructor() {
    this.paperRepository = new PaperRepository();
  }

  async fetchAndSavePapers(category = 'cs.AI', maxResults = 10) {
    try {
      const url = `http://export.arxiv.org/api/query?search_query=cat:${category}&sortBy=submittedDate&sortOrder=desc&max_results=${maxResults}`;
      const response = await axios.get(url);
      const xmlData = response.data;

      const parsedData = parser.parse(xmlData);
      
      let entries = parsedData.feed.entry || [];
      if (!Array.isArray(entries)) {
        entries = [entries];
      }

      let savedCount = 0;

      for (const rawEntry of entries) {
        try {
          const entry = validateArxivEntry(rawEntry);
          
          const idUrl = entry.id;
          const arxivId = idUrl.split('/abs/')[1];

          let authorList = [];
          if (Array.isArray(entry.author)) {
            authorList = entry.author.map((a: any) => a.name);
          } else if (entry.author && entry.author.name) {
            authorList = [entry.author.name];
          }
          const authorsString = authorList.join(', ');

          await this.paperRepository.upsertPaper({
            arxivId,
            title: entry.title.replace(/\n/g, ' ').trim(),
            abstract: entry.summary.trim(),
            authors: authorsString,
            publishedDate: new Date(entry.published),
            url: idUrl,
          });
          savedCount++;
        } catch (validationError) {
          console.warn('Skipping invalid arXiv entry:', validationError);
        }
      }
      console.log(`Successfully fetched and saved ${savedCount} papers for ${category}.`);
    } catch (error) {
      console.error('Error fetching papers from arXiv:', error);
      throw error;
    }
  }
}
