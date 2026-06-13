import { ArxivService } from '../services/arxiv.service';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    paper: {
      upsert: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('ArXiv Fetcher Service', () => {
  let arxivService: ArxivService;

  beforeEach(() => {
    jest.clearAllMocks();
    arxivService = new ArxivService();
  });

  it('should fetch papers from arXiv API and save them to the database', async () => {
    // Mock arXiv XML response
    const mockXmlResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <id>http://arxiv.org/abs/2101.00001v1</id>
          <published>2021-01-01T00:00:00Z</published>
          <title>Test Paper Title</title>
          <summary>This is a test abstract.</summary>
          <author><name>John Doe</name></author>
          <author><name>Jane Smith</name></author>
        </entry>
      </feed>
    `;
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockXmlResponse });
    // @ts-ignore
    prisma.paper.upsert.mockResolvedValueOnce({});

    await arxivService.fetchAndSavePapers();

    // Verify axios was called with the correct URL
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('http://export.arxiv.org/api/query'));
    
    // Verify prisma.paper.upsert was called with the parsed data
    expect(prisma.paper.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.paper.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { arxivId: '2101.00001v1' }, // Extracted from URL
      create: expect.objectContaining({
        title: 'Test Paper Title',
        abstract: 'This is a test abstract.',
        authors: 'John Doe, Jane Smith',
      }),
    }));
  });
});
