import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function parseNotificationPaperIds(paperIds: unknown) {
  if (Array.isArray(paperIds)) return paperIds;
  if (typeof paperIds !== 'string' || paperIds.trim() === '') return null;

  try {
    return JSON.parse(paperIds);
  } catch {
    return null;
  }
}

// Get unread notifications
router.get('/', async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: {
      fkUserId: req.userId!,
      isRead: false
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(notifications.map(notification => ({
    ...notification,
    paperIds: parseNotificationPaperIds(notification.paperIds),
  })));
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

// Mark a single notification as read
router.put('/:id/read', async (req: AuthRequest, res) => {
  const notificationId = parseInt(String(req.params.id), 10);

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      fkUserId: req.userId!,
      isRead: false,
    },
    data: { isRead: true },
  });

  return res.status(204).send();
});

export default router;
