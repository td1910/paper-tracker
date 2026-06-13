import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Public — list all topics in the catalog
router.get('/', async (req, res) => {
  const topics = await prisma.topic.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(topics);
});

// Get trend stats: Topics with their Top 5 trending papers
router.get('/trends', async (req, res) => {
  const topics = await prisma.topic.findMany({
    include: {
      papers: {
        include: {
          paper: {
            include: {
              _count: { select: { favorites: true } }
            }
          }
        }
      }
    }
  });
  
  const trends = topics.map(t => {
    const topPapers = t.papers
      .map(pt => pt.paper)
      .sort((a, b) => b._count.favorites - a._count.favorites)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.title,
        url: p.url,
        publishedDate: p.publishedDate,
        favoriteCount: p._count.favorites
      }));

    return {
      id: t.id,
      name: t.name,
      topPapers
    };
  });

  res.json(trends);
});

export default router;
