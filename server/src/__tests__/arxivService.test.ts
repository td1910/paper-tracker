import { ArxivService } from '../services/arxiv.service';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    topic: {
      findMany: jest.fn(),
    },
    userTopic: {
      findMany: jest.fn(),
    },
    notification: {
      createMany: jest.fn(),
    },
    paper: {
      upsert: jest.fn(),
    },
    paperTopic: {
      create: jest.fn(),
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
    prisma.topic.findMany.mockResolvedValueOnce([
      { id: 1, name: 'AI Agents', keywords: 'agents, llm' }
    ]);
    // @ts-ignore
    prisma.userTopic.findMany.mockResolvedValueOnce([
      { fkUserId: 'user-1' }
    ]);
    // @ts-ignore
    prisma.paper.upsert.mockResolvedValueOnce({ id: 1 });
    // @ts-ignore
    prisma.paperTopic.create.mockResolvedValueOnce({});
    // @ts-ignore
    prisma.notification.createMany.mockResolvedValueOnce({ count: 1 });

    const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return 0 as any;
    });

    await arxivService.fetchAllTopics();

    setTimeoutSpy.mockRestore();

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
    expect(prisma.notification.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: [
        expect.objectContaining({
          fkUserId: 'user-1',
          fkTopicId: 1,
          paperIds: '[1]',
          message: 'We found 1 new papers for AI Agents!',
        })
      ]
    }));
  });
});
