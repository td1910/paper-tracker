import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL || "file:./dev.db" });

export class PaperRepository {
  async upsertPaper(data: Prisma.PaperCreateInput) {
    return prisma.paper.upsert({
      where: { arxivId: data.arxivId },
      update: {}, // Do nothing if it exists
      create: data,
    });
  }

  async getAllPapersSortedByDate() {
    return prisma.paper.findMany({
      orderBy: {
        publishedDate: 'desc'
      }
    });
  }
}
