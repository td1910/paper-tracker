import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import paperRoutes from '../routes/papers';
import { ArxivService } from '../services/arxiv.service';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    paper: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

// Mock Arxiv Service
jest.mock('../services/arxiv.service');

const app = express();
app.use(express.json());

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.userId = 'test-uuid-123';
    next();
  }
}));

app.use('/api/papers', paperRoutes);

describe('Papers API Feed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/papers', () => {
    it('should return a list of papers sorted by published date', async () => {
      const mockPapers = [
        { id: 1, title: 'Latest Paper', publishedDate: '2023-10-01T00:00:00.000Z' },
        { id: 2, title: 'Older Paper', publishedDate: '2023-09-01T00:00:00.000Z' }
      ];
      // @ts-ignore
      prisma.paper.findMany.mockResolvedValue(mockPapers);

      const response = await request(app).get('/api/papers');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPapers);
      expect(prisma.paper.findMany).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: { publishedDate: 'desc' }
      }));
    });
  });

  describe('GET /api/papers/fetch-now', () => {
    it('should manually trigger the arXiv fetcher and return success', async () => {
      jest.spyOn(ArxivService.prototype, 'fetchAllTopics').mockResolvedValueOnce();

      const response = await request(app).post('/api/papers/fetch-now');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Fetch triggered successfully for all topics' });
      expect(ArxivService.prototype.fetchAllTopics).toHaveBeenCalledTimes(1);
    });
  });
});
