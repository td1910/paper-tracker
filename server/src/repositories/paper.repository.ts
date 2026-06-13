import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export class PaperRepository {
  async upsertPaper(data: Prisma.PaperCreateInput) {
    return prisma.paper.upsert({
      where: { arxivId: data.arxivId },
      update: {},
      create: data,
    });
  }

  async getAllPapersSortedByDate() {
    return prisma.paper.findMany({
      include: {
        topics: {
          include: { topic: true },
        },
      },
      orderBy: { publishedDate: 'desc' },
    });
  }
}
