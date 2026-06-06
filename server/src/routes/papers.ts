import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// List papers for user's topics
router.get('/', async (req: AuthRequest, res) => {
  const papers = await prisma.paper.findMany({
    where: {
      topics: {
        some: {
          topic: {
            fkUserId: req.userId
          }
        }
      }
    },
    include: {
      topics: {
        include: {
          topic: true
        }
      }
    },
    orderBy: {
      publishedDate: 'desc'
    }
  });
  res.json(papers);
});

// Search papers
router.get('/search', async (req: AuthRequest, res) => {
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
router.get('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const paper = await prisma.paper.findUnique({
    where: { id: parseInt(id as string) },
    include: {
      favorites: {
        where: { fkUserId: req.userId }
      }
    }
  });
  res.json(paper);
});

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
