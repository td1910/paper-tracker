import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import notificationRoutes from '../routes/notifications';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    notification: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.userId = 'test-uuid-123';
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Notifications API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns unread notifications for the current user', async () => {
    const mockNotifications = [
      { id: 1, message: 'New paper found', createdAt: new Date().toISOString(), isRead: false, fkTopicId: 9, paperIds: [1, 2, 3] },
    ];

    // @ts-ignore
    prisma.notification.findMany.mockResolvedValue(mockNotifications);

    const response = await request(app).get('/api/notifications');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockNotifications);
    expect(prisma.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        fkUserId: 'test-uuid-123',
        isRead: false,
      },
    }));
  });

  it('marks a single notification as read', async () => {
    // @ts-ignore
    prisma.notification.updateMany.mockResolvedValue({ count: 1 });

    const response = await request(app).put('/api/notifications/7/read');

    expect(response.status).toBe(204);
    expect(prisma.notification.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        id: 7,
        fkUserId: 'test-uuid-123',
        isRead: false,
      },
      data: { isRead: true },
    }));
  });

  it('marks all unread notifications as read', async () => {
    // @ts-ignore
    prisma.notification.updateMany.mockResolvedValue({ count: 2 });

    const response = await request(app).put('/api/notifications/mark-read');

    expect(response.status).toBe(204);
    expect(prisma.notification.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        fkUserId: 'test-uuid-123',
        isRead: false,
      },
      data: { isRead: true },
    }));
  });
});