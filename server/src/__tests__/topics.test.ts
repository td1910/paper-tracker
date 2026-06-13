import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import topicRoutes from '../routes/topics';
import paperRoutes from '../routes/papers'; // Ensure paper routes are tested for search

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    topic: {
      findMany: jest.fn(),
    },
    userTopic: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    paper: {
      findMany: jest.fn(),
    }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

// Setup Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware to bypass JWT for tests
jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.userId = 'test-uuid-123'; // Mock user ID
    next();
  }
}));

app.use('/api/topics', topicRoutes);
app.use('/api/papers', paperRoutes);
// app.use('/api/user/topics', userTopicRoutes); // To be implemented

describe('Topics API (Predefined & Subscriptions)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/topics', () => {
    it('should return a list of all predefined master topics', async () => {
      const mockTopics = [
        { id: 1, name: 'AI Agents', arxivCategory: 'cs.AI' },
        { id: 2, name: 'Stock Prediction', arxivCategory: 'q-fin.ST' }
      ];
      
      // @ts-ignore
      prisma.topic.findMany.mockResolvedValue(mockTopics);

      const response = await request(app).get('/api/topics');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTopics);
      expect(prisma.topic.findMany).toHaveBeenCalledTimes(1);
    });
  });

  // ... (Subscription tests will go here when implemented)
});

describe('Papers API (Search & Filter)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/papers/search', () => {
    it('should search papers by keyword in title or abstract', async () => {
      const mockPapers = [
        { id: 1, title: 'LLM Agents', abstract: 'Autonomous planning...' }
      ];
      
      // @ts-ignore
      prisma.paper.findMany.mockResolvedValue(mockPapers);

      const response = await request(app).get('/api/papers/search?q=planning');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPapers);
      expect(prisma.paper.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'planning' } },
            { abstract: { contains: 'planning' } }
          ]
        })
      }));
    });

    it('should filter papers by a specific topic ID', async () => {
       const mockPapers = [
        { id: 1, title: 'AI in Finance', abstract: '...' }
      ];
      
      // @ts-ignore
      prisma.paper.findMany.mockResolvedValue(mockPapers);

      // We expect a topicId query parameter for filtering
      const response = await request(app).get('/api/papers/search?topicId=2');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPapers);
      expect(prisma.paper.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          topics: {
            some: {
              fkTopicId: 2 // Assuming we filter via relation
            }
          }
        })
      }));
    });
  });
});

