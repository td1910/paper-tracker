import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Get unread notifications
router.get('/', async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: {
      fkUserId: req.userId!,
      isRead: false
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(notifications);
});

// Mark all as read
router.put('/mark-read', async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: {
      fkUserId: req.userId!,
      isRead: false
    },
    data: { isRead: true }
  });
  res.status(204).send();
});

export default router;
