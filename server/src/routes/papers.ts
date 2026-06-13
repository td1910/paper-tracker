import { Router, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { PaperController } from '../controllers/paper.controller';

const router = Router();
const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL || "file:./dev.db" });
const paperController = new PaperController();

// Public routes
// Manually trigger fetch
router.get('/fetch-now', paperController.fetchNow);

// List all fetched papers
router.get('/', paperController.getAllPapers);

// Search papers
router.get('/search', async (req: Request, res) => {
  const { q } = req.query;
  const papers = await prisma.paper.findMany({
    where: {
      OR: [
        { title: { contains: String(q) } },
        { abstract: { contains: String(q) } },
      ]
    }
  });
  res.json(papers);
});

// Get paper details
router.get('/:id', async (req: Request, res) => {
  const { id } = req.params;
  const paper = await prisma.paper.findUnique({
    where: { id: parseInt(id as string) },
    include: {
      favorites: true // Simplified for public view, ideally filter by user if logged in
    }
  });
  res.json(paper);
});

// Protected routes (require authentication)
router.use(authenticate);

// Save favorite
router.post('/:id/favorite', async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    await prisma.favorite.create({
      data: {
        fkUserId: req.userId!,
        fkPaperId: parseInt(id as string)
      }
    });
    res.status(201).json({ message: 'Paper favorited' });
  } catch (error) {
    res.status(400).json({ error: 'Already favorited or paper not found' });
  }
});

// Remove favorite
router.delete('/:id/favorite', async (req: AuthRequest, res) => {
  const { id } = req.params;
  await prisma.favorite.deleteMany({
    where: {
      fkUserId: req.userId,
      fkPaperId: parseInt(id as string)
    }
  });
  res.status(204).send();
});

export default router;
