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

export default router;
