import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  const topics = await prisma.topic.findMany({
    where: { fkUserId: req.userId },
  });
  res.json(topics);
});

router.post('/', async (req: AuthRequest, res) => {
  const { name, keywords } = req.body;
  const topic = await prisma.topic.create({
    data: {
      name,
      keywords,
      fkUserId: req.userId!,
    },
  });
  res.status(201).json(topic);
});

router.put('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, keywords } = req.body;
  const topic = await prisma.topic.updateMany({
    where: { id: parseInt(id as string), fkUserId: req.userId },
    data: { name, keywords },
  });
  res.json(topic);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  await prisma.topic.deleteMany({
    where: { id: parseInt(id as string), fkUserId: req.userId },
  });
  res.status(204).send();
});

export default router;
