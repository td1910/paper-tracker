import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { PaperRepository } from '../repositories/paper.repository';
import { validateArxivEntry } from '../validators/arxiv.validator';
import prisma from '../lib/prisma';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

export class ArxivService {
  private paperRepository: PaperRepository;

  constructor() {
    this.paperRepository = new PaperRepository();
  }

  async fetchAndSaveForTopic(topic: { id: number; name: string; keywords: string }, maxResults = 10) {
    try {
      // Build source-agnostic keyword query for arXiv
      const terms = topic.keywords
        .split(',')
        .map(k => `all:%22${encodeURIComponent(k.trim())}%22`)
        .join('+OR+');

      const url = `http://export.arxiv.org/api/query?search_query=${terms}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;
      const response = await axios.get(url);
      const parsedData = parser.parse(response.data);

      let entries = parsedData.feed?.entry || [];
      if (!Array.isArray(entries)) entries = [entries];

      let savedCount = 0;

      for (const rawEntry of entries) {
        try {
          const entry = validateArxivEntry(rawEntry);
          const arxivId = entry.id.split('/abs/')[1];

          let authorList: string[] = [];
          if (Array.isArray(entry.author)) {
            authorList = entry.author.map((a: any) => a.name);
          } else if (entry.author?.name) {
            authorList = [entry.author.name];
          }

          // Save paper WITHOUT ai summary or score. It will be scored eventually.
          const paper = await this.paperRepository.upsertPaper({
            arxivId,
            title: entry.title.replace(/\n/g, ' ').trim(),
            abstract: entry.summary.trim(),
            summary: "⏳ Waiting for AI analysis...", // fallback
            authors: authorList.join(', '),
            publishedDate: new Date(entry.published),
            url: entry.id,
          });

          // Tag paper with this topic
          try {
            await prisma.paperTopic.create({
              data: { fkPaperId: paper.id, fkTopicId: topic.id },
            });
          } catch (e) {
            // Ignore unique constraint violation if it already exists
          }

          savedCount++;
        } catch (validationError) {
          console.warn(`Skipping invalid entry for topic "${topic.name}":`, validationError);
        }
      }

      console.log(`[${topic.name}] Saved ${savedCount} papers.`);
      return savedCount;
    } catch (error) {
      console.error(`Error fetching papers for topic "${topic.name}":`, error);
      throw error;
    }
  }

  // Fetch papers for all topics in the catalog
  async fetchAllTopics(maxResults = 10) {
    const topics = await prisma.topic.findMany();
    for (const topic of topics) {
      try {
        const count = await this.fetchAndSaveForTopic(topic, maxResults);
        
        // Notify followers if new papers were found
        if (count && count > 0) {
          const followers = await prisma.userTopic.findMany({
            where: { fkTopicId: topic.id }
          });
          if (followers.length > 0) {
            await prisma.notification.createMany({
              data: followers.map(f => ({
                fkUserId: f.fkUserId,
                message: `We found ${count} new papers for ${topic.name}!`
              }))
            });
            console.log(`[Notifications] Sent to ${followers.length} users for topic ${topic.name}`);
          }
        }

        // Small delay between requests to be respectful of arXiv rate limits
        await new Promise(r => setTimeout(r, 1000));
      } catch (error) {
        console.error(`Failed to fetch topic "${topic.name}", continuing...`);
      }
    }
  }
}
