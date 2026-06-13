import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get user's followed topics (with topic details)
router.get('/', async (req: AuthRequest, res) => {
  const userTopics = await prisma.userTopic.findMany({
    where: { fkUserId: req.userId },
    include: { topic: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(userTopics);
});

// Follow a topic
router.post('/', async (req: AuthRequest, res) => {
  const { topicId, keywords } = req.body;
  if (!topicId) return res.status(400).json({ error: 'topicId is required' });

  try {
    const userTopic = await prisma.userTopic.create({
      data: {
        fkUserId: req.userId!,
        fkTopicId: topicId,
        keywords: keywords || null,
      },
      include: { topic: true },
    });
    res.status(201).json(userTopic);
  } catch (error) {
    res.status(400).json({ error: 'Already following this topic or topic not found' });
  }
});

// Update personal keywords for a followed topic
router.put('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { keywords } = req.body;
  const updated = await prisma.userTopic.updateMany({
    where: { id: parseInt(id as string), fkUserId: req.userId },
    data: { keywords: keywords || null },
  });
  if (updated.count === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Updated' });
});

// Unfollow a topic
router.delete('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  await prisma.userTopic.deleteMany({
    where: { id: parseInt(id as string), fkUserId: req.userId },
  });
  res.status(204).send();
});

export default router;
